import { useState, useEffect } from "react";
import { useLoaderData, useFetcher, useNavigate, useRevalidator } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
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
} from "../models/signage.server";

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop;
  const { id } = params;

  console.log('Loading customizer settings for ID:', id, 'Shop:', shopDomain);

  const customizer = await getCustomizer(shopDomain, id);

  if (!customizer) {
    console.error('Customizer not found:', id);
    throw new Response("Customizer not found", { status: 404 });
  }

  console.log('Found customizer:', customizer);

  const customizerId = customizer.customizerId || null;

  console.log('Using customizerId for queries:', customizerId);

  const [fonts, colors, sizes, usageTypes, acrylicShapes, backboardColors, hangingOptions] = await Promise.all([
    getFonts(shopDomain, customizerId),
    getColors(shopDomain, customizerId),
    getSizes(shopDomain, customizerId),
    getUsageTypes(shopDomain, customizerId),
    getAcrylicShapes(shopDomain, customizerId),
    getBackboardColors(shopDomain, customizerId),
    getHangingOptions(shopDomain, customizerId),
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
  };
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
          fontFamily: formData.get("font_family"),
          fontUrl: formData.get("font_url") || null,
          displayOrder: parseInt(formData.get("display_order")) || 0,
          isActive: true,
        }, customizerId);
        return { success: true };
      }

      case "addColor": {
        await addColor(shop, {
          name: formData.get("name"),
          hexValue: formData.get("hex_value"),
          displayOrder: parseInt(formData.get("display_order")) || 0,
          isActive: true,
        }, customizerId);
        return { success: true };
      }

      case "addSize": {
        await addSize(shop, {
          name: formData.get("name"),
          width: parseFloat(formData.get("width")) || null,
          height: parseFloat(formData.get("height")) || null,
          unit: formData.get("unit") || "inches",
          priceModifier: parseFloat(formData.get("price_modifier")) || 0,
          displayOrder: parseInt(formData.get("display_order")) || 0,
          isActive: true,
        }, customizerId);
        return { success: true };
      }

      case "addUsageType": {
        await addUsageType(shop, {
          name: formData.get("name"),
          description: formData.get("description") || null,
          priceModifier: parseFloat(formData.get("price_modifier")) || 0,
          displayOrder: parseInt(formData.get("display_order")) || 0,
          isActive: true,
        }, customizerId);
        return { success: true };
      }

      case "addAcrylicShape": {
        await addAcrylicShape(shop, {
          name: formData.get("name"),
          description: formData.get("description") || null,
          priceModifier: parseFloat(formData.get("price_modifier")) || 0,
          displayOrder: parseInt(formData.get("display_order")) || 0,
          isActive: true,
        }, customizerId);
        return { success: true };
      }

      case "addBackboardColor": {
        await addBackboardColor(shop, {
          name: formData.get("name"),
          hexValue: formData.get("hex_value"),
          priceModifier: parseFloat(formData.get("price_modifier")) || 0,
          displayOrder: parseInt(formData.get("display_order")) || 0,
          isActive: true,
        }, customizerId);
        return { success: true };
      }

      case "addHangingOption": {
        await addHangingOption(shop, {
          name: formData.get("name"),
          description: formData.get("description") || null,
          priceModifier: parseFloat(formData.get("price_modifier")) || 0,
          displayOrder: parseInt(formData.get("display_order")) || 0,
          isActive: true,
        }, customizerId);
        return { success: true };
      }

      case "deleteFont": {
        await deleteFont(shop, formData.get("id"));
        return { success: true };
      }

      case "deleteColor": {
        await deleteColor(shop, formData.get("id"));
        return { success: true };
      }

      case "deleteSize": {
        await deleteSize(shop, formData.get("id"));
        return { success: true };
      }

      case "deleteUsageType": {
        await deleteUsageType(shop, formData.get("id"));
        return { success: true };
      }

      case "deleteAcrylicShape": {
        await deleteAcrylicShape(shop, formData.get("id"));
        return { success: true };
      }

      case "deleteBackboardColor": {
        await deleteBackboardColor(shop, formData.get("id"));
        return { success: true };
      }

      case "deleteHangingOption": {
        await deleteHangingOption(shop, formData.get("id"));
        return { success: true };
      }

      default:
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};

export default function CustomizerSettings() {
  const { customizer, options } = useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const [activeSection, setActiveSection] = useState("fonts");

  useEffect(() => {
    if (fetcher.data?.success && fetcher.state === "idle") {
      revalidator.revalidate();
    }
  }, [fetcher.data, fetcher.state, revalidator]);

  const tabStyle = {
    padding: '12px 20px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s'
  };

  const activeTabStyle = {
    ...tabStyle,
    color: '#111827',
    borderBottomColor: '#111827'
  };

  const renderItemsList = (items, actionPrefix, fields) => (
    <s-stack direction="block" gap="base">
      {items.length === 0 && (
        <s-text color="subdued">No items added yet</s-text>
      )}
      {items.map((item) => (
        <s-box
          key={item._id.toString()}
          padding="base"
          borderWidth="base"
          borderRadius="base"
        >
          <s-stack direction="inline" gap="base" alignment="space-between">
            <s-stack direction="block" gap="tight">
              <s-text weight="semibold">{item.name}</s-text>
              {fields.map((field) => (
                item[field] !== undefined && item[field] !== null && (
                  <s-text key={field} size="small" color="subdued">
                    {field}: {item[field].toString()}
                  </s-text>
                )
              ))}
            </s-stack>
            <s-stack direction="inline" gap="tight">
              <fetcher.Form method="post">
                <input type="hidden" name="action" value={`delete${actionPrefix}`} />
                <input type="hidden" name="id" value={item._id.toString()} />
                <s-button
                  size="small"
                  variant="destructive"
                  type="submit"
                >
                  Delete
                </s-button>
              </fetcher.Form>
            </s-stack>
          </s-stack>
        </s-box>
      ))}
    </s-stack>
  );

  return (
    <s-page heading={`Configure: ${customizer.name}`}>
      <s-section>
        <s-stack direction="block" gap="base">
          <s-stack direction="inline" gap="base" alignment="flex-end">
            <s-button variant="secondary" onClick={() => navigate('/app/customizers')}>
              Back to Customizers
            </s-button>
          </s-stack>

          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '24px' }}>
            <button
              style={activeSection === "fonts" ? activeTabStyle : tabStyle}
              onClick={() => setActiveSection("fonts")}
            >
              Fonts
            </button>
            <button
              style={activeSection === "colors" ? activeTabStyle : tabStyle}
              onClick={() => setActiveSection("colors")}
            >
              Colors
            </button>
            <button
              style={activeSection === "sizes" ? activeTabStyle : tabStyle}
              onClick={() => setActiveSection("sizes")}
            >
              Sizes
            </button>
            <button
              style={activeSection === "usageTypes" ? activeTabStyle : tabStyle}
              onClick={() => setActiveSection("usageTypes")}
            >
              Usage Types
            </button>
            <button
              style={activeSection === "acrylicShapes" ? activeTabStyle : tabStyle}
              onClick={() => setActiveSection("acrylicShapes")}
            >
              Acrylic Shapes
            </button>
            <button
              style={activeSection === "backboardColors" ? activeTabStyle : tabStyle}
              onClick={() => setActiveSection("backboardColors")}
            >
              Backboard Colors
            </button>
            <button
              style={activeSection === "hangingOptions" ? activeTabStyle : tabStyle}
              onClick={() => setActiveSection("hangingOptions")}
            >
              Hanging Options
            </button>
          </div>
        </s-stack>
      </s-section>

      {activeSection === "fonts" && (
        <s-section heading="Manage Fonts">
          <s-stack direction="block" gap="large">
            <fetcher.Form method="post">
              <input type="hidden" name="action" value="addFont" />
              <s-stack direction="block" gap="base">
                <s-text-field
                  label="Font Name"
                  name="name"
                  required
                  placeholder="e.g., Arial, Roboto"
                />
                <s-text-field
                  label="Font Family (CSS)"
                  name="font_family"
                  required
                  placeholder="e.g., 'Arial', sans-serif"
                />
                <s-text-field
                  label="Font URL (Optional)"
                  name="font_url"
                  placeholder="https://fonts.googleapis.com/..."
                />
                <s-text-field
                  label="Display Order"
                  name="display_order"
                  type="number"
                  value="0"
                />
                <s-button type="submit" variant="primary">
                  Add Font
                </s-button>
              </s-stack>
            </fetcher.Form>

            <s-divider />

            <s-heading level={3}>Available Fonts</s-heading>
            {renderItemsList(options.fonts, "Font", ["fontFamily"])}
          </s-stack>
        </s-section>
      )}

      {activeSection === "colors" && (
        <s-section heading="Manage Colors">
          <s-stack direction="block" gap="large">
            <fetcher.Form method="post">
              <input type="hidden" name="action" value="addColor" />
              <s-stack direction="block" gap="base">
                <s-text-field
                  label="Color Name"
                  name="name"
                  required
                  placeholder="e.g., Red, Blue"
                />
                <s-text-field
                  label="Hex Value"
                  name="hex_value"
                  required
                  placeholder="#FF0000"
                />
                <s-text-field
                  label="Display Order"
                  name="display_order"
                  type="number"
                  value="0"
                />
                <s-button type="submit" variant="primary">
                  Add Color
                </s-button>
              </s-stack>
            </fetcher.Form>

            <s-divider />

            <s-heading level={3}>Available Colors</s-heading>
            {renderItemsList(options.colors, "Color", ["hexValue"])}
          </s-stack>
        </s-section>
      )}

      {activeSection === "sizes" && (
        <s-section heading="Manage Sizes">
          <s-stack direction="block" gap="large">
            <fetcher.Form method="post">
              <input type="hidden" name="action" value="addSize" />
              <s-stack direction="block" gap="base">
                <s-text-field
                  label="Size Name"
                  name="name"
                  required
                  placeholder="e.g., Small, Medium, Large"
                />
                <s-stack direction="inline" gap="base">
                  <s-text-field
                    label="Width"
                    name="width"
                    type="number"
                    step="0.01"
                  />
                  <s-text-field
                    label="Height"
                    name="height"
                    type="number"
                    step="0.01"
                  />
                  <s-select label="Unit" name="unit">
                    <option value="inches">Inches</option>
                    <option value="cm">Centimeters</option>
                    <option value="mm">Millimeters</option>
                  </s-select>
                </s-stack>
                <s-text-field
                  label="Price Modifier"
                  name="price_modifier"
                  type="number"
                  step="0.01"
                  value="0"
                  helpText="Additional cost for this size"
                />
                <s-text-field
                  label="Display Order"
                  name="display_order"
                  type="number"
                  value="0"
                />
                <s-button type="submit" variant="primary">
                  Add Size
                </s-button>
              </s-stack>
            </fetcher.Form>

            <s-divider />

            <s-heading level={3}>Available Sizes</s-heading>
            {renderItemsList(options.sizes, "Size", ["width", "height", "unit", "priceModifier"])}
          </s-stack>
        </s-section>
      )}

      {activeSection === "usageTypes" && (
        <s-section heading="Manage Usage Types">
          <s-stack direction="block" gap="large">
            <fetcher.Form method="post">
              <input type="hidden" name="action" value="addUsageType" />
              <s-stack direction="block" gap="base">
                <s-text-field
                  label="Usage Type"
                  name="name"
                  required
                  placeholder="e.g., Indoor, Outdoor"
                />
                <s-text-field
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                />
                <s-text-field
                  label="Price Modifier"
                  name="price_modifier"
                  type="number"
                  step="0.01"
                  value="0"
                />
                <s-text-field
                  label="Display Order"
                  name="display_order"
                  type="number"
                  value="0"
                />
                <s-button type="submit" variant="primary">
                  Add Usage Type
                </s-button>
              </s-stack>
            </fetcher.Form>

            <s-divider />

            <s-heading level={3}>Available Usage Types</s-heading>
            {renderItemsList(options.usageTypes, "UsageType", ["description", "priceModifier"])}
          </s-stack>
        </s-section>
      )}

      {activeSection === "acrylicShapes" && (
        <s-section heading="Manage Acrylic Shapes">
          <s-stack direction="block" gap="large">
            <fetcher.Form method="post">
              <input type="hidden" name="action" value="addAcrylicShape" />
              <s-stack direction="block" gap="base">
                <s-text-field
                  label="Shape Name"
                  name="name"
                  required
                  placeholder="e.g., Cut Around, Rectangle"
                />
                <s-text-field
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                />
                <s-text-field
                  label="Price Modifier"
                  name="price_modifier"
                  type="number"
                  step="0.01"
                  value="0"
                />
                <s-text-field
                  label="Display Order"
                  name="display_order"
                  type="number"
                  value="0"
                />
                <s-button type="submit" variant="primary">
                  Add Acrylic Shape
                </s-button>
              </s-stack>
            </fetcher.Form>

            <s-divider />

            <s-heading level={3}>Available Acrylic Shapes</s-heading>
            {renderItemsList(options.acrylicShapes, "AcrylicShape", ["description", "priceModifier"])}
          </s-stack>
        </s-section>
      )}

      {activeSection === "backboardColors" && (
        <s-section heading="Manage Backboard Colors">
          <s-stack direction="block" gap="large">
            <fetcher.Form method="post">
              <input type="hidden" name="action" value="addBackboardColor" />
              <s-stack direction="block" gap="base">
                <s-text-field
                  label="Color Name"
                  name="name"
                  required
                  placeholder="e.g., White, Black"
                />
                <s-text-field
                  label="Hex Value"
                  name="hex_value"
                  required
                  placeholder="#FFFFFF"
                />
                <s-text-field
                  label="Price Modifier"
                  name="price_modifier"
                  type="number"
                  step="0.01"
                  value="0"
                />
                <s-text-field
                  label="Display Order"
                  name="display_order"
                  type="number"
                  value="0"
                />
                <s-button type="submit" variant="primary">
                  Add Backboard Color
                </s-button>
              </s-stack>
            </fetcher.Form>

            <s-divider />

            <s-heading level={3}>Available Backboard Colors</s-heading>
            {renderItemsList(options.backboardColors, "BackboardColor", ["hexValue", "priceModifier"])}
          </s-stack>
        </s-section>
      )}

      {activeSection === "hangingOptions" && (
        <s-section heading="Manage Hanging Options">
          <s-stack direction="block" gap="large">
            <fetcher.Form method="post">
              <input type="hidden" name="action" value="addHangingOption" />
              <s-stack direction="block" gap="base">
                <s-text-field
                  label="Option Name"
                  name="name"
                  required
                  placeholder="e.g., Wall Mounted Kit"
                />
                <s-text-field
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                />
                <s-text-field
                  label="Price Modifier"
                  name="price_modifier"
                  type="number"
                  step="0.01"
                  value="0"
                />
                <s-text-field
                  label="Display Order"
                  name="display_order"
                  type="number"
                  value="0"
                />
                <s-button type="submit" variant="primary">
                  Add Hanging Option
                </s-button>
              </s-stack>
            </fetcher.Form>

            <s-divider />

            <s-heading level={3}>Available Hanging Options</s-heading>
            {renderItemsList(options.hangingOptions, "HangingOption", ["description", "priceModifier"])}
          </s-stack>
        </s-section>
      )}
    </s-page>
  );
}

export const ErrorBoundary = boundary.error(({ error }) => {
  console.error('Customizer settings error:', error);
  return boundary.defaultErrorBoundary({ error });
});
