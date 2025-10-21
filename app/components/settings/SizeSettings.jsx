import { useState } from "react";
import { useFetcher } from "react-router";

export default function SizeSettings({ sizes }) {
  const fetcher = useFetcher();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newSize, setNewSize] = useState({ label: "", multiplier: "" });
  const [editSize, setEditSize] = useState({});
  const [errors, setErrors] = useState({});

  const validateSize = (label, multiplier) => {
    const errors = {};
    const m = parseFloat(multiplier);
    if (!label || label.trim().length === 0) {
      errors.label = "Label is required";
    }
    if (!multiplier || isNaN(m) || m <= 0) {
      errors.multiplier = "Multiplier must be a positive number";
    }
    return errors;
  };

  const handleAddSize = (e) => {
    const validationErrors = validateSize(newSize.label, newSize.multiplier);
    if (Object.keys(validationErrors).length > 0) {
      e.preventDefault();
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setNewSize({ label: "", multiplier: "" });
    setShowAddForm(false);
  };

  const handleEditClick = (size) => {
    setEditingId(size._id.toString());
    setEditSize({
      label: size.label,
      multiplier: size.multiplier
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditSize({});
    setErrors({});
  };

  const handleUpdateSize = (e) => {
    const validationErrors = validateSize(editSize.label, editSize.multiplier);
    if (Object.keys(validationErrors).length > 0) {
      e.preventDefault();
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setEditingId(null);
    setEditSize({});
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
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Label *</label>
                <input
                  type="text"
                  value={newSize.label}
                  onChange={(e) => setNewSize({ ...newSize, label: e.target.value })}
                  name="label"
                  placeholder="Small"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid ' + (errors.label ? '#d32f2f' : '#ddd'),
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                {errors.label && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.label}</div>}
                <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                  The name of the size (e.g. small).
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Size Scale Multiplier *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newSize.multiplier}
                  onChange={(e) => setNewSize({ ...newSize, multiplier: e.target.value })}
                  name="multiplier"
                  placeholder="1.13"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid ' + (errors.multiplier ? '#d32f2f' : '#ddd'),
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                {errors.multiplier && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.multiplier}</div>}
                <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                  Set a multiplier for the overall size of the sign size (e.g. set 1 for a 100% of the signs size, 2 for 200% of the signs size).
                </div>
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
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Label</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Size Scale Multiplier</th>
              <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sizes.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
                  No sizes added yet. Click "Add Size" to get started.
                </td>
              </tr>
            ) : (
              sizes.map((size) => (
                editingId === size._id.toString() ? (
                  <tr key={size._id.toString()} style={{ borderBottom: '1px solid #f0f0f0', background: '#f9f9f9' }}>
                    <td colSpan="3" style={{ padding: '16px' }}>
                      <fetcher.Form method="post" onSubmit={handleUpdateSize}>
                        <input type="hidden" name="action" value="updateSize" />
                        <input type="hidden" name="id" value={size._id.toString()} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Label *</label>
                            <input
                              type="text"
                              value={editSize.label}
                              onChange={(e) => setEditSize({ ...editSize, label: e.target.value })}
                              name="label"
                              required
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
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Size Scale Multiplier *</label>
                            <input
                              type="number"
                              step="0.01"
                              value={editSize.multiplier}
                              onChange={(e) => setEditSize({ ...editSize, multiplier: e.target.value })}
                              name="multiplier"
                              required
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
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="submit"
                            style={{
                              padding: '8px 16px',
                              background: '#000',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 500
                            }}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            style={{
                              padding: '8px 16px',
                              background: 'white',
                              color: '#666',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 500
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </fetcher.Form>
                    </td>
                  </tr>
                ) : (
                  <tr key={size._id.toString()} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '16px' }}>
                      <s-text weight="semibold">{size.label || size.width + '" × ' + size.height + '"'}</s-text>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <s-text>{size.multiplier || 'N/A'}</s-text>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => handleEditClick(size)}
                          style={{
                            padding: '6px 12px',
                            background: 'white',
                            color: '#666',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 500,
                            fontFamily: 'system-ui, -apple-system, sans-serif'
                          }}
                        >
                          Edit
                        </button>
                        <fetcher.Form method="post" style={{ display: 'inline' }}>
                          <input type="hidden" name="action" value="deleteSize" />
                          <input type="hidden" name="id" value={size._id.toString()} />
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
                      </div>
                    </td>
                  </tr>
                )
              ))
            )}
          </tbody>
        </table>
      </s-box>
    </div>
  );
}
