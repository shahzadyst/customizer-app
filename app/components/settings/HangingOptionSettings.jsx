import { useState } from "react";
import { useFetcher } from "react-router";

export default function HangingOptionSettings({ hangingOptions }) {
  const fetcher = useFetcher();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newOption, setNewOption] = useState({ name: "", additionalPricing: "none", basePrice: "" });
  const [editOption, setEditOption] = useState({});
  const [errors, setErrors] = useState({});

  const validateName = (name) => {
    const errors = {};
    if (!name || name.trim().length === 0) {
      errors.optionName = "Hanging option name is required";
    }
    return errors;
  };

  const handleAdd = (e) => {
    const validationErrors = validateName(newOption.name);
    if (Object.keys(validationErrors).length > 0) {
      e.preventDefault();
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setNewOption({ name: "", additionalPricing: "none", basePrice: "" });
    setShowAddForm(false);
  };

  const handleEditClick = (option) => {
    setEditingId(option._id.toString());
    setEditOption({
      name: option.name,
      additionalPricing: option.additionalPricing || "none",
      basePrice: option.basePrice || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditOption({});
    setErrors({});
  };

  const handleUpdate = (e) => {
    const validationErrors = validateName(editOption.name);
    if (Object.keys(validationErrors).length > 0) {
      e.preventDefault();
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setEditingId(null);
    setEditOption({});
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <s-text size="large" weight="semibold">Hanging Options</s-text>
        <s-button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="primary"
        >
          {showAddForm ? 'Cancel' : 'Add Option'}
        </s-button>
      </div>

      {showAddForm && (
        <s-box padding="base" background="surface" style={{ marginBottom: '24px' }}>
          <fetcher.Form method="post" onSubmit={handleAdd}>
            <input type="hidden" name="action" value="addHangingOption" />
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Hanging Option</s-text>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Option Name *</label>
                <input
                  type="text"
                  value={newOption.name}
                  onChange={(e) => setNewOption({ name: e.target.value })}
                  name="name"
                  placeholder="e.g., Wall Mount, Desk Stand"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid ' + (errors.optionName ? '#d32f2f' : '#ddd'),
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                {errors.optionName && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.optionName}</div>}
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Additional Pricing</label>
                <select
                  value={newOption.additionalPricing}
                  onChange={(e) => setNewOption({ ...newOption, additionalPricing: e.target.value })}
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
              {newOption.additionalPricing === 'basePrice' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Base Price *</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#666' }}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={newOption.basePrice}
                      onChange={(e) => setNewOption({ ...newOption, basePrice: e.target.value })}
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
                <s-button type="submit" variant="primary">Save Option</s-button>
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
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Option Name</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Base Price</th>
              <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hangingOptions.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
                  No hanging options added yet. Click "Add Option" to get started.
                </td>
              </tr>
            ) : (
              hangingOptions.map((option) => (
                editingId === option._id.toString() ? (
                  <tr key={option._id.toString()} style={{ borderBottom: '1px solid #f0f0f0', background: '#f9f9f9' }}>
                    <td colSpan="3" style={{ padding: '16px' }}>
                      <fetcher.Form method="post" onSubmit={handleUpdate}>
                        <input type="hidden" name="action" value="updateHangingOption" />
                        <input type="hidden" name="id" value={option._id.toString()} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Option Name *</label>
                            <input
                              type="text"
                              value={editOption.name}
                              onChange={(e) => setEditOption({ ...editOption, name: e.target.value })}
                              name="name"
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
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Additional Pricing</label>
                            <select
                              value={editOption.additionalPricing}
                              onChange={(e) => setEditOption({ ...editOption, additionalPricing: e.target.value })}
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
                          {editOption.additionalPricing === 'basePrice' && (
                            <div>
                              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Base Price *</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '14px', color: '#666' }}>$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editOption.basePrice}
                                  onChange={(e) => setEditOption({ ...editOption, basePrice: e.target.value })}
                                  name="basePrice"
                                  placeholder="0.00"
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
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button type="submit" style={{ padding: '8px 16px', background: '#000', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Save</button>
                          <button type="button" onClick={handleCancelEdit} style={{ padding: '8px 16px', background: 'white', color: '#666', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Cancel</button>
                        </div>
                      </fetcher.Form>
                    </td>
                  </tr>
                ) : (
                  <tr key={option._id.toString()} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '16px' }}>
                      <s-text weight="semibold">{option.name}</s-text>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <s-text color="subdued">{option.basePrice ? `$${option.basePrice}` : '-'}</s-text>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => handleEditClick(option)} style={{ padding: '6px 12px', background: 'white', color: '#666', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: 'system-ui, -apple-system, sans-serif' }}>Edit</button>
                        <fetcher.Form method="post" style={{ display: 'inline' }}>
                          <input type="hidden" name="action" value="deleteHangingOption" />
                          <input type="hidden" name="id" value={option._id.toString()} />
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
