import { useState, useEffect } from "react";
import { useLoaderData, useFetcher } from "react-router";
import { authenticate } from "../shopify.server";
import { getStoreByDomain, createOrUpdateStore, getStoreOptions } from "../supabase.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop;

  let store = await getStoreByDomain(shopDomain);
  if (!store) {
    store = await createOrUpdateStore(shopDomain);
  }

  const options = await getStoreOptions(store.id);

  return {
    store,
    options,
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  const store = await getStoreByDomain(session.shop);

  if (!store) {
    return { error: "Store not found" };
  }

  const { supabase } = await import("../supabase.server");

  try {
    switch (action) {
      case "addFont": {
        const { data, error } = await supabase
          .from("fonts")
          .insert({
            store_id: store.id,
            name: formData.get("name"),
            font_family: formData.get("font_family"),
            font_url: formData.get("font_url") || null,
            display_order: parseInt(formData.get("display_order")) || 0,
          })
          .select()
          .single();

        return error ? { error: error.message } : { success: true, data };
      }

      case "addColor": {
        const { data, error } = await supabase
          .from("colors")
          .insert({
            store_id: store.id,
            name: formData.get("name"),
            hex_value: formData.get("hex_value"),
            display_order: parseInt(formData.get("display_order")) || 0,
          })
          .select()
          .single();

        return error ? { error: error.message } : { success: true, data };
      }

      case "addSize": {
        const { data, error } = await supabase
          .from("sizes")
          .insert({
            store_id: store.id,
            name: formData.get("name"),
            width: parseFloat(formData.get("width")) || null,
            height: parseFloat(formData.get("height")) || null,
            unit: formData.get("unit") || "inches",
            price_modifier: parseFloat(formData.get("price_modifier")) || 0,
            display_order: parseInt(formData.get("display_order")) || 0,
          })
          .select()
          .single();

        return error ? { error: error.message } : { success: true, data };
      }

      case "addUsageType": {
        const { data, error } = await supabase
          .from("usage_types")
          .insert({
            store_id: store.id,
            name: formData.get("name"),
            description: formData.get("description") || null,
            price_modifier: parseFloat(formData.get("price_modifier")) || 0,
            display_order: parseInt(formData.get("display_order")) || 0,
          })
          .select()
          .single();

        return error ? { error: error.message } : { success: true, data };
      }

      case "addAcrylicShape": {
        const { data, error } = await supabase
          .from("acrylic_shapes")
          .insert({
            store_id: store.id,
            name: formData.get("name"),
            description: formData.get("description") || null,
            price_modifier: parseFloat(formData.get("price_modifier")) || 0,
            display_order: parseInt(formData.get("display_order")) || 0,
          })
          .select()
          .single();

        return error ? { error: error.message } : { success: true, data };
      }

      case "addBackboardColor": {
        const { data, error } = await supabase
          .from("backboard_colors")
          .insert({
            store_id: store.id,
            name: formData.get("name"),
            hex_value: formData.get("hex_value"),
            price_modifier: parseFloat(formData.get("price_modifier")) || 0,
            display_order: parseInt(formData.get("display_order")) || 0,
          })
          .select()
          .single();

        return error ? { error: error.message } : { success: true, data };
      }

      case "addHangingOption": {
        const { data, error } = await supabase
          .from("hanging_options")
          .insert({
            store_id: store.id,
            name: formData.get("name"),
            description: formData.get("description") || null,
            price_modifier: parseFloat(formData.get("price_modifier")) || 0,
            display_order: parseInt(formData.get("display_order")) || 0,
          })
          .select()
          .single();

        return error ? { error: error.message } : { success: true, data };
      }

      case "deleteItem": {
        const table = formData.get("table");
        const id = formData.get("id");

        const { error } = await supabase.from(table).delete().eq("id", id);

        return error ? { error: error.message } : { success: true };
      }

      case "toggleActive": {
        const table = formData.get("table");
        const id = formData.get("id");
        const isActive = formData.get("is_active") === "true";

        const { error } = await supabase
          .from(table)
          .update({ is_active: !isActive })
          .eq("id", id);

        return error ? { error: error.message } : { success: true };
      }

      default:
        return { error: "Invalid action" };
    }
  } catch (error) {
    return { error: error.message };
  }
};

export default function Settings() {
  const { store, options } = useLoaderData();
  const fetcher = useFetcher();
  const [activeSection, setActiveSection] = useState("fonts");

  useEffect(() => {
    if (fetcher.data?.success) {
      window.location.reload();
    }
  }, [fetcher.data]);

  const renderItemsList = (items, table, fields) => (
    <s-stack direction="block" gap="base">
      {items.map((item) => (
        <s-box
          key={item.id}
          padding="base"
          borderWidth="base"
          borderRadius="base"
        >
          <s-stack direction="inline" gap="base" alignment="space-between">
            <s-stack direction="block" gap="tight">
              <s-text weight="semibold">{item.name}</s-text>
              {fields.map((field) => (
                item[field] && (
                  <s-text key={field} size="small" color="subdued">
                    {field}: {item[field]}
                  </s-text>
                )
              ))}
            </s-stack>
            <s-stack direction="inline" gap="tight">
              <fetcher.Form method="post">
                <input type="hidden" name="action" value="toggleActive" />
                <input type="hidden" name="table" value={table} />
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="is_active" value={item.is_active} />
                <s-button
                  size="small"
                  variant="secondary"
                  type="submit"
                >
                  {item.is_active ? "Deactivate" : "Activate"}
                </s-button>
              </fetcher.Form>
              <fetcher.Form method="post">
                <input type="hidden" name="action" value="deleteItem" />
                <input type="hidden" name="table" value={table} />
                <input type="hidden" name="id" value={item.id} />
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
    <s-page heading="Signage Customizer Settings">
      <s-section>
        <s-tabs>
          <s-tab-button
            selected={activeSection === "fonts"}
            onClick={() => setActiveSection("fonts")}
          >
            Fonts
          </s-tab-button>
          <s-tab-button
            selected={activeSection === "colors"}
            onClick={() => setActiveSection("colors")}
          >
            Colors
          </s-tab-button>
          <s-tab-button
            selected={activeSection === "sizes"}
            onClick={() => setActiveSection("sizes")}
          >
            Sizes
          </s-tab-button>
          <s-tab-button
            selected={activeSection === "usageTypes"}
            onClick={() => setActiveSection("usageTypes")}
          >
            Usage Types
          </s-tab-button>
          <s-tab-button
            selected={activeSection === "acrylicShapes"}
            onClick={() => setActiveSection("acrylicShapes")}
          >
            Acrylic Shapes
          </s-tab-button>
          <s-tab-button
            selected={activeSection === "backboardColors"}
            onClick={() => setActiveSection("backboardColors")}
          >
            Backboard Colors
          </s-tab-button>
          <s-tab-button
            selected={activeSection === "hangingOptions"}
            onClick={() => setActiveSection("hangingOptions")}
          >
            Hanging Options
          </s-tab-button>
        </s-tabs>
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
            {renderItemsList(options.fonts, "fonts", ["font_family"])}
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
            {renderItemsList(options.colors, "colors", ["hex_value"])}
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
            {renderItemsList(options.sizes, "sizes", ["width", "height", "unit", "price_modifier"])}
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
            {renderItemsList(options.usageTypes, "usage_types", ["description", "price_modifier"])}
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
            {renderItemsList(options.acrylicShapes, "acrylic_shapes", ["description", "price_modifier"])}
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
            {renderItemsList(options.backboardColors, "backboard_colors", ["hex_value", "price_modifier"])}
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
            {renderItemsList(options.hangingOptions, "hanging_options", ["description", "price_modifier"])}
          </s-stack>
        </s-section>
      )}
    </s-page>
  );
}
