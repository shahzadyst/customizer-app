import { Link, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
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

  const stats = {
    fonts: options.fonts.length,
    colors: options.colors.length,
    sizes: options.sizes.length,
    usageTypes: options.usageTypes.length,
    acrylicShapes: options.acrylicShapes.length,
    backboardColors: options.backboardColors.length,
    hangingOptions: options.hangingOptions.length,
  };

  return { stats, shopDomain };
};

export default function Index() {
  const { stats, shopDomain } = useLoaderData();

  const totalOptions = Object.values(stats).reduce((sum, count) => sum + count, 0);

  return (
    <s-page heading="Signage Customizer App">
      <s-section heading="Welcome to Your Signage Customizer">
        <s-paragraph>
          This app allows you to create a fully customizable signage experience for your customers.
          Configure fonts, colors, sizes, and other options, then embed the customizer on your storefront.
        </s-paragraph>
      </s-section>

      <s-section heading="Quick Stats">
        <s-stack direction="block" gap="large">
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading level={3}>Configuration Status</s-heading>
              <s-stack direction="block" gap="tight">
                <s-text>Total Options Configured: {totalOptions}</s-text>
                <s-text>Fonts: {stats.fonts}</s-text>
                <s-text>Colors: {stats.colors}</s-text>
                <s-text>Sizes: {stats.sizes}</s-text>
                <s-text>Usage Types: {stats.usageTypes}</s-text>
                <s-text>Acrylic Shapes: {stats.acrylicShapes}</s-text>
                <s-text>Backboard Colors: {stats.backboardColors}</s-text>
                <s-text>Hanging Options: {stats.hangingOptions}</s-text>
              </s-stack>
            </s-stack>
          </s-box>

          {totalOptions === 0 && (
            <s-banner tone="warning">
              <s-stack direction="block" gap="tight">
                <s-text weight="semibold">Getting Started</s-text>
                <s-text>
                  You haven't configured any options yet. Go to the Settings page to add fonts, colors, sizes, and other customization options.
                </s-text>
              </s-stack>
            </s-banner>
          )}
        </s-stack>
      </s-section>

      <s-section heading="Quick Start Guide">
        <s-stack direction="block" gap="large">
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading level={3}>Step 1: Configure Options</s-heading>
              <s-paragraph>
                Go to the Settings page to add and manage all your customization options like fonts, colors, sizes, usage types, and more.
              </s-paragraph>
              <Link to="/app/settings">
                <s-button variant="primary">Go to Settings</s-button>
              </Link>
            </s-stack>
          </s-box>

          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading level={3}>Step 2: Install Embed Script</s-heading>
              <s-paragraph>
                Get your unique embed script and installation instructions to add the customizer to your storefront.
              </s-paragraph>
              <Link to="/app/embed">
                <s-button variant="primary">Get Embed Code</s-button>
              </Link>
            </s-stack>
          </s-box>

          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading level={3}>Step 3: Test Your Customizer</s-heading>
              <s-paragraph>
                Once installed, visit your storefront and click the "Customize Signage" button on any product page to test the customizer.
              </s-paragraph>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Features">
        <s-unordered-list>
          <s-list-item>Multi-store support</s-list-item>
          <s-list-item>Customizable fonts and colors</s-list-item>
          <s-list-item>Multiple size options</s-list-item>
          <s-list-item>Indoor/Outdoor usage types</s-list-item>
          <s-list-item>Various acrylic shapes</s-list-item>
          <s-list-item>Backboard color selection</s-list-item>
          <s-list-item>Hanging options</s-list-item>
          <s-list-item>Real-time preview</s-list-item>
          <s-list-item>Price modifiers</s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section slot="aside" heading="Store Information">
        <s-paragraph>
          <s-text weight="semibold">Shop: </s-text>
          <s-text>{shopDomain}</s-text>
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
