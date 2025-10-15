import { useState } from "react";
import { useLoaderData, useFetcher, useNavigate } from "react-router";
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
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop;
  const { id } = params;

  const customizer = await getCustomizer(shopDomain, id);

  if (!customizer) {
    throw new Response("Customizer not found", { status: 404 });
  }

  const customizerId = customizer.customizerId || null;

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
  const { customizer, options } = useLoaderData();
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const [newFont, setNewFont] = useState({ name: "", fontFamily: "" });
  const [newColor, setNewColor] = useState({ name: "", hex: "#000000" });
  const [newSize, setNewSize] = useState({ width: "", height: "" });
  const [newUsageType, setNewUsageType] = useState({ name: "" });
  const [newAcrylicShape, setNewAcrylicShape] = useState({ name: "", imageUrl: "" });
  const [newBackboardColor, setNewBackboardColor] = useState({ name: "", hex: "#000000" });
  const [newHangingOption, setNewHangingOption] = useState({ name: "" });

  return (
    <s-page
      heading={`Configure: ${customizer.name}`}
      backAction={{ onAction: () => navigate("/app/customizers") }}
    >
      <s-section title="Fonts">
        <s-stack direction="block" gap="base">
          <s-box padding="base" background="surface">
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Font</s-text>
              <fetcher.Form method="post">
                <input type="hidden" name="action" value="addFont" />
                <s-stack direction="block" gap="base">
                  <s-text-field
                    label="Font Name"
                    value={newFont.name}
                    onChange={(value) => setNewFont({ ...newFont, name: value })}
                    name="name"
                    required
                  />
                  <s-text-field
                    label="Font Family (CSS)"
                    value={newFont.fontFamily}
                    onChange={(value) => setNewFont({ ...newFont, fontFamily: value })}
                    name="fontFamily"
                    placeholder="e.g., Arial, sans-serif"
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

      <s-section title="Colors">
        <s-stack direction="block" gap="base">
          <s-box padding="base" background="surface">
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Color</s-text>
              <fetcher.Form method="post">
                <input type="hidden" name="action" value="addColor" />
                <s-stack direction="block" gap="base">
                  <s-text-field
                    label="Color Name"
                    value={newColor.name}
                    onChange={(value) => setNewColor({ ...newColor, name: value })}
                    name="name"
                    required
                  />
                  <s-text-field
                    label="Hex Code"
                    value={newColor.hex}
                    onChange={(value) => setNewColor({ ...newColor, hex: value })}
                    name="hex"
                    placeholder="#000000"
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

      <s-section title="Sizes">
        <s-stack direction="block" gap="base">
          <s-box padding="base" background="surface">
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Size</s-text>
              <fetcher.Form method="post">
                <input type="hidden" name="action" value="addSize" />
                <s-stack direction="block" gap="base">
                  <s-text-field
                    label="Width (inches)"
                    type="number"
                    step="0.1"
                    value={newSize.width}
                    onChange={(value) => setNewSize({ ...newSize, width: value })}
                    name="width"
                    required
                  />
                  <s-text-field
                    label="Height (inches)"
                    type="number"
                    step="0.1"
                    value={newSize.height}
                    onChange={(value) => setNewSize({ ...newSize, height: value })}
                    name="height"
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

      <s-section title="Usage Types">
        <s-stack direction="block" gap="base">
          <s-box padding="base" background="surface">
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Usage Type</s-text>
              <fetcher.Form method="post">
                <input type="hidden" name="action" value="addUsageType" />
                <s-stack direction="block" gap="base">
                  <s-text-field
                    label="Usage Type Name"
                    value={newUsageType.name}
                    onChange={(value) => setNewUsageType({ name: value })}
                    name="name"
                    placeholder="e.g., Indoor, Outdoor"
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

      <s-section title="Acrylic Shapes">
        <s-stack direction="block" gap="base">
          <s-box padding="base" background="surface">
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Acrylic Shape</s-text>
              <fetcher.Form method="post">
                <input type="hidden" name="action" value="addAcrylicShape" />
                <s-stack direction="block" gap="base">
                  <s-text-field
                    label="Shape Name"
                    value={newAcrylicShape.name}
                    onChange={(value) => setNewAcrylicShape({ ...newAcrylicShape, name: value })}
                    name="name"
                    required
                  />
                  <s-text-field
                    label="Image URL"
                    value={newAcrylicShape.imageUrl}
                    onChange={(value) => setNewAcrylicShape({ ...newAcrylicShape, imageUrl: value })}
                    name="imageUrl"
                    placeholder="https://..."
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

      <s-section title="Backboard Colors">
        <s-stack direction="block" gap="base">
          <s-box padding="base" background="surface">
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Backboard Color</s-text>
              <fetcher.Form method="post">
                <input type="hidden" name="action" value="addBackboardColor" />
                <s-stack direction="block" gap="base">
                  <s-text-field
                    label="Color Name"
                    value={newBackboardColor.name}
                    onChange={(value) => setNewBackboardColor({ ...newBackboardColor, name: value })}
                    name="name"
                    required
                  />
                  <s-text-field
                    label="Hex Code"
                    value={newBackboardColor.hex}
                    onChange={(value) => setNewBackboardColor({ ...newBackboardColor, hex: value })}
                    name="hex"
                    placeholder="#000000"
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

      <s-section title="Hanging Options">
        <s-stack direction="block" gap="base">
          <s-box padding="base" background="surface">
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Hanging Option</s-text>
              <fetcher.Form method="post">
                <input type="hidden" name="action" value="addHangingOption" />
                <s-stack direction="block" gap="base">
                  <s-text-field
                    label="Option Name"
                    value={newHangingOption.name}
                    onChange={(value) => setNewHangingOption({ name: value })}
                    name="name"
                    placeholder="e.g., Wall Mount, Desk Stand"
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
    </s-page>
  );
}
