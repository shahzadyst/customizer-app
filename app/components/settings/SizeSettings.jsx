import { useState } from "react";
import { useFetcher } from "react-router";

export default function SizeSettings({ sizes }) {
  const fetcher = useFetcher();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSize, setNewSize] = useState({ width: "", height: "" });
  const [errors, setErrors] = useState({});

  const validateSize = (width, height) => {
    const errors = {};
    const w = parseFloat(width);
    const h = parseFloat(height);
    if (!width || isNaN(w) || w <= 0) {
      errors.sizeWidth = "Width must be a positive number";
    }
    if (!height || isNaN(h) || h <= 0) {
      errors.sizeHeight = "Height must be a positive number";
    }
    return errors;
  };

  const handleAddSize = (e) => {
    const validationErrors = validateSize(newSize.width, newSize.height);
    if (Object.keys(validationErrors).length > 0) {
      e.preventDefault();
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setNewSize({ width: "", height: "" });
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
        <s-text size="large" weight="semibold">Sizes</s-text>
        <s-button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="primary"
        >
          {showAddForm ? 'Cancel' : 'Add Size'}
        </s-button>
      </div>

      {showAddForm && (
        <s-box padding="base" background="surface" style={{ marginBottom: '24px' }}>
          <fetcher.Form method="post" onSubmit={handleAddSize}>
            <input type="hidden" name="action" value="addSize" />
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Size</s-text>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Width (inches) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={newSize.width}
                  onChange={(e) => setNewSize({ ...newSize, width: e.target.value })}
                  name="width"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid ' + (errors.sizeWidth ? '#d32f2f' : '#ddd'),
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                {errors.sizeWidth && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.sizeWidth}</div>}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Height (inches) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={newSize.height}
                  onChange={(e) => setNewSize({ ...newSize, height: e.target.value })}
                  name="height"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid ' + (errors.sizeHeight ? '#d32f2f' : '#ddd'),
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                {errors.sizeHeight && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.sizeHeight}</div>}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <s-button type="submit" variant="primary">Save Size</s-button>
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
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Dimensions</th>
              <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sizes.length === 0 ? (
              <tr>
                <td colSpan="2" style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
                  No sizes added yet. Click "Add Size" to get started.
                </td>
              </tr>
            ) : (
              sizes.map((size) => (
                <tr key={size._id.toString()} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '16px' }}>
                    <s-text weight="semibold">{size.width}" × {size.height}"</s-text>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <fetcher.Form method="post" style={{ display: 'inline' }}>
                      <input type="hidden" name="action" value="deleteSize" />
                      <input type="hidden" name="id" value={size._id.toString()} />
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
