import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopDomain = session.shop;

  const appUrl = process.env.SHOPIFY_APP_URL || "";
  const embedUrl = `${appUrl}/embed/${shopDomain}`;

  return {
    shopDomain,
    embedUrl,
    scriptTag: `<script src="${embedUrl}" defer></script>`,
  };
};

export default function Embed() {
  const { shopDomain, embedUrl, scriptTag } = useLoaderData();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <s-page heading="Embed Script">
      <s-section heading="Installation Instructions">
        <s-stack direction="block" gap="large">
          <s-paragraph>
            To enable the signage customizer on your storefront, you need to add
            the embed script to your theme. Follow these steps:
          </s-paragraph>

          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading level={3}>Step 1: Copy the Script Tag</s-heading>
              <s-paragraph>
                Copy the script tag below and paste it into your theme's layout file
                (usually theme.liquid) before the closing &lt;/body&gt; tag.
              </s-paragraph>

              <s-box
                padding="base"
                borderWidth="base"
                borderRadius="base"
                background="subdued"
              >
                <s-stack direction="inline" gap="base" alignment="space-between">
                  <pre style={{ margin: 0, flex: 1 }}>
                    <code>{scriptTag}</code>
                  </pre>
                  <s-button
                    onClick={() => copyToClipboard(scriptTag)}
                    variant="secondary"
                    size="small"
                  >
                    Copy
                  </s-button>
                </s-stack>
              </s-box>
            </s-stack>
          </s-box>

          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading level={3}>Step 2: Add Customizer Button</s-heading>
              <s-paragraph>
                Add a button to your product page template where you want customers
                to access the signage customizer. Use this code:
              </s-paragraph>

              <s-box
                padding="base"
                borderWidth="base"
                borderRadius="base"
                background="subdued"
              >
                <s-stack direction="inline" gap="base" alignment="space-between">
                  <pre style={{ margin: 0, flex: 1 }}>
                    <code>{`<button class="signage-customizer-btn" data-product-id="{{ product.id }}">
  Customize Signage
</button>`}</code>
                  </pre>
                  <s-button
                    onClick={() => copyToClipboard(`<button class="signage-customizer-btn" data-product-id="{{ product.id }}">
  Customize Signage
</button>`)}
                    variant="secondary"
                    size="small"
                  >
                    Copy
                  </s-button>
                </s-stack>
              </s-box>
            </s-stack>
          </s-box>

          <s-box padding="base" borderWidth="base" borderRadius="base">
            <s-stack direction="block" gap="base">
              <s-heading level={3}>Script URL</s-heading>
              <s-paragraph>
                This is the URL where the embed script is hosted. It's unique to your store.
              </s-paragraph>

              <s-box
                padding="base"
                borderWidth="base"
                borderRadius="base"
                background="subdued"
              >
                <s-stack direction="inline" gap="base" alignment="space-between">
                  <pre style={{ margin: 0, flex: 1 }}>
                    <code>{embedUrl}</code>
                  </pre>
                  <s-button
                    onClick={() => copyToClipboard(embedUrl)}
                    variant="secondary"
                    size="small"
                  >
                    Copy
                  </s-button>
                </s-stack>
              </s-box>
            </s-stack>
          </s-box>

          <s-banner tone="info">
            <s-stack direction="block" gap="tight">
              <s-text weight="semibold">Important Notes:</s-text>
              <s-unordered-list>
                <s-list-item>
                  The script automatically loads your store's configuration from the Settings page.
                </s-list-item>
                <s-list-item>
                  Make sure you've configured at least some options in the Settings page before testing.
                </s-list-item>
                <s-list-item>
                  The customizer modal will appear when customers click the "Customize Signage" button.
                </s-list-item>
              </s-unordered-list>
            </s-stack>
          </s-banner>
        </s-stack>
      </s-section>

      <s-section heading="Store Information">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            <s-text weight="semibold">Shop Domain: </s-text>
            {shopDomain}
          </s-paragraph>
        </s-stack>
      </s-section>
    </s-page>
  );
}
