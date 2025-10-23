import { useLoaderData, useNavigate, useFetcher, useSearchParams } from "react-router";
import { authenticate } from "../shopify.server";
import { getFonts, addFont, updateFont, getPricings } from "../models/signage.server";
import { useState, useEffect } from "react";

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const { customizerId } = params;

  const url = new URL(request.url);
  const fontId = url.searchParams.get('fontId');

  const fonts = await getFonts(session.shop);
  const pricings = await getPricings(session.shop);

  let font = null;
  if (fontId) {
    font = fonts.find(f => f._id.toString() === fontId);
  }

  return {
    shop: session.shop,
    customizerId,
    font,
    pricings
  };
};

export const action = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const { customizerId } = params;
  const formData = await request.formData();
  const action = formData.get("action");
  const fontId = formData.get("fontId");

  try {
    if (action === "save") {
      // Parse metrics if available
      let metrics = null;
      const metricsString = formData.get("metrics");
      if (metricsString && metricsString !== "null") {
        try {
          metrics = JSON.parse(metricsString);
        } catch (e) {
          console.error('Failed to parse metrics:', e);
        }
      }

      const fontData = {
        name: formData.get("name"),
        fontFamily: formData.get("fontFamily"),
        pricingId: formData.get("pricingId") || null,
        minHeightSmallest: formData.get("minHeightSmallest") ? parseFloat(formData.get("minHeightSmallest")) : null,
        minHeightUppercase: formData.get("minHeightUppercase") ? parseFloat(formData.get("minHeightUppercase")) : null,
        fontFileUrl: formData.get("fontFileUrl") || null,
        fontFileName: formData.get("fontFileName") || null,
        fileId: formData.get("fileId") || null,
        isCustomFont: formData.get("isCustomFont") === "true",
        metrics: metrics // Save metrics to database
      };

      if (fontId) {
        await updateFont(shop, fontId, fontData);
      } else {
        await addFont(shop, fontData, customizerId);
      }

      return { success: true, redirect: `/app/setting-customizers/${customizerId}?section=fonts` };
    }
  } catch (error) {
    console.error('Font form error:', error);
    return { error: error.message };
  }
};

const POPULAR_GOOGLE_FONTS = [
  "Roboto", "Open Sans", "Lato", "Montserrat", "Oswald", "Source Sans Pro",
  "Raleway", "PT Sans", "Merriweather", "Ubuntu", "Playfair Display",
  "Noto Sans", "Poppins", "Nunito", "Inter", "Work Sans", "Dancing Script",
  "Bebas Neue", "Lobster", "Pacifico", "Indie Flower", "Great Vibes",
  "Satisfy", "Permanent Marker", "Anton", "Righteous", "Abril Fatface",
  "Comfortaa", "Quicksand", "Archivo", "Barlow", "Bitter", "Cabin",
  "Crimson Text", "Exo", "Fjalla One", "Josefin Sans", "Karla", "Libre Baskerville",
  "Nanum Gothic", "Oxygen", "Prompt", "Questrial", "Roboto Condensed",
  "Rubik", "Shadows Into Light", "Titillium Web", "Varela Round", "Zilla Slab"
];

export default function FontFormPage() {
  const { customizerId, font, pricings } = useLoaderData();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [searchParams] = useSearchParams();

  const [showGoogleFontsModal, setShowGoogleFontsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadingFont, setUploadingFont] = useState(false);
  const [loadedFonts, setLoadedFonts] = useState(new Set());
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: font?.name || "",
    fontFamily: font?.fontFamily || "",
    pricingId: font?.pricingId || "",
    minHeightSmallest: font?.minHeightSmallest || "",
    minHeightUppercase: font?.minHeightUppercase || "",
    fontFileUrl: font?.fontFileUrl || "",
    fontFileName: font?.fontFileName || "",
    fileId: font?.fileId || "",
    isCustomFont: font?.isCustomFont || false
  });

  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.redirect) {
      navigate(fetcher.data.redirect);
    }
  }, [fetcher.data, navigate]);

  const validateFont = (name, fontFamily) => {
    const errors = {};
    if (!name || name.trim().length === 0) {
      errors.fontName = "Font name is required";
    }
    if (!fontFamily || fontFamily.trim().length === 0) {
      errors.fontFamily = "Font family is required";
    }
    return errors;
  };

  const loadGoogleFont = (fontFamily) => {
    if (!loadedFonts.has(fontFamily)) {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@400;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      setLoadedFonts(new Set([...loadedFonts, fontFamily]));
    }
  };

  const handleSelectGoogleFont = (fontFamily) => {
    loadGoogleFont(fontFamily);
    setFormData({
      ...formData,
      name: fontFamily,
      fontFamily: `'${fontFamily}'`,
      isCustomFont: false,
      fontFileUrl: "",
      fontFileName: "",
      fileId: "",
      // Google fonts will use default metrics or can be measured client-side
      metrics: {
        capHeightRatio: 0.7,
        xHeightRatio: 0.5,
        cmToPxRatio: 37.795,
        capHeightAt100px: 70,
        xHeightAt100px: 50
      }
    });
    setShowGoogleFontsModal(false);
  };

  const handleFileUpload = async (file) => {
    setUploadingFont(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('fontFile', file);

      const response = await fetch('/api/upload-font', {
        method: 'POST',
        body: uploadFormData
      });

      const result = await response.json();

      if (result.success) {
        const fontName = file.name.replace(/\.[^/.]+$/, '');
        setFormData({
          ...formData,
          name: fontName,
          fontFamily: fontName,
          fontFileUrl: result.fontFileUrl,
          fontFileName: result.fontFileName,
          fileId: result.fileId || '',
          isCustomFont: true,
          metrics: result.metrics || null // Store extracted metrics
        });
        
        // Show success message with metrics info
        if (result.metrics) {
          console.log('Font metrics extracted:', {
            capHeight: result.metrics.capHeightAt100px + 'px (at 100px)',
            xHeight: result.metrics.xHeightAt100px + 'px (at 100px)',
            ratio: (result.metrics.xHeightRatio / result.metrics.capHeightRatio).toFixed(2)
          });
        }
      } else {
        alert('Failed to upload font: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Font upload error:', error);
      alert('Failed to upload font file. Please try again.');
    } finally {
      setUploadingFont(false);
    }
  };

  const handleSubmit = (e) => {
    const validationErrors = validateFont(formData.name, formData.fontFamily);
    if (Object.keys(validationErrors).length > 0) {
      e.preventDefault();
      setErrors(validationErrors);
      return;
    }
    setErrors({});
  };

  const filteredGoogleFonts = POPULAR_GOOGLE_FONTS.filter(font =>
    font.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isEditing = !!font;

  return (
    <s-page
      title={isEditing ? "Edit Font" : "Add Font"}
      onBack={() => navigate(`/app/setting-customizers/${customizerId}?section=fonts`)}
    >
      <s-layout>
        <s-layout-section>
          <s-box padding="base" background="surface">
            <fetcher.Form method="post" onSubmit={handleSubmit}>
              <input type="hidden" name="action" value="save" />
              {font && <input type="hidden" name="fontId" value={font._id.toString()} />}

              <s-stack direction="block" gap="large">
                <div style={{
                  padding: '32px',
                  textAlign: 'center',
                  background: '#fafafa',
                  borderRadius: '8px',
                  border: '2px dashed #ddd'
                }}>
                  <s-text weight="semibold" style={{ display: 'block', marginBottom: '8px' }}>
                    Choose Font Source
                  </s-text>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '16px' }}>
                    You can upload a .ttf font file or select "Use Google Font" and easily add a font from the Google font library
                  </p>

                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => document.getElementById('font-file-upload').click()}
                      disabled={uploadingFont}
                      style={{
                        padding: '8px 16px',
                        background: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: uploadingFont ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        opacity: uploadingFont ? 0.6 : 1
                      }}
                    >
                      {uploadingFont ? 'Uploading...' : formData.fontFileName ? 'Change File' : 'Add file'}
                    </button>
                    {formData.fontFileName && !uploadingFont && (
                      <div style={{
                        padding: '6px 12px',
                        background: '#e8f5e9',
                        color: '#2e7d32',
                        borderRadius: '4px',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span>✓</span>
                        <span>{formData.fontFileName}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowGoogleFontsModal(true)}
                      style={{
                        padding: '8px 16px',
                        background: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500
                      }}
                    >
                      Use Google Font
                    </button>
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    Don't have a .ttf font file? Use the{' '}
                    <a href="https://cloudconvert.com/ttf-converter" target="_blank" rel="noopener noreferrer" style={{ color: '#0066cc' }}>
                      free service "Cloud Convert"
                    </a>
                    {' '}to convert your font.
                  </div>
                  <input
                    id="font-file-upload"
                    type="file"
                    accept=".ttf,.otf,.woff,.woff2"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Font Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      name="name"
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid ' + (errors.fontName ? '#d32f2f' : '#ddd'),
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                    {errors.fontName && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.fontName}</div>}
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Font Family (CSS) *</label>
                    <input
                      type="text"
                      value={formData.fontFamily}
                      onChange={(e) => setFormData({ ...formData, fontFamily: e.target.value })}
                      name="fontFamily"
                      placeholder="e.g., 'Roboto', sans-serif"
                      required
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid ' + (errors.fontFamily ? '#d32f2f' : '#ddd'),
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                    {errors.fontFamily && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.fontFamily}</div>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Pricing</label>
                    <select
                      value={formData.pricingId}
                      onChange={(e) => setFormData({ ...formData, pricingId: e.target.value })}
                      name="pricingId"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        background: 'white'
                      }}
                    >
                      <option value="">Select pricing</option>
                      {pricings.map(p => (
                        <option key={p._id.toString()} value={p._id.toString()}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                      Min Height (Smallest)
                      <span style={{ fontSize: '12px', color: '#666', fontWeight: 400, marginLeft: '4px' }}>cm</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.minHeightSmallest}
                      onChange={(e) => setFormData({ ...formData, minHeightSmallest: e.target.value })}
                      name="minHeightSmallest"
                      placeholder="8.3"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                      Min Height (Uppercase)
                      <span style={{ fontSize: '12px', color: '#666', fontWeight: 400, marginLeft: '4px' }}>cm</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.minHeightUppercase}
                      onChange={(e) => setFormData({ ...formData, minHeightUppercase: e.target.value })}
                      name="minHeightUppercase"
                      placeholder="8.3"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>

                <input type="hidden" name="fontFileUrl" value={formData.fontFileUrl} />
                <input type="hidden" name="fontFileName" value={formData.fontFileName} />
                <input type="hidden" name="fileId" value={formData.fileId} />
                <input type="hidden" name="isCustomFont" value={formData.isCustomFont} />
                <input type="hidden" name="metrics" value={JSON.stringify(formData.metrics)} />

                <div style={{ display: 'flex', gap: '8px' }}>
                  <s-button type="submit" variant="primary" disabled={uploadingFont}>
                    {uploadingFont ? 'Uploading...' : (isEditing ? 'Update Font' : 'Add Font')}
                  </s-button>
                  <s-button
                    type="button"
                    onClick={() => navigate(`/app/setting-customizers/${customizerId}?section=fonts`)}
                    variant="secondary"
                  >
                    Cancel
                  </s-button>
                </div>
              </s-stack>
            </fetcher.Form>
          </s-box>
        </s-layout-section>
      </s-layout>

      {showGoogleFontsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <s-text variant="headingMd">Select Google Font</s-text>
              <input
                type="text"
                placeholder="Search fonts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  marginTop: '12px'
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {filteredGoogleFonts.map((fontFamily) => (
                <button
                  key={fontFamily}
                  type="button"
                  onClick={() => handleSelectGoogleFont(fontFamily)}
                  onMouseEnter={() => loadGoogleFont(fontFamily)}
                  style={{
                    padding: '12px',
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontFamily: `'${fontFamily}', sans-serif`
                  }}
                >
                  {fontFamily}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowGoogleFontsModal(false)}
              style={{
                padding: '8px 16px',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                width: '100%'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </s-page>
  );
}
