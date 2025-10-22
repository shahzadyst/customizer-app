import { authenticate } from "../shopify.server";
import { supabase } from "../supabase.server";

export const action = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop = session.shop;

    const formData = await request.formData();
    const fontFile = formData.get("fontFile");

    if (!fontFile || !(fontFile instanceof File)) {
      return Response.json({ error: "No font file provided" }, { status: 400 });
    }

    const allowedTypes = [
      'font/ttf',
      'font/otf',
      'font/woff',
      'font/woff2',
      'application/x-font-ttf',
      'application/x-font-otf',
      'application/octet-stream'
    ];

    if (!allowedTypes.includes(fontFile.type) && !fontFile.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
      return Response.json({ error: "Invalid font file type. Only TTF, OTF, WOFF, and WOFF2 files are allowed." }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024;
    if (fontFile.size > maxSize) {
      return Response.json({ error: "Font file is too large. Maximum size is 5MB." }, { status: 400 });
    }

    const fileExt = fontFile.name.split('.').pop();
    const timestamp = Date.now();
    const sanitizedShop = shop.replace(/[^a-z0-9]/gi, '-');
    const fileName = `${sanitizedShop}/${timestamp}-${fontFile.name.replace(/[^a-z0-9.-]/gi, '-')}`;

    const arrayBuffer = await fontFile.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { data, error } = await supabase.storage
      .from('font-files')
      .upload(fileName, buffer, {
        contentType: fontFile.type || 'application/octet-stream',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return Response.json({ error: `Failed to upload font file: ${error.message}` }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from('font-files')
      .getPublicUrl(fileName);

    return Response.json({
      success: true,
      fontFileUrl: urlData.publicUrl,
      fontFileName: fontFile.name
    });

  } catch (error) {
    console.error('Font upload error:', error);
    return Response.json({ error: error.message || "Failed to upload font file" }, { status: 500 });
  }
};
