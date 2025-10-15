import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { getCustomizer } from "../models/customizer.server";

export const loader = async ({ request, params }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shopDomain = session.shop;
    const { id } = params;

    console.log('=== LOADER START ===');
    console.log('Loading customizer ID:', id);
    console.log('Shop:', shopDomain);

    const customizer = await getCustomizer(shopDomain, id);

    console.log('Found customizer:', customizer);

    if (!customizer) {
      console.error('Customizer not found');
      throw new Response("Customizer not found", { status: 404 });
    }

    return {
      shop: shopDomain,
      customizer,
    };
  } catch (error) {
    console.error('=== LOADER ERROR ===');
    console.error('Error:', error);
    throw error;
  }
};

export default function CustomizerSettings() {
  console.log('=== COMPONENT RENDERING ===');
  const data = useLoaderData();
  console.log('Component received data:', data);

  if (!data || !data.customizer) {
    console.log('No data or customizer in component');
    return (
      <s-page heading="Error">
        <s-section>
          <s-text>Failed to load customizer data</s-text>
        </s-section>
      </s-page>
    );
  }

  const { customizer } = data;
  console.log('Rendering customizer:', customizer.name);

  return (
    <s-page heading={`Settings: ${customizer.name}`}>
      <s-section>
        <s-stack direction="block" gap="base">
          <s-text>Customizer ID: {customizer.customizerId}</s-text>
          <s-text>Name: {customizer.name}</s-text>
          <s-text>Description: {customizer.description}</s-text>
          <s-text>Status: {customizer.isActive ? 'Active' : 'Inactive'}</s-text>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export function ErrorBoundary({ error }) {
  console.error('=== ERROR BOUNDARY ===');
  console.error('Error:', error);

  return (
    <s-page heading="Error">
      <s-section>
        <s-text color="critical">
          Error: {error?.message || 'Unknown error'}
        </s-text>
      </s-section>
    </s-page>
  );
}
