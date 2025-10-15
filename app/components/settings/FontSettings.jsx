import { useState } from "react";
import { useFetcher } from "react-router";

export default function FontSettings({ fonts }) {
  const fetcher = useFetcher();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFont, setNewFont] = useState({ name: "", fontFamily: "" });
  const [errors, setErrors] = useState({});

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

  const handleAddFont = (e) => {
    const validationErrors = validateFont(newFont.name, newFont.fontFamily);
    if (Object.keys(validationErrors).length > 0) {
      e.preventDefault();
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setNewFont({ name: "", fontFamily: "" });
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Font Name *</label>
                <input
                  type="text"
                  value={newFont.name}
                  onChange={(e) => setNewFont({ ...newFont, name: e.target.value })}
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
                  value={newFont.fontFamily}
                  onChange={(e) => setNewFont({ ...newFont, fontFamily: e.target.value })}
                  name="fontFamily"
                  placeholder="e.g., Arial, sans-serif"
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
              <div style={{ display: 'flex', gap: '8px' }}>
                <s-button type="submit" variant="primary">Save Font</s-button>
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
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Font Name</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Font Family</th>
              <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fonts.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
                  No fonts added yet. Click "Add Font" to get started.
                </td>
              </tr>
            ) : (
              fonts.map((font) => (
                <tr key={font._id.toString()} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '16px' }}>
                    <s-text weight="semibold">{font.name}</s-text>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <s-text color="subdued">{font.fontFamily}</s-text>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <fetcher.Form method="post" style={{ display: 'inline' }}>
                      <input type="hidden" name="action" value="deleteFont" />
                      <input type="hidden" name="id" value={font._id.toString()} />
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
