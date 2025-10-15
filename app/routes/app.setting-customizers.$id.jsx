import { useState, useRef } from "react";
import { useLoaderData, useFetcher, useNavigate, useNavigation } from "react-router";
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
} from "../models/signage.server";

export const loader = async ({ request, params }) => {
  try {
    console.log('=== CUSTOMIZER DETAIL LOADER START ===');
    console.log('Params ID:', params.id);

    const { session } = await authenticate.admin(request);
    const shopDomain = session.shop;

    console.log('Authenticated shop:', shopDomain);

    if (!shopDomain) {
      console.log('Shop is null, skipping...');
      throw new Response("Unauthorized", { status: 401 });
    }

    const { id } = params;
    console.log('Fetching customizer:', id);

    const customizer = await getCustomizer(shopDomain, id);
    console.log('Got customizer:', customizer ? 'Found' : 'Not found');

    if (!customizer) {
      throw new Response("Customizer not found", { status: 404 });
    }

    const customizerId = customizer.customizerId || null;
    console.log('Fetching options for customizerId:', customizerId);

    const [fonts, colors, sizes, usageTypes, acrylicShapes, backboardColors, hangingOptions] = await Promise.all([
      getFonts(shopDomain, customizerId),
      getColors(shopDomain, customizerId),
      getSizes(shopDomain, customizerId),
      getUsageTypes(shopDomain, customizerId),
      getAcrylicShapes(shopDomain, customizerId),
      getBackboardColors(shopDomain, customizerId),
      getHangingOptions(shopDomain, customizerId),
    ]);

    console.log('Options loaded:', {
      fonts: fonts.length,
      colors: colors.length,
      sizes: sizes.length,
      usageTypes: usageTypes.length,
      acrylicShapes: acrylicShapes.length,
      backboardColors: backboardColors.length,
      hangingOptions: hangingOptions.length,
    });

    console.log('=== LOADER SUCCESS - RETURNING DATA ===');

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
          width: parseFloat(formData.get("width")),
          height: parseFloat(formData.get("height")),
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
  const { customizer, options } = loaderData;
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const navigation = useNavigation();

  const [newFont, setNewFont] = useState({ name: "", fontFamily: "" });
  const [newColor, setNewColor] = useState({ name: "", hex: "#000000" });
  const [newSize, setNewSize] = useState({ width: "", height: "" });
  const [newUsageType, setNewUsageType] = useState({ name: "" });
  const [newAcrylicShape, setNewAcrylicShape] = useState({ name: "", imageUrl: "" });
  const [newBackboardColor, setNewBackboardColor] = useState({ name: "", hex: "#000000" });
  const [newHangingOption, setNewHangingOption] = useState({ name: "" });
  const [errors, setErrors] = useState({});

  const fontsRef = useRef(null);
  const colorsRef = useRef(null);
  const sizesRef = useRef(null);
  const usageTypesRef = useRef(null);
  const acrylicShapesRef = useRef(null);
  const backboardColorsRef = useRef(null);
  const hangingOptionsRef = useRef(null);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validateFont = (name, fontFamily) => {
    const errors = {};
    if (!name || name.trim().length === 0) {
      errors.fontName = "Font name is required";
    }
    if (!fontFamily || fontFamily.trim().length === 0) {
      errors.fontFamily = "Font family is required";
    }
    return errors;
  };

  const validateColor = (name, hex) => {
    const errors = {};
    if (!name || name.trim().length === 0) {
      errors.colorName = "Color name is required";
    }
    if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      errors.colorHex = "Valid hex color is required (e.g., #000000)";
    }
    return errors;
  };

  const validateSize = (width, height) => {
    const errors = {};
    const w = parseFloat(width);
    const h = parseFloat(height);
    if (!width || isNaN(w) || w <= 0) {
      errors.sizeWidth = "Width must be a positive number";
    }
    if (!height || isNaN(h) || h <= 0) {
      errors.sizeHeight = "Height must be a positive number";
    }
    return errors;
  };

  const validateName = (name, fieldName) => {
    const errors = {};
    if (!name || name.trim().length === 0) {
      errors[fieldName] = "Name is required";
    }
    return errors;
  };

  const validateImageUrl = (url) => {
    if (url && url.trim().length > 0) {
      try {
        new URL(url);
        return {};
      } catch {
        return { imageUrl: "Invalid URL format" };
      }
    }
    return {};
  };

  const handleAddFont = (e) => {
    e.preventDefault();
    const validationErrors = validateFont(newFont.name, newFont.fontFamily);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    e.target.submit();
    setNewFont({ name: "", fontFamily: "" });
  };

  const handleAddColor = (e) => {
    e.preventDefault();
    const validationErrors = validateColor(newColor.name, newColor.hex);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    e.target.submit();
    setNewColor({ name: "", hex: "#000000" });
  };

  const handleAddSize = (e) => {
    e.preventDefault();
    const validationErrors = validateSize(newSize.width, newSize.height);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    e.target.submit();
    setNewSize({ width: "", height: "" });
  };

  const handleAddUsageType = (e) => {
    e.preventDefault();
    const validationErrors = validateName(newUsageType.name, 'usageTypeName');
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    e.target.submit();
    setNewUsageType({ name: "" });
  };

  const handleAddAcrylicShape = (e) => {
    e.preventDefault();
    const nameErrors = validateName(newAcrylicShape.name, 'acrylicShapeName');
    const urlErrors = validateImageUrl(newAcrylicShape.imageUrl);
    const validationErrors = { ...nameErrors, ...urlErrors };
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    e.target.submit();
    setNewAcrylicShape({ name: "", imageUrl: "" });
  };

  const handleAddBackboardColor = (e) => {
    e.preventDefault();
    const validationErrors = validateColor(newBackboardColor.name, newBackboardColor.hex);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    e.target.submit();
    setNewBackboardColor({ name: "", hex: "#000000" });
  };

  const handleAddHangingOption = (e) => {
    e.preventDefault();
    const validationErrors = validateName(newHangingOption.name, 'hangingOptionName');
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    e.target.submit();
    setNewHangingOption({ name: "" });
  };

  const isLoading = navigation.state === "loading";

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
                <div style={{ height: '36px', background: '#e0e0e0', borderRadius: '4px', width: '120px' }} />
              </s-stack>
            </s-box>
          </s-section>
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
    <div style={{ display: 'flex', gap: '24px' }}>
      <div style={{
        width: '200px',
        position: 'sticky',
        top: '0',
        height: 'fit-content',
        background: '#f9f9f9',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <s-stack direction="block" gap="tight">
          <s-text weight="semibold" size="large">Sections</s-text>
          <s-stack direction="block" gap="extraTight">
            <s-button onClick={() => scrollToSection(fontsRef)} size="small" variant="plain">Fonts</s-button>
            <s-button onClick={() => scrollToSection(colorsRef)} size="small" variant="plain">Colors</s-button>
            <s-button onClick={() => scrollToSection(sizesRef)} size="small" variant="plain">Sizes</s-button>
            <s-button onClick={() => scrollToSection(usageTypesRef)} size="small" variant="plain">Usage Types</s-button>
            <s-button onClick={() => scrollToSection(acrylicShapesRef)} size="small" variant="plain">Acrylic Shapes</s-button>
            <s-button onClick={() => scrollToSection(backboardColorsRef)} size="small" variant="plain">Backboard Colors</s-button>
            <s-button onClick={() => scrollToSection(hangingOptionsRef)} size="small" variant="plain">Hanging Options</s-button>
          </s-stack>
        </s-stack>
      </div>

      <div style={{ flex: 1 }}>
        <s-page
          heading={`Configure: ${customizer.name}`}
          backAction={{ onAction: () => navigate("/app/customizers") }}
        >
          <div ref={fontsRef}>
            <s-section title="Fonts">
        <s-stack direction="block" gap="base">
          <s-box padding="base" background="surface">
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Font</s-text>
              <fetcher.Form method="post" onSubmit={handleAddFont}>
                <input type="hidden" name="action" value="addFont" />
                <s-stack direction="block" gap="base">
                  <s-text-field
                    label="Font Name"
                    value={newFont.name}
                    onChange={(value) => setNewFont({ ...newFont, name: value })}
                    name="name"
                    error={errors.fontName}
                    required
                  />
                  <s-text-field
                    label="Font Family (CSS)"
                    value={newFont.fontFamily}
                    onChange={(value) => setNewFont({ ...newFont, fontFamily: value })}
                    name="fontFamily"
                    placeholder="e.g., Arial, sans-serif"
                    error={errors.fontFamily}
                    required
                  />
                  <s-button type="submit" variant="primary">Add Font</s-button>
                </s-stack>
              </fetcher.Form>
            </s-stack>
          </s-box>

          <s-stack direction="block" gap="tight">
            {options.fonts.map((font) => (
              <s-box key={font._id.toString()} padding="base" background="surface">
                <s-stack direction="inline" gap="base" alignment="center" distribution="spaceBetween">
                  <s-stack direction="block" gap="none">
                    <s-text weight="semibold">{font.name}</s-text>
                    <s-text size="small" color="subdued">{font.fontFamily}</s-text>
                  </s-stack>
                  <fetcher.Form method="post">
                    <input type="hidden" name="action" value="deleteFont" />
                    <input type="hidden" name="id" value={font._id.toString()} />
                    <s-button size="small" variant="destructive" type="submit">Delete</s-button>
                  </fetcher.Form>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        </s-stack>
            </s-section>
          </div>

          <div ref={colorsRef}>
            <s-section title="Colors">
        <s-stack direction="block" gap="base">
          <s-box padding="base" background="surface">
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Color</s-text>
              <fetcher.Form method="post" onSubmit={handleAddColor}>
                <input type="hidden" name="action" value="addColor" />
                <s-stack direction="block" gap="base">
                  <s-text-field
                    label="Color Name"
                    value={newColor.name}
                    onChange={(value) => setNewColor({ ...newColor, name: value })}
                    name="name"
                    error={errors.colorName}
                    required
                  />
                  <s-text-field
                    label="Hex Code"
                    value={newColor.hex}
                    onChange={(value) => setNewColor({ ...newColor, hex: value })}
                    name="hex"
                    placeholder="#000000"
                    error={errors.colorHex}
                    required
                  />
                  <s-button type="submit" variant="primary">Add Color</s-button>
                </s-stack>
              </fetcher.Form>
            </s-stack>
          </s-box>

          <s-stack direction="block" gap="tight">
            {options.colors.map((color) => (
              <s-box key={color._id.toString()} padding="base" background="surface">
                <s-stack direction="inline" gap="base" alignment="center" distribution="spaceBetween">
                  <s-stack direction="inline" gap="base" alignment="center">
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: color.hex,
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }} />
                    <s-stack direction="block" gap="none">
                      <s-text weight="semibold">{color.name}</s-text>
                      <s-text size="small" color="subdued">{color.hex}</s-text>
                    </s-stack>
                  </s-stack>
                  <fetcher.Form method="post">
                    <input type="hidden" name="action" value="deleteColor" />
                    <input type="hidden" name="id" value={color._id.toString()} />
                    <s-button size="small" variant="destructive" type="submit">Delete</s-button>
                  </fetcher.Form>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        </s-stack>
            </s-section>
          </div>

          <div ref={sizesRef}>
            <s-section title="Sizes">
        <s-stack direction="block" gap="base">
          <s-box padding="base" background="surface">
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Size</s-text>
              <fetcher.Form method="post" onSubmit={handleAddSize}>
                <input type="hidden" name="action" value="addSize" />
                <s-stack direction="block" gap="base">
                  <s-text-field
                    label="Width (inches)"
                    type="number"
                    step="0.1"
                    value={newSize.width}
                    onChange={(value) => setNewSize({ ...newSize, width: value })}
                    name="width"
                    error={errors.sizeWidth}
                    required
                  />
                  <s-text-field
                    label="Height (inches)"
                    type="number"
                    step="0.1"
                    value={newSize.height}
                    onChange={(value) => setNewSize({ ...newSize, height: value })}
                    name="height"
                    error={errors.sizeHeight}
                    required
                  />
                  <s-button type="submit" variant="primary">Add Size</s-button>
                </s-stack>
              </fetcher.Form>
            </s-stack>
          </s-box>

          <s-stack direction="block" gap="tight">
            {options.sizes.map((size) => (
              <s-box key={size._id.toString()} padding="base" background="surface">
                <s-stack direction="inline" gap="base" alignment="center" distribution="spaceBetween">
                  <s-text>{size.width}" × {size.height}"</s-text>
                  <fetcher.Form method="post">
                    <input type="hidden" name="action" value="deleteSize" />
                    <input type="hidden" name="id" value={size._id.toString()} />
                    <s-button size="small" variant="destructive" type="submit">Delete</s-button>
                  </fetcher.Form>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        </s-stack>
            </s-section>
          </div>

          <div ref={usageTypesRef}>
            <s-section title="Usage Types">
        <s-stack direction="block" gap="base">
          <s-box padding="base" background="surface">
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Usage Type</s-text>
              <fetcher.Form method="post" onSubmit={handleAddUsageType}>
                <input type="hidden" name="action" value="addUsageType" />
                <s-stack direction="block" gap="base">
                  <s-text-field
                    label="Usage Type Name"
                    value={newUsageType.name}
                    onChange={(value) => setNewUsageType({ name: value })}
                    name="name"
                    placeholder="e.g., Indoor, Outdoor"
                    error={errors.usageTypeName}
                    required
                  />
                  <s-button type="submit" variant="primary">Add Usage Type</s-button>
                </s-stack>
              </fetcher.Form>
            </s-stack>
          </s-box>

          <s-stack direction="block" gap="tight">
            {options.usageTypes.map((type) => (
              <s-box key={type._id.toString()} padding="base" background="surface">
                <s-stack direction="inline" gap="base" alignment="center" distribution="spaceBetween">
                  <s-text>{type.name}</s-text>
                  <fetcher.Form method="post">
                    <input type="hidden" name="action" value="deleteUsageType" />
                    <input type="hidden" name="id" value={type._id.toString()} />
                    <s-button size="small" variant="destructive" type="submit">Delete</s-button>
                  </fetcher.Form>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        </s-stack>
            </s-section>
          </div>

          <div ref={acrylicShapesRef}>
            <s-section title="Acrylic Shapes">
        <s-stack direction="block" gap="base">
          <s-box padding="base" background="surface">
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Acrylic Shape</s-text>
              <fetcher.Form method="post" onSubmit={handleAddAcrylicShape}>
                <input type="hidden" name="action" value="addAcrylicShape" />
                <s-stack direction="block" gap="base">
                  <s-text-field
                    label="Shape Name"
                    value={newAcrylicShape.name}
                    onChange={(value) => setNewAcrylicShape({ ...newAcrylicShape, name: value })}
                    name="name"
                    error={errors.acrylicShapeName}
                    required
                  />
                  <s-text-field
                    label="Image URL"
                    value={newAcrylicShape.imageUrl}
                    onChange={(value) => setNewAcrylicShape({ ...newAcrylicShape, imageUrl: value })}
                    name="imageUrl"
                    placeholder="https://..."
                    error={errors.imageUrl}
                  />
                  <s-button type="submit" variant="primary">Add Shape</s-button>
                </s-stack>
              </fetcher.Form>
            </s-stack>
          </s-box>

          <s-stack direction="block" gap="tight">
            {options.acrylicShapes.map((shape) => (
              <s-box key={shape._id.toString()} padding="base" background="surface">
                <s-stack direction="inline" gap="base" alignment="center" distribution="spaceBetween">
                  <s-stack direction="inline" gap="base" alignment="center">
                    {shape.imageUrl && (
                      <img src={shape.imageUrl} alt={shape.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    )}
                    <s-text>{shape.name}</s-text>
                  </s-stack>
                  <fetcher.Form method="post">
                    <input type="hidden" name="action" value="deleteAcrylicShape" />
                    <input type="hidden" name="id" value={shape._id.toString()} />
                    <s-button size="small" variant="destructive" type="submit">Delete</s-button>
                  </fetcher.Form>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        </s-stack>
            </s-section>
          </div>

          <div ref={backboardColorsRef}>
            <s-section title="Backboard Colors">
        <s-stack direction="block" gap="base">
          <s-box padding="base" background="surface">
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Backboard Color</s-text>
              <fetcher.Form method="post" onSubmit={handleAddBackboardColor}>
                <input type="hidden" name="action" value="addBackboardColor" />
                <s-stack direction="block" gap="base">
                  <s-text-field
                    label="Color Name"
                    value={newBackboardColor.name}
                    onChange={(value) => setNewBackboardColor({ ...newBackboardColor, name: value })}
                    name="name"
                    error={errors.colorName}
                    required
                  />
                  <s-text-field
                    label="Hex Code"
                    value={newBackboardColor.hex}
                    onChange={(value) => setNewBackboardColor({ ...newBackboardColor, hex: value })}
                    name="hex"
                    placeholder="#000000"
                    error={errors.colorHex}
                    required
                  />
                  <s-button type="submit" variant="primary">Add Backboard Color</s-button>
                </s-stack>
              </fetcher.Form>
            </s-stack>
          </s-box>

          <s-stack direction="block" gap="tight">
            {options.backboardColors.map((color) => (
              <s-box key={color._id.toString()} padding="base" background="surface">
                <s-stack direction="inline" gap="base" alignment="center" distribution="spaceBetween">
                  <s-stack direction="inline" gap="base" alignment="center">
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: color.hex,
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }} />
                    <s-stack direction="block" gap="none">
                      <s-text weight="semibold">{color.name}</s-text>
                      <s-text size="small" color="subdued">{color.hex}</s-text>
                    </s-stack>
                  </s-stack>
                  <fetcher.Form method="post">
                    <input type="hidden" name="action" value="deleteBackboardColor" />
                    <input type="hidden" name="id" value={color._id.toString()} />
                    <s-button size="small" variant="destructive" type="submit">Delete</s-button>
                  </fetcher.Form>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        </s-stack>
            </s-section>
          </div>

          <div ref={hangingOptionsRef}>
            <s-section title="Hanging Options">
        <s-stack direction="block" gap="base">
          <s-box padding="base" background="surface">
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Hanging Option</s-text>
              <fetcher.Form method="post" onSubmit={handleAddHangingOption}>
                <input type="hidden" name="action" value="addHangingOption" />
                <s-stack direction="block" gap="base">
                  <s-text-field
                    label="Option Name"
                    value={newHangingOption.name}
                    onChange={(value) => setNewHangingOption({ name: value })}
                    name="name"
                    placeholder="e.g., Wall Mount, Desk Stand"
                    error={errors.hangingOptionName}
                    required
                  />
                  <s-button type="submit" variant="primary">Add Hanging Option</s-button>
                </s-stack>
              </fetcher.Form>
            </s-stack>
          </s-box>

          <s-stack direction="block" gap="tight">
            {options.hangingOptions.map((option) => (
              <s-box key={option._id.toString()} padding="base" background="surface">
                <s-stack direction="inline" gap="base" alignment="center" distribution="spaceBetween">
                  <s-text>{option.name}</s-text>
                  <fetcher.Form method="post">
                    <input type="hidden" name="action" value="deleteHangingOption" />
                    <input type="hidden" name="id" value={option._id.toString()} />
                    <s-button size="small" variant="destructive" type="submit">Delete</s-button>
                  </fetcher.Form>
                </s-stack>
              </s-box>
            ))}
          </s-stack>
        </s-stack>
            </s-section>
          </div>
        </s-page>
      </div>
    </div>
  );
}
