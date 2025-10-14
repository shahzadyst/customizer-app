import {
  getFonts,
  getColors,
  getSizes,
  getUsageTypes,
  getAcrylicShapes,
  getBackboardColors,
  getHangingOptions,
} from "../models/signage.server";

export const loader = async ({ params }) => {
  const { shop } = params;

  if (!shop) {
    return Response.json({ error: "Shop parameter is required" }, { status: 400 });
  }

  try {
    const [fonts, colors, sizes, usageTypes, acrylicShapes, backboardColors, hangingOptions] = await Promise.all([
      getFonts(shop),
      getColors(shop),
      getSizes(shop),
      getUsageTypes(shop),
      getAcrylicShapes(shop),
      getBackboardColors(shop),
      getHangingOptions(shop),
    ]);

    return Response.json({
      success: true,
      config: {
        fonts: fonts.filter(f => f.isActive !== false),
        colors: colors.filter(c => c.isActive !== false),
        sizes: sizes.filter(s => s.isActive !== false),
        usageTypes: usageTypes.filter(u => u.isActive !== false),
        acrylicShapes: acrylicShapes.filter(a => a.isActive !== false),
        backboardColors: backboardColors.filter(b => b.isActive !== false),
        hangingOptions: hangingOptions.filter(h => h.isActive !== false),
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
