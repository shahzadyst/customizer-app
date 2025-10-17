import { useState } from "react";
import { useLoaderData, useNavigate, useNavigation, useSearchParams } from "react-router";
import { authenticate } from "../shopify.server";
import { getCustomizer } from "../models/customizer.server";
import {
  getFonts,
  addFont,
  deleteFont,
  getColors,
  addColor,
  deleteColor,
  getSizes,
  addSize,
  deleteSize,
  getUsageTypes,
  addUsageType,
  deleteUsageType,
  getAcrylicShapes,
  addAcrylicShape,
  deleteAcrylicShape,
  getBackboardColors,
  addBackboardColor,
  deleteBackboardColor,
  getHangingOptions,
  addHangingOption,
  deleteHangingOption,
  getPricings,
} from "../models/signage.server";

import FontSettings from "../components/settings/FontSettings";
import ColorSettings from "../components/settings/ColorSettings";
import SizeSettings from "../components/settings/SizeSettings";
import PricingSettings from "../components/settings/PricingSettings";
import UsageTypeSettings from "../components/settings/UsageTypeSettings";
import AcrylicShapeSettings from "../components/settings/AcrylicShapeSettings";
import BackboardColorSettings from "../components/settings/BackboardColorSettings";
import HangingOptionSettings from "../components/settings/HangingOptionSettings";

export const loader = async ({ request, params }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shopDomain = session.shop;

    if (!shopDomain) {
      throw new Response("Unauthorized", { status: 401 });
    }

    const { id } = params;
    const customizer = await getCustomizer(shopDomain, id);

    if (!customizer) {
      throw new Response("Customizer not found", { status: 404 });
    }

    const customizerId = customizer.customizerId || null;

    const [fonts, colors, sizes, usageTypes, acrylicShapes, backboardColors, hangingOptions, pricings] = await Promise.all([
      getFonts(shopDomain, customizerId),
      getColors(shopDomain, customizerId),
      getSizes(shopDomain, customizerId),
      getUsageTypes(shopDomain, customizerId),
      getAcrylicShapes(shopDomain, customizerId),
      getBackboardColors(shopDomain, customizerId),
      getHangingOptions(shopDomain, customizerId),
      getPricings(shopDomain, customizerId),
    ]);

    return {
      shop: shopDomain,
      customizer,
      options: {
        fonts,
        colors,
        sizes,
        usageTypes,
        acrylicShapes,
        backboardColors,
        hangingOptions,
      },
      pricings,
    };
  } catch (error) {
    console.error('=== LOADER ERROR ===');
    console.error('Error details:', error);
    throw error;
  }
};

export const action = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");
  const shop = session.shop;
  const { id } = params;

  const customizer = await getCustomizer(shop, id);
  if (!customizer) {
    return Response.json({ error: "Customizer not found" }, { status: 404 });
  }

  const customizerId = customizer.customizerId || null;

  try {
    switch (action) {
      case "addFont": {
        await addFont(shop, {
          name: formData.get("name"),
          fontFamily: formData.get("fontFamily"),
          pricingId: formData.get("pricingId") || null,
          minHeightSmallest: formData.get("minHeightSmallest") ? parseFloat(formData.get("minHeightSmallest")) : null,
          minHeightUppercase: formData.get("minHeightUppercase") ? parseFloat(formData.get("minHeightUppercase")) : null,
        }, customizerId);
        return { success: true };
      }

      case "deleteFont": {
        await deleteFont(shop, formData.get("id"));
        return { success: true };
      }

      case "addColor": {
        await addColor(shop, {
          name: formData.get("name"),
          hex: formData.get("hex"),
        }, customizerId);
        return { success: true };
      }

      case "deleteColor": {
        await deleteColor(shop, formData.get("id"));
        return { success: true };
      }

      case "addSize": {
        await addSize(shop, {
          label: formData.get("label"),
          multiplier: parseFloat(formData.get("multiplier")),
        }, customizerId);
        return { success: true };
      }

      case "deleteSize": {
        await deleteSize(shop, formData.get("id"));
        return { success: true };
      }

      case "addUsageType": {
        await addUsageType(shop, {
          name: formData.get("name"),
        }, customizerId);
        return { success: true };
      }

      case "deleteUsageType": {
        await deleteUsageType(shop, formData.get("id"));
        return { success: true };
      }

      case "addAcrylicShape": {
        await addAcrylicShape(shop, {
          name: formData.get("name"),
          imageUrl: formData.get("imageUrl"),
        }, customizerId);
        return { success: true };
      }

      case "deleteAcrylicShape": {
        await deleteAcrylicShape(shop, formData.get("id"));
        return { success: true };
      }

      case "addBackboardColor": {
        await addBackboardColor(shop, {
          name: formData.get("name"),
          hex: formData.get("hex"),
        }, customizerId);
        return { success: true };
      }

      case "deleteBackboardColor": {
        await deleteBackboardColor(shop, formData.get("id"));
        return { success: true };
      }

      case "addHangingOption": {
        await addHangingOption(shop, {
          name: formData.get("name"),
        }, customizerId);
        return { success: true };
      }

      case "deleteHangingOption": {
        await deleteHangingOption(shop, formData.get("id"));
        return { success: true };
      }

      default:
        return Response.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error(`Error performing ${action}:`, error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};

export default function CustomizerSettings() {
  const loaderData = useLoaderData();
  const { customizer, options, pricings } = loaderData;
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentSection = searchParams.get("section") || "fonts";
  const [searchQuery, setSearchQuery] = useState("");

  const isLoading = navigation.state === "loading";

  const sections = [
    { id: "fonts", label: "Fonts", icon: "📝" },
    { id: "colors", label: "Colors", icon: "🎨" },
    { id: "sizes", label: "Sizes", icon: "📏" },
    { id: "pricing", label: "Pricing", icon: "💰" },
    { id: "usageTypes", label: "Usage Types", icon: "🏷️" },
    { id: "acrylicShapes", label: "Acrylic Shapes", icon: "⬡" },
    { id: "backboardColors", label: "Backboard Colors", icon: "🎨" },
    { id: "hangingOptions", label: "Hanging Options", icon: "🔗" },
  ];

  const filteredSections = sections.filter(section =>
    section.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderSection = () => {
    switch (currentSection) {
      case "fonts":
        return <FontSettings fonts={options.fonts} pricings={pricings} />;
      case "colors":
        return <ColorSettings colors={options.colors} />;
      case "sizes":
        return <SizeSettings sizes={options.sizes} />;
      case "pricing":
        return <PricingSettings pricings={pricings} customizerId={customizer.customizerId} />;
      case "usageTypes":
        return <UsageTypeSettings usageTypes={options.usageTypes} />;
      case "acrylicShapes":
        return <AcrylicShapeSettings acrylicShapes={options.acrylicShapes} />;
      case "backboardColors":
        return <BackboardColorSettings backboardColors={options.backboardColors} />;
      case "hangingOptions":
        return <HangingOptionSettings hangingOptions={options.hangingOptions} />;
      default:
        return <FontSettings fonts={options.fonts} pricings={pricings} />;
    }
  };

  if (isLoading) {
    return (
      <s-page
        heading="Loading..."
        backAction={{ onAction: () => navigate("/app/customizers") }}
      >
        <s-stack direction="block" gap="large">
          <s-section>
            <s-box padding="base" background="surface">
              <s-stack direction="block" gap="base">
                <div style={{ height: '20px', background: '#e0e0e0', borderRadius: '4px', width: '40%' }} />
                <div style={{ height: '40px', background: '#e0e0e0', borderRadius: '4px' }} />
                <div style={{ height: '40px', background: '#e0e0e0', borderRadius: '4px' }} />
              </s-stack>
            </s-box>
          </s-section>
        </s-stack>
      </s-page>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{
        width: '280px',
        background: '#f9fafb',
        borderRight: '1px solid #e5e7eb',
        padding: '24px 16px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>
        <div style={{ marginBottom: '24px' }}>
          <s-text size="small" color="subdued" style={{ display: 'block', marginBottom: '8px' }}>
            {customizer.name}
          </s-text>
          <s-text weight="semibold" size="large">Settings</s-text>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        <div>
          <div style={{ marginBottom: '16px' }}>
            <s-text size="small" weight="semibold" color="subdued" style={{ display: 'block', marginBottom: '8px' }}>
              CORE SETUP
            </s-text>
            {filteredSections.slice(0, 4).map((section) => (
              <div
                key={section.id}
                onClick={() => setSearchParams({ section: section.id })}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  marginBottom: '4px',
                  background: currentSection === section.id ? '#e0e7ff' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s'
                }}
              >
                <span>{section.icon}</span>
                <s-text weight={currentSection === section.id ? 'semibold' : 'regular'}>
                  {section.label}
                </s-text>
              </div>
            ))}
          </div>

          <div>
            <s-text size="small" weight="semibold" color="subdued" style={{ display: 'block', marginBottom: '8px' }}>
              SIGN COMPONENTS
            </s-text>
            {filteredSections.slice(4).map((section) => (
              <div
                key={section.id}
                onClick={() => setSearchParams({ section: section.id })}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  marginBottom: '4px',
                  background: currentSection === section.id ? '#e0e7ff' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s'
                }}
              >
                <span>{section.icon}</span>
                <s-text weight={currentSection === section.id ? 'semibold' : 'regular'}>
                  {section.label}
                </s-text>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, background: '#ffffff' }}>
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <s-button
            onClick={() => navigate("/app/customizers")}
            variant="plain"
            size="small"
          >
            ← Back
          </s-button>
          <s-text size="large" weight="semibold">
            {sections.find(s => s.id === currentSection)?.label || "Settings"}
          </s-text>
        </div>

        <div style={{ padding: '32px' }}>
          {renderSection()}
        </div>
      </div>
    </div>
  );
}
