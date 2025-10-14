import { json } from "react-router";
import { getStoreByDomain, getStoreOptions } from "../supabase.server";

export const loader = async ({ params }) => {
  const { shop } = params;

  if (!shop) {
    return json({ error: "Shop parameter is required" }, { status: 400 });
  }

  try {
    const store = await getStoreByDomain(shop);

    if (!store) {
      return json({ error: "Store not found" }, { status: 404 });
    }

    const options = await getStoreOptions(store.id);

    return json({
      success: true,
      config: options,
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const OPTIONS = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
};
