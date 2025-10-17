import { useState, useEffect } from "react";
import { useFetcher } from "react-router";

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

export default function FontSettings({ fonts, pricings = [] }) {
  const fetcher = useFetcher();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showGoogleFontsModal, setShowGoogleFontsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFont, setNewFont] = useState({
    name: "",
    fontFamily: "",
    pricingId: "",
    minHeightSmallest: "",
    minHeightUppercase: ""
  });
  const [errors, setErrors] = useState({});
  const [loadedFonts, setLoadedFonts] = useState(new Set());

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
    setNewFont({
      ...newFont,
      name: fontFamily,
      fontFamily: `'${fontFamily}', sans-serif`
    });
    setShowGoogleFontsModal(false);
  };

  const handleAddFont = (e) => {
    const validationErrors = validateFont(newFont.name, newFont.fontFamily);
    if (Object.keys(validationErrors).length > 0) {
      e.preventDefault();
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setNewFont({
      name: "",
      fontFamily: "",
      pricingId: "",
      minHeightSmallest: "",
      minHeightUppercase: ""
    });
    setShowAddForm(false);
  };

  const filteredFonts = POPULAR_GOOGLE_FONTS.filter(font =>
    font.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    filteredFonts.slice(0, 20).forEach(font => loadGoogleFont(font));
  }, [searchQuery]);

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <s-text size="large" weight="semibold">Fonts</s-text>
        <s-button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="primary"
        >
          {showAddForm ? 'Cancel' : 'Add Font'}
        </s-button>
      </div>

      {showAddForm && (
        <s-box padding="base" background="surface" style={{ marginBottom: '24px' }}>
          <fetcher.Form method="post" onSubmit={handleAddFont}>
            <input type="hidden" name="action" value="addFont" />
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Font</s-text>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Label *</label>
                <input
                  type="text"
                  value={newFont.name}
                  onChange={(e) => setNewFont({ ...newFont, name: e.target.value })}
                  name="name"
                  placeholder="Comics"
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
                <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                  For best results keep the label of the font to one word only as this label is shown to the customer.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Font</label>
                <div style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
                  You can upload a .ttf font file or select "Use Google Font" and easily add a font from the Google font library
                </div>

                <div style={{
                  border: '2px dashed #ddd',
                  borderRadius: '8px',
                  padding: '32px',
                  textAlign: 'center',
                  background: '#fafafa'
                }}>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center', marginBottom: '12px' }}>
                    <button
                      type="button"
                      onClick={() => document.getElementById('font-file-upload').click()}
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
                      Add file
                    </button>
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
                    accept=".ttf"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files[0]) {
                        alert('Font file upload will be implemented. For now, please use Google Fonts or enter font family manually.');
                      }
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Font Family (CSS) *</label>
                <input
                  type="text"
                  value={newFont.fontFamily}
                  onChange={(e) => setNewFont({ ...newFont, fontFamily: e.target.value })}
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

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Pricing</label>
                <select
                  value={newFont.pricingId}
                  onChange={(e) => setNewFont({ ...newFont, pricingId: e.target.value })}
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
                  <option value="">No specific pricing</option>
                  {pricings.map((pricing) => (
                    <option key={pricing._id.toString()} value={pricing._id.toString()}>
                      {pricing.name}
                    </option>
                  ))}
                </select>
                <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                  Optionally assign a pricing configuration to this font for advanced pricing rules.
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: '#f6f6f7',
                borderRadius: '8px',
                marginTop: '8px'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Minimum height of font letters</h3>
                <p style={{ color: '#666', fontSize: '13px', marginBottom: '16px' }}>
                  The minimum heights values set here will be used as the minimum heights for the sign size.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                      Minimum Height of Smallest Letter *
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        step="0.1"
                        value={newFont.minHeightSmallest}
                        onChange={(e) => setNewFont({ ...newFont, minHeightSmallest: e.target.value })}
                        name="minHeightSmallest"
                        placeholder="4.2"
                        required
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      <span style={{ fontSize: '14px', color: '#666' }}>cm</span>
                    </div>
                    <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                      The minimum height of the smallest letter in centimeters.
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                      Minimum Height of Uppercase Letter *
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        step="0.1"
                        value={newFont.minHeightUppercase}
                        onChange={(e) => setNewFont({ ...newFont, minHeightUppercase: e.target.value })}
                        name="minHeightUppercase"
                        placeholder="8.3"
                        required
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                      <span style={{ fontSize: '14px', color: '#666' }}>cm</span>
                    </div>
                    <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                      The minimum height of the uppercase letter in centimeters.
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <s-button type="submit" variant="primary">Save Font</s-button>
                <s-button type="button" onClick={() => setShowAddForm(false)} variant="secondary">Cancel</s-button>
              </div>
            </s-stack>
          </fetcher.Form>
        </s-box>
      )}

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
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '700px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Select Google Font</h2>
              <button
                onClick={() => setShowGoogleFontsModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  width: '32px',
                  height: '32px'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e0e0e0' }}>
              <input
                type="text"
                placeholder="Search fonts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px'
            }}>
              {filteredFonts.map((font) => (
                <div
                  key={font}
                  onClick={() => handleSelectGoogleFont(font)}
                  style={{
                    padding: '16px',
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    ':hover': { background: '#f5f5f5' }
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontWeight: 500, marginBottom: '8px' }}>{font}</div>
                  <div
                    style={{
                      fontFamily: `'${font}', sans-serif`,
                      fontSize: '18px',
                      color: '#333'
                    }}
                  >
                    The quick brown fox jumps over the lazy dog
                  </div>
                </div>
              ))}
              {filteredFonts.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
                  No fonts found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <s-box background="surface">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Font Name</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Font Family</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Pricing</th>
              <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fonts.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
                  No fonts added yet. Click "Add Font" to get started.
                </td>
              </tr>
            ) : (
              fonts.map((font) => {
                const pricing = pricings.find(p => p._id.toString() === font.pricingId);
                return (
                  <tr key={font._id.toString()} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '16px' }}>
                      <s-text weight="semibold">{font.name}</s-text>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <s-text color="subdued">{font.fontFamily}</s-text>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <s-text color="subdued">{pricing ? pricing.name : '-'}</s-text>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <fetcher.Form method="post" style={{ display: 'inline' }}>
                        <input type="hidden" name="action" value="deleteFont" />
                        <input type="hidden" name="id" value={font._id.toString()} />
                        <s-button size="small" variant="destructive" type="submit">Delete</s-button>
                      </fetcher.Form>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </s-box>
    </div>
  );
}
