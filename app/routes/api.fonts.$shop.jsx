import { getFonts } from "../models/signage.server";

export const loader = async ({ params }) => {
  const { shop } = params;

  try {
    const fonts = await getFonts(shop);

    const customFonts = fonts.filter(font => font.isCustomFont && font.fontFileUrl);

    let cssContent = '';

    customFonts.forEach(font => {
      const fontFamily = font.fontFamily.replace(/['"]/g, '').split(',')[0].trim();
      const fontFormat = font.fontFileName?.endsWith('.woff2') ? 'woff2' :
                        font.fontFileName?.endsWith('.woff') ? 'woff' :
                        font.fontFileName?.endsWith('.otf') ? 'opentype' :
                        'truetype';

      cssContent += `
@font-face {
  font-family: '${fontFamily}';
  src: url('${font.fontFileUrl}') format('${fontFormat}');
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
