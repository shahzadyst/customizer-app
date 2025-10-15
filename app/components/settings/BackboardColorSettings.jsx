import { useState } from "react";
import { useFetcher } from "react-router";

export default function BackboardColorSettings({ backboardColors }) {
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

  const handleAdd = (e) => {
    e.preventDefault();
    const validationErrors = validateColor(newColor.name, newColor.hex);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    e.target.submit();
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
              <s-text-field
                label="Color Name"
                value={newColor.name}
                onChange={(value) => setNewColor({ ...newColor, name: value })}
                name="name"
                error={errors.colorName}
                required
              />
              <s-text-field
                label="Hex Code"
                value={newColor.hex}
                onChange={(value) => setNewColor({ ...newColor, hex: value })}
                name="hex"
                placeholder="#000000"
                error={errors.colorHex}
                required
              />
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
            {backboardColors.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
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
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <fetcher.Form method="post" style={{ display: 'inline' }}>
                      <input type="hidden" name="action" value="deleteBackboardColor" />
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
