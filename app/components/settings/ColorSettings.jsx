import { useState } from "react";
import { useFetcher } from "react-router";

export default function ColorSettings({ colors }) {
  const fetcher = useFetcher();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newColor, setNewColor] = useState({ name: "", hex: "#000000" });
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

  const handleAddColor = (e) => {
    const validationErrors = validateColor(newColor.name, newColor.hex);
    if (Object.keys(validationErrors).length > 0) {
      e.preventDefault();
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setNewColor({ name: "", hex: "#000000" });
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
        <s-text size="large" weight="semibold">Colors</s-text>
        <s-button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="primary"
        >
          {showAddForm ? 'Cancel' : 'Add Color'}
        </s-button>
      </div>

      {showAddForm && (
        <s-box padding="base" background="surface" style={{ marginBottom: '24px' }}>
          <fetcher.Form method="post" onSubmit={handleAddColor}>
            <input type="hidden" name="action" value="addColor" />
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Color</s-text>
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Hex Code *</label>
                <input
                  type="text"
                  value={newColor.hex}
                  onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                  name="hex"
                  placeholder="#000000"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid ' + (errors.colorHex ? '#d32f2f' : '#ddd'),
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                {errors.colorHex && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.colorHex}</div>}
              </div>
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
              <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {colors.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
                  No colors added yet. Click "Add Color" to get started.
                </td>
              </tr>
            ) : (
              colors.map((color) => (
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
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <fetcher.Form method="post" style={{ display: 'inline' }}>
                      <input type="hidden" name="action" value="deleteColor" />
                      <input type="hidden" name="id" value={color._id.toString()} />
                      <s-button size="small" variant="destructive" type="submit">Delete</s-button>
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
