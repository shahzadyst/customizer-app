import { Link, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getCustomizers } from "../models/customizer.server";
import { migrateCustomizerIds } from "../models/migrate-customizer-ids.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop;

  await migrateCustomizerIds();

  const customizers = await getCustomizers(shopDomain);

  return { shopDomain, customizers };
};

export default function Index() {
  const { customizers } = useLoaderData();
  const activeCustomizers = customizers.filter(c => c.isActive);

  return (
    <s-page heading="Sign Customiser">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <span></span>
        <Link to="/app/customizers">
          <s-button variant="primary">Create new customiser</s-button>
        </Link>
      </div>

      <s-section heading="Activity Overview Last 30 Days">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginTop: '16px'
        }}>
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="tight">
              <s-text size="small" color="subdued">Form Submissions</s-text>
              <s-text size="large" weight="semibold">0</s-text>
            </s-stack>
          </s-box>
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="tight">
              <s-text size="small" color="subdued">AI Files Created</s-text>
              <s-text size="large" weight="semibold">0</s-text>
            </s-stack>
          </s-box>
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="tight">
              <s-text size="small" color="subdued">Products Created</s-text>
              <s-text size="large" weight="semibold">0</s-text>
            </s-stack>
          </s-box>
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="tight">
              <s-text size="small" color="subdued">Conversion Rate</s-text>
              <s-text size="large" weight="semibold">0%</s-text>
            </s-stack>
          </s-box>
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="tight">
              <s-text size="small" color="subdued">Orders</s-text>
              <s-text size="large" weight="semibold">0</s-text>
            </s-stack>
          </s-box>
        </div>
      </s-section>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginTop: '24px'
      }}>
        <s-section heading="Main Menu">
          <s-stack direction="block" gap="base">
            <Link to="/app/customizers" style={{ textDecoration: 'none' }}>
              <s-box padding="base" borderWidth="base" borderRadius="base" style={{ cursor: 'pointer' }}>
                <s-stack direction="inline" gap="base" alignment="space-between">
                  <s-stack direction="inline" gap="base" alignment="center">
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#f3f4f6',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px'
                    }}>
                      A
                    </div>
                    <s-stack direction="block" gap="tight">
                      <s-text weight="semibold">Customisers</s-text>
                      <s-text size="small" color="subdued">Manage your sign customisers for this store</s-text>
                    </s-stack>
                  </s-stack>
                  <span style={{ fontSize: '20px', color: '#6b7280' }}>›</span>
                </s-stack>
              </s-box>
            </Link>

            <s-box padding="base" borderWidth="base" borderRadius="base" style={{ opacity: 0.6 }}>
              <s-stack direction="inline" gap="base" alignment="space-between">
                <s-stack direction="inline" gap="base" alignment="center">
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    📦
                  </div>
                  <s-stack direction="block" gap="tight">
                    <s-text weight="semibold">Orders</s-text>
                    <s-text size="small" color="subdued">View your store's attributed orders</s-text>
                  </s-stack>
                </s-stack>
                <span style={{ fontSize: '20px', color: '#6b7280' }}>›</span>
              </s-stack>
            </s-box>

            <s-box padding="base" borderWidth="base" borderRadius="base" style={{ opacity: 0.6 }}>
              <s-stack direction="inline" gap="base" alignment="space-between">
                <s-stack direction="inline" gap="base" alignment="center">
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    📝
                  </div>
                  <s-stack direction="block" gap="tight">
                    <s-text weight="semibold">Design Files & Form Submissions</s-text>
                    <s-text size="small" color="subdued">View your store's AI design files, quote forms and custom design forms</s-text>
                  </s-stack>
                </s-stack>
                <span style={{ fontSize: '20px', color: '#6b7280' }}>›</span>
              </s-stack>
            </s-box>

            <s-box padding="base" borderWidth="base" borderRadius="base" style={{ opacity: 0.6 }}>
              <s-stack direction="inline" gap="base" alignment="space-between">
                <s-stack direction="inline" gap="base" alignment="center">
                  <div style={{
                    width: '40px',
                    height: '40px',
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    ⚙️
                  </div>
                  <s-stack direction="block" gap="tight">
                    <s-text weight="semibold">Tools & Settings</s-text>
                    <s-text size="small" color="subdued">Access additional tools, integrations, and configuration options</s-text>
                  </s-stack>
                </s-stack>
                <span style={{ fontSize: '20px', color: '#6b7280' }}>›</span>
              </s-stack>
            </s-box>
          </s-stack>
        </s-section>

        <s-section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <s-heading level={3}>Recent customisers</s-heading>
            <Link to="/app/customizers" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '14px' }}>
              View all customisers
            </Link>
          </div>
          {customizers.length === 0 ? (
            <s-banner tone="info">
              <s-text>No customizers created yet. Create your first customizer to get started.</s-text>
            </s-banner>
          ) : (
            <s-stack direction="block" gap="base">
              {customizers.slice(0, 3).map((customizer) => {
                const customizerId = customizer.customizerId || (customizer._id ? customizer._id.toString() : 'no-id');
                const dbId = customizer._id ? customizer._id.toString() : '';
                return (
                  <Link
                    key={dbId || customizerId}
                    to={dbId ? `/app/customizers/${dbId}` : '#'}
                    style={{ textDecoration: 'none' }}
                  >
                    <s-box padding="base" borderWidth="base" borderRadius="base" style={{ cursor: 'pointer' }}>
                      <s-stack direction="inline" gap="base" alignment="space-between">
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
                            fontWeight: 'bold'
                          }}>
                            {customizer.name.charAt(0).toUpperCase()}
                          </div>
                          <s-stack direction="block" gap="tight">
                            <s-text weight="semibold">{customizer.name}</s-text>
                            <s-text size="small" color="subdued">
                              ID: {customizerId} - {customizer.description || 'Simple Letter'}
                            </s-text>
                          </s-stack>
                        </s-stack>
                        <span style={{ fontSize: '20px', color: '#6b7280' }}>›</span>
                      </s-stack>
                    </s-box>
                  </Link>
                );
              })}
            </s-stack>
          )}
        </s-section>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginTop: '24px'
      }}>
        <s-box padding="base" borderWidth="base" borderRadius="base">
          <s-stack direction="block" gap="base">
            <div style={{ fontSize: '24px' }}>🎯</div>
            <s-heading level={4}>Browse through our demos</s-heading>
            <s-text size="small" color="subdued">Explore live examples of sign customisers in action</s-text>
            <s-button variant="secondary" size="small">View Demos</s-button>
          </s-stack>
        </s-box>

        <s-box padding="base" borderWidth="base" borderRadius="base">
          <s-stack direction="block" gap="base">
            <div style={{ fontSize: '24px' }}>📚</div>
            <s-heading level={4}>Learning Center</s-heading>
            <s-text size="small" color="subdued">Learn more about the app and how to use it</s-text>
            <s-button variant="secondary" size="small">Learn</s-button>
          </s-stack>
        </s-box>

        <s-box padding="base" borderWidth="base" borderRadius="base">
          <s-stack direction="block" gap="base">
            <div style={{ fontSize: '24px' }}>🏭</div>
            <s-heading level={4}>Manufacturers</s-heading>
            <s-text size="small" color="subdued">Find and work with manufacturers from all around the world</s-text>
            <s-button variant="secondary" size="small">Browse</s-button>
          </s-stack>
        </s-box>

        <s-box padding="base" borderWidth="base" borderRadius="base">
          <s-stack direction="block" gap="base">
            <div style={{ fontSize: '24px' }}>💳</div>
            <s-heading level={4}>Plans</s-heading>
            <s-text size="small" color="subdued">Subscribe or change your current plan</s-text>
            <s-button variant="secondary" size="small">View Plans</s-button>
          </s-stack>
        </s-box>

        <s-box padding="base" borderWidth="base" borderRadius="base">
          <s-stack direction="block" gap="base">
            <div style={{ fontSize: '24px' }}>📖</div>
            <s-heading level={4}>Read the docs</s-heading>
            <s-text size="small" color="subdued">Learn how to use Sign Customiser to its full potential</s-text>
            <s-button variant="secondary" size="small">Get Help</s-button>
          </s-stack>
        </s-box>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '24px',
        marginTop: '24px'
      }}>
        <s-box padding="base" borderWidth="base" borderRadius="base">
          <s-stack direction="block" gap="base">
            <s-heading level={4}>Share your feedback</s-heading>
            <s-text size="small" color="subdued">How would you describe your experience using Sign Customiser?</s-text>
            <s-stack direction="inline" gap="tight">
              <s-button variant="secondary" size="small">👍 Good</s-button>
              <s-button variant="secondary" size="small">👎 Bad</s-button>
            </s-stack>
          </s-stack>
        </s-box>

        <s-box padding="base" borderWidth="base" borderRadius="base">
          <s-stack direction="block" gap="base">
            <s-heading level={4}>Get in touch</s-heading>
            <s-stack direction="block" gap="tight">
              <s-link href="#">Start a live chat</s-link>
              <s-link href="#">Send us an email</s-link>
              <s-link href="#">Visit the help center</s-link>
            </s-stack>
          </s-stack>
        </s-box>
      </div>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
