import { Link, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import {
  getFonts,
  getColors,
  getSizes,
  getUsageTypes,
  getAcrylicShapes,
  getBackboardColors,
  getHangingOptions,
} from "../models/signage.server";
import { getCustomizers } from "../models/customizer.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop;

  const [fonts, colors, sizes, usageTypes, acrylicShapes, backboardColors, hangingOptions, customizers] = await Promise.all([
    getFonts(shopDomain),
    getColors(shopDomain),
    getSizes(shopDomain),
    getUsageTypes(shopDomain),
    getAcrylicShapes(shopDomain),
    getBackboardColors(shopDomain),
    getHangingOptions(shopDomain),
    getCustomizers(shopDomain),
  ]);

  const stats = {
    fonts: fonts.length,
    colors: colors.length,
    sizes: sizes.length,
    usageTypes: usageTypes.length,
    acrylicShapes: acrylicShapes.length,
    backboardColors: backboardColors.length,
    hangingOptions: hangingOptions.length,
  };

  return { stats, shopDomain, customizers };
};

export default function Index() {
  const { stats, shopDomain, customizers } = useLoaderData();

  const totalOptions = Object.values(stats).reduce((sum, count) => sum + count, 0);

  return (
    <s-page heading="Signage Customizer App">
      <s-section heading="Welcome to Your Signage Customizer">
        <s-paragraph>
          Create fully customizable signage experiences for your customers with multiple customizers, each configurable independently.
        </s-paragraph>
      </s-section>

      <s-section heading="Quick Stats">
        <s-stack direction="block" gap="large">
          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading level={3}>Configuration Status</s-heading>
              <s-stack direction="block" gap="tight">
                <s-text>Active Customizers: {customizers.filter(c => c.isActive).length} of {customizers.length}</s-text>
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

          {customizers.length === 0 && (
            <s-banner tone="warning">
              <s-stack direction="block" gap="tight">
                <s-text weight="semibold">Getting Started</s-text>
                <s-text>
                  You haven't created any customizers yet. Create your first customizer to get started.
                </s-text>
              </s-stack>
            </s-banner>
          )}

          {totalOptions === 0 && customizers.length > 0 && (
            <s-banner tone="warning">
              <s-stack direction="block" gap="tight">
                <s-text weight="semibold">Configure Options</s-text>
                <s-text>
                  You have customizers but no options configured. Go to Settings to add fonts, colors, sizes, and other options.
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
              <s-heading level={3}>Step 1: Create a Customizer</s-heading>
              <s-paragraph>
                Create one or more customizers that you can add to different locations on your store.
              </s-paragraph>
              <Link to="/app/customizers">
                <s-button variant="primary">Manage Customizers</s-button>
              </Link>
            </s-stack>
          </s-box>

          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading level={3}>Step 2: Configure Options</s-heading>
              <s-paragraph>
                Add and manage all your customization options like fonts, colors, sizes, and more.
              </s-paragraph>
              <Link to="/app/settings">
                <s-button variant="primary">Go to Settings</s-button>
              </Link>
            </s-stack>
          </s-box>

          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading level={3}>Step 3: Add to Your Theme</s-heading>
              <s-paragraph>
                Go to your theme editor, add the "Sign Customizer" app block, and enter your customizer ID. No manual code installation needed!
              </s-paragraph>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Features">
        <s-unordered-list>
          <s-list-item>Multiple customizers with active/inactive states</s-list-item>
          <s-list-item>Easy theme integration via app blocks</s-list-item>
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
