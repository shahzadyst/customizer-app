import { useState, useEffect } from "react";
import { useLoaderData, useFetcher, Link } from "react-router";
import { authenticate } from "../shopify.server";
import {
  getCustomizers,
  createCustomizer,
  updateCustomizer,
  deleteCustomizer,
} from "../models/customizer.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop;

  const customizers = await getCustomizers(shopDomain);

  return {
    shop: shopDomain,
    customizers,
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");
  const shop = session.shop;

  try {
    switch (action) {
      case "create": {
        await createCustomizer(shop, {
          name: formData.get("name"),
          description: formData.get("description") || "",
          isActive: formData.get("isActive") === "true",
        });
        return { success: true };
      }

      case "updateStatus": {
        const customizerId = formData.get("id");
        const isActive = formData.get("isActive") === "true";
        await updateCustomizer(shop, customizerId, { isActive });
        return { success: true };
      }

      case "delete": {
        await deleteCustomizer(shop, formData.get("id"));
        return { success: true };
      }

      default:
        return { error: "Invalid action" };
    }
  } catch (error) {
    return { error: error.message };
  }
};

export default function Customizers() {
  const { shop, customizers } = useLoaderData();
  const fetcher = useFetcher();
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (fetcher.data?.success) {
      window.location.reload();
    }
  }, [fetcher.data]);

  return (
    <s-page heading="Signage Customizers">
      <s-section>
        <s-stack direction="block" gap="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <s-paragraph>
              Create and manage multiple signage customizers. Each customizer can be embedded in different locations on your store.
            </s-paragraph>
            <s-button
              variant="primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : 'Create Customizer'}
            </s-button>
          </div>

          {showCreateForm && (
            <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
              <fetcher.Form method="post">
                <input type="hidden" name="action" value="create" />
                <s-stack direction="block" gap="base">
                  <s-heading level={3}>Create New Customizer</s-heading>
                  <s-text-field
                    label="Customizer Name"
                    name="name"
                    required
                    placeholder="e.g., Main Signage Customizer"
                  />
                  <s-text-field
                    label="Description (Optional)"
                    name="description"
                    multiline
                    rows={3}
                    placeholder="Describe what this customizer is for..."
                  />
                  <s-checkbox
                    label="Active"
                    name="isActive"
                    value="true"
                    defaultChecked
                  />
                  <s-button type="submit" variant="primary">
                    Create Customizer
                  </s-button>
                </s-stack>
              </fetcher.Form>
            </s-box>
          )}

          <s-divider />

          <s-heading level={2}>Your Customizers</s-heading>

          {customizers.length === 0 ? (
            <s-banner tone="info">
              <s-text>
                You haven't created any customizers yet. Click "Create Customizer" to get started.
              </s-text>
            </s-banner>
          ) : (
            <s-stack direction="block" gap="base">
              {customizers.map((customizer) => (
                <s-box
                  key={customizer._id.toString()}
                  padding="base"
                  borderWidth="base"
                  borderRadius="base"
                >
                  <s-stack direction="block" gap="base">
                    <s-stack direction="inline" gap="base" alignment="space-between">
                      <s-stack direction="block" gap="tight">
                        <s-stack direction="inline" gap="tight" alignment="center">
                          <s-heading level={3}>{customizer.name}</s-heading>
                          <s-badge tone={customizer.isActive ? "success" : "warning"}>
                            {customizer.isActive ? "Active" : "Inactive"}
                          </s-badge>
                        </s-stack>
                        {customizer.description && (
                          <s-text color="subdued">{customizer.description}</s-text>
                        )}
                        <s-text size="small" color="subdued">
                          ID: {customizer._id.toString()}
                        </s-text>
                        <s-text size="small" color="subdued">
                          Created: {new Date(customizer.createdAt).toLocaleDateString()}
                        </s-text>
                      </s-stack>

                      <s-stack direction="inline" gap="tight">
                        <fetcher.Form method="post">
                          <input type="hidden" name="action" value="updateStatus" />
                          <input type="hidden" name="id" value={customizer._id.toString()} />
                          <input type="hidden" name="isActive" value={!customizer.isActive} />
                          <s-button
                            size="small"
                            variant="secondary"
                            type="submit"
                          >
                            {customizer.isActive ? 'Deactivate' : 'Activate'}
                          </s-button>
                        </fetcher.Form>

                        <Link to={`/app/settings?customizerId=${customizer._id.toString()}`}>
                          <s-button size="small" variant="primary">
                            Configure
                          </s-button>
                        </Link>

                        <fetcher.Form method="post">
                          <input type="hidden" name="action" value="delete" />
                          <input type="hidden" name="id" value={customizer._id.toString()} />
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

                    <s-divider />

                    <s-stack direction="block" gap="tight">
                      <s-text weight="semibold">App Block Settings</s-text>
                      <s-text size="small">
                        Add this customizer to your theme using the app block. Use the customizer ID above in the theme editor.
                      </s-text>
                      <s-banner tone="info">
                        <s-stack direction="block" gap="tight">
                          <s-text size="small" weight="semibold">
                            To add this customizer to your theme:
                          </s-text>
                          <s-ordered-list>
                            <s-list-item>Go to your theme editor</s-list-item>
                            <s-list-item>Add the "Sign Customizer" app block</s-list-item>
                            <s-list-item>Enter the customizer ID: {customizer._id.toString()}</s-list-item>
                            <s-list-item>Save and publish your theme</s-list-item>
                          </s-ordered-list>
                        </s-stack>
                      </s-banner>
                    </s-stack>
                  </s-stack>
                </s-box>
              ))}
            </s-stack>
          )}
        </s-stack>
      </s-section>
    </s-page>
  );
}
