import { useState, useEffect } from "react";
import { useLoaderData, useFetcher, Link, useRevalidator } from "react-router";
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
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error('Action error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};

export default function Customizers() {
  const { customizers } = useLoaderData();
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInstructions, setShowInstructions] = useState({});

  useEffect(() => {
    if (fetcher.data?.success && fetcher.state === "idle") {
      setShowCreateForm(false);
      revalidator.revalidate();
    }
  }, [fetcher.data, fetcher.state, revalidator]);

  return (
    <s-page heading="Sign Customizers">
      <s-section>
        <s-stack direction="block" gap="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <s-paragraph>
              Create and manage multiple signage customizers. Each customizer can be added to your theme using app blocks.
            </s-paragraph>
            <s-button
              variant="primary"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : 'Create new customiser'}
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
                    placeholder="e.g., Neon Sign Customizer"
                  />
                  <s-text-field
                    label="Description (Optional)"
                    name="description"
                    multiline
                    rows={3}
                    placeholder="Simple Letter"
                  />
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        name="isActive"
                        value="true"
                        defaultChecked
                      />
                      <span>Active</span>
                    </label>
                  </div>
                  <s-button type="submit" variant="primary">
                    Create Customizer
                  </s-button>
                </s-stack>
              </fetcher.Form>
            </s-box>
          )}
        </s-stack>
      </s-section>

      <s-section heading="Recent customisers">
        {customizers.length === 0 ? (
          <s-banner tone="info">
            <s-text>
              You haven't created any customizers yet. Click "Create new customiser" to get started.
            </s-text>
          </s-banner>
        ) : (
          <s-stack direction="block" gap="base">
            {customizers.map((customizer) => {
              const customizerId = customizer.customizerId || (customizer._id ? customizer._id.toString() : 'no-id');
              const dbId = customizer._id ? customizer._id.toString() : '';

              return (
                <s-box
                  key={customizerId}
                  padding="base"
                  borderWidth="base"
                  borderRadius="base"
                >
                  <s-stack direction="block" gap="base">
                    <s-stack direction="inline" gap="base" alignment="space-between">
                      <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => {
                        if (dbId) {
                          window.location.href = `/app/customizers/${dbId}`;
                        }
                      }}>
                        <s-stack direction="inline" gap="base" alignment="center">
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: '#7C3AED',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '18px'
                          }}>
                            {customizer.name.charAt(0).toUpperCase()}
                          </div>
                          <s-stack direction="block" gap="tight">
                            <s-text weight="semibold" size="large">{customizer.name}</s-text>
                            <s-text size="small" color="subdued">
                              ID: {customizerId} - {customizer.description || 'No description'}
                            </s-text>
                          </s-stack>
                        </s-stack>
                      </div>

                      <s-stack direction="inline" gap="tight" alignment="center">
                        <s-badge tone={customizer.isActive ? "success" : "default"}>
                          {customizer.isActive ? "Active" : "Inactive"}
                        </s-badge>

                        {customizerId && customizerId !== 'no-id' && (
                          <s-button
                            size="small"
                            variant="secondary"
                            onClick={() => setShowInstructions(prev => ({ ...prev, [customizerId]: !prev[customizerId] }))}
                          >
                            {showInstructions[customizerId] ? 'Hide' : 'View'} Setup
                          </s-button>
                        )}

                        {dbId && (
                          <>
                            <fetcher.Form
                              method="post"
                              style={{ display: 'inline' }}
                              onSubmit={(e) => {
                                if (!confirm(`Are you sure you want to ${customizer.isActive ? 'deactivate' : 'activate'} this customizer?`)) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <input type="hidden" name="action" value="updateStatus" />
                              <input type="hidden" name="id" value={dbId} />
                              <input type="hidden" name="isActive" value={(!customizer.isActive).toString()} />
                              <s-button
                                size="small"
                                variant="secondary"
                                type="submit"
                              >
                                {customizer.isActive ? 'Deactivate' : 'Activate'}
                              </s-button>
                            </fetcher.Form>

                            <fetcher.Form
                              method="post"
                              style={{ display: 'inline' }}
                              onSubmit={(e) => {
                                if (!confirm('Are you sure you want to delete this customizer? This action cannot be undone.')) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <input type="hidden" name="action" value="delete" />
                              <input type="hidden" name="id" value={dbId} />
                              <s-button
                                size="small"
                                variant="destructive"
                                type="submit"
                              >
                                Delete
                              </s-button>
                            </fetcher.Form>
                          </>
                        )}
                      </s-stack>
                    </s-stack>

                    {customizerId && customizerId !== 'no-id' && showInstructions[customizerId] && (
                      <>
                        <s-divider />
                        <s-banner tone="info">
                          <s-stack direction="block" gap="tight">
                            <s-text size="small" weight="semibold">
                              To add this customizer to your theme:
                            </s-text>
                            <s-ordered-list>
                              <s-list-item>Go to your theme editor</s-list-item>
                              <s-list-item>Add the "Sign Customizer" app block</s-list-item>
                              <s-list-item>Enter the customizer ID: <strong>{customizerId}</strong></s-list-item>
                              <s-list-item>Save and publish your theme</s-list-item>
                            </s-ordered-list>
                          </s-stack>
                        </s-banner>
                      </>
                    )}
                  </s-stack>
                </s-box>
              );
            })}
          </s-stack>
        )}
      </s-section>
    </s-page>
  );
}
