import { useState } from "react";
import { useFetcher } from "react-router";

export default function UsageTypeSettings({ usageTypes }) {
  const fetcher = useFetcher();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUsageType, setNewUsageType] = useState({ name: "" });
  const [errors, setErrors] = useState({});

  const validateName = (name) => {
    const errors = {};
    if (!name || name.trim().length === 0) {
      errors.usageTypeName = "Usage type name is required";
    }
    return errors;
  };

  const handleAdd = (e) => {
    const validationErrors = validateName(newUsageType.name);
    if (Object.keys(validationErrors).length > 0) {
      e.preventDefault();
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setNewUsageType({ name: "" });
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
        <s-text size="large" weight="semibold">Usage Types</s-text>
        <s-button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="primary"
        >
          {showAddForm ? 'Cancel' : 'Add Usage Type'}
        </s-button>
      </div>

      {showAddForm && (
        <s-box padding="base" background="surface" style={{ marginBottom: '24px' }}>
          <fetcher.Form method="post" onSubmit={handleAdd}>
            <input type="hidden" name="action" value="addUsageType" />
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Usage Type</s-text>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Usage Type Name *</label>
                <input
                  type="text"
                  value={newUsageType.name}
                  onChange={(e) => setNewUsageType({ name: e.target.value })}
                  name="name"
                  placeholder="e.g., Indoor, Outdoor"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid ' + (errors.usageTypeName ? '#d32f2f' : '#ddd'),
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                {errors.usageTypeName && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.usageTypeName}</div>}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <s-button type="submit" variant="primary">Save Usage Type</s-button>
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
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Usage Type</th>
              <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {usageTypes.length === 0 ? (
              <tr>
                <td colSpan="2" style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
                  No usage types added yet. Click "Add Usage Type" to get started.
                </td>
              </tr>
            ) : (
              usageTypes.map((type) => (
                <tr key={type._id.toString()} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '16px' }}>
                    <s-text weight="semibold">{type.name}</s-text>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <fetcher.Form method="post" style={{ display: 'inline' }}>
                      <input type="hidden" name="action" value="deleteUsageType" />
                      <input type="hidden" name="id" value={type._id.toString()} />
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
