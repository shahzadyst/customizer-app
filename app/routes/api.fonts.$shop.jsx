import { getFonts } from "../models/signage.server";

export const loader = async ({ params, request }) => {
  const { shop } = params;

  try {
    const fonts = await getFonts(shop);

    const customFonts = fonts.filter(font => font.isCustomFont && font.fontFileUrl);

    const url = new URL(request.url);
    const appUrl = process.env.SHOPIFY_APP_URL || `${url.protocol}//${url.host}`;

    let cssContent = '';

    customFonts.forEach(font => {
      const fontFamily = font.fontFamily.replace(/['"]/g, '').split(',')[0].trim();
      const fontFormat = font.fontFileName?.endsWith('.woff2') ? 'woff2' :
                        font.fontFileName?.endsWith('.woff') ? 'woff' :
                        font.fontFileName?.endsWith('.otf') ? 'opentype' :
                        'truetype';

      const fontUrl = font.fontFileUrl.startsWith('http')
        ? font.fontFileUrl
        : `${appUrl}${font.fontFileUrl}`;

      cssContent += `
@font-face {
  font-family: '${fontFamily}';
  src: url('${fontUrl}') format('${fontFormat}');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
`;
    });

    return new Response(cssContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/css',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error generating font CSS:', error);
    return new Response('/* Error loading fonts */', {
      status: 500,
      headers: {
        'Content-Type': 'text/css'
      }
    });
  }
};
