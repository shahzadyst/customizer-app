import { useState } from "react";
import { useFetcher } from "react-router";

export default function BackboardColorSettings({ backboardColors }) {
  const fetcher = useFetcher();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newColor, setNewColor] = useState({ name: "", hex: "#000000", additionalPricing: "none", basePrice: "" });
  const [errors, setErrors] = useState({});

  const validateColor = (name, hex) => {
    const errors = {};
    if (!name || name.trim().length === 0) {
      errors.colorName = "Color name is required";
    }
    if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      errors.colorHex = "Valid hex color is required (e.g., #000000)";
    }
    return errors;
  };

  const handleAdd = (e) => {
    const validationErrors = validateColor(newColor.name, newColor.hex);
    if (Object.keys(validationErrors).length > 0) {
      e.preventDefault();
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setNewColor({ name: "", hex: "#000000", additionalPricing: "none", basePrice: "" });
    setShowAddForm(false);
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <s-text size="large" weight="semibold">Backboard Colors</s-text>
        <s-button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="primary"
        >
          {showAddForm ? 'Cancel' : 'Add Color'}
        </s-button>
      </div>

      {showAddForm && (
        <s-box padding="base" background="surface" style={{ marginBottom: '24px' }}>
          <fetcher.Form method="post" onSubmit={handleAdd}>
            <input type="hidden" name="action" value="addBackboardColor" />
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Backboard Color</s-text>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Color Name *</label>
                <input
                  type="text"
                  value={newColor.name}
                  onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                  name="name"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid ' + (errors.colorName ? '#d32f2f' : '#ddd'),
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                {errors.colorName && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.colorName}</div>}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Color *</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={newColor.hex}
                        onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                        style={{
                          width: '60px',
                          height: '40px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      />
                      <input
                        type="text"
                        value={newColor.hex}
                        onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                        name="hex"
                        placeholder="#000000"
                        required
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '1px solid ' + (errors.colorHex ? '#d32f2f' : '#ddd'),
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    {errors.colorHex && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.colorHex}</div>}
                  </div>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Additional Pricing</label>
                <select
                  value={newColor.additionalPricing}
                  onChange={(e) => setNewColor({ ...newColor, additionalPricing: e.target.value })}
                  name="additionalPricing"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    background: 'white'
                  }}
                >
                  <option value="none">None</option>
                  <option value="basePrice">Base Price</option>
                </select>
              </div>
              {newColor.additionalPricing === 'basePrice' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Base Price *</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#666' }}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={newColor.basePrice}
                      onChange={(e) => setNewColor({ ...newColor, basePrice: e.target.value })}
                      name="basePrice"
                      placeholder="0.00"
                      required
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <s-button type="submit" variant="primary">Save Color</s-button>
                <s-button onClick={() => setShowAddForm(false)} variant="secondary">Cancel</s-button>
              </div>
            </s-stack>
          </fetcher.Form>
        </s-box>
      )}

      <s-box background="surface">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Preview</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Color Name</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Hex Code</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Base Price</th>
              <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {backboardColors.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
                  No backboard colors added yet. Click "Add Color" to get started.
                </td>
              </tr>
            ) : (
              backboardColors.map((color) => (
                <tr key={color._id.toString()} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: color.hex,
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }} />
                  </td>
                  <td style={{ padding: '16px' }}>
                    <s-text weight="semibold">{color.name}</s-text>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <s-text color="subdued">{color.hex}</s-text>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <s-text color="subdued">{color.basePrice ? `$${color.basePrice}` : '-'}</s-text>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <fetcher.Form method="post" style={{ display: 'inline' }}>
                      <input type="hidden" name="action" value="deleteBackboardColor" />
                      <input type="hidden" name="id" value={color._id.toString()} />
                      <button
                        type="submit"
                        style={{
                          padding: '6px 12px',
                          background: '#d32f2f',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 500,
                          fontFamily: 'system-ui, -apple-system, sans-serif'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#b71c1c'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#d32f2f'}
                      >
                        Delete
                      </button>
                    </fetcher.Form>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </s-box>
    </div>
  );
}
