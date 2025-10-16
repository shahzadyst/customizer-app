import {
  getFonts,
  getColors,
  getSizes,
  getUsageTypes,
  getAcrylicShapes,
  getBackboardColors,
  getHangingOptions,
  getPricings,
} from "../models/signage.server";
import { getActiveCustomizers } from "../models/customizer.server";

export const loader = async ({ params, request }) => {
  const { shop } = params;
  const url = new URL(request.url);
  const customizerId = url.searchParams.get("customizerId");

  if (!shop) {
    return Response.json({ error: "Shop parameter is required" }, { status: 400 });
  }

  try {
    let targetCustomizerId = customizerId;

    if (!targetCustomizerId) {
      const customizers = await getActiveCustomizers(shop);
      if (customizers && customizers.length > 0) {
        targetCustomizerId = customizers[0]._id.toString();
      }
    }

    if (!targetCustomizerId) {
      return Response.json({
        success: false,
        error: "No active customizer found"
      }, { status: 404 });
    }

    const [fonts, colors, sizes, usageTypes, acrylicShapes, backboardColors, hangingOptions, pricings] = await Promise.all([
      getFonts(shop, targetCustomizerId),
      getColors(shop, targetCustomizerId),
      getSizes(shop, targetCustomizerId),
      getUsageTypes(shop, targetCustomizerId),
      getAcrylicShapes(shop, targetCustomizerId),
      getBackboardColors(shop, targetCustomizerId),
      getHangingOptions(shop, targetCustomizerId),
      getPricings(shop, targetCustomizerId),
    ]);

    return Response.json({
      success: true,
      config: {
        customizerId: targetCustomizerId,
        fonts: fonts.filter(f => f.isActive !== false),
        colors: colors.filter(c => c.isActive !== false),
        sizes: sizes.filter(s => s.isActive !== false),
        usageTypes: usageTypes.filter(u => u.isActive !== false),
        acrylicShapes: acrylicShapes.filter(a => a.isActive !== false),
        backboardColors: backboardColors.filter(b => b.isActive !== false),
        hangingOptions: hangingOptions.filter(h => h.isActive !== false),
        pricings: pricings.filter(p => p.isActive !== false),
      },
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
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
