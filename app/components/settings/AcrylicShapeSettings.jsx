import { useState } from "react";
import { useFetcher } from "react-router";

export default function AcrylicShapeSettings({ acrylicShapes }) {
  const fetcher = useFetcher();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newShape, setNewShape] = useState({ name: "", imageUrl: "" });
  const [errors, setErrors] = useState({});

  const validateShape = (name, imageUrl) => {
    const errors = {};
    if (!name || name.trim().length === 0) {
      errors.shapeName = "Shape name is required";
    }
    if (imageUrl && imageUrl.trim().length > 0) {
      try {
        new URL(imageUrl);
      } catch {
        errors.imageUrl = "Invalid URL format";
      }
    }
    return errors;
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const validationErrors = validateShape(newShape.name, newShape.imageUrl);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    e.target.submit();
    setNewShape({ name: "", imageUrl: "" });
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
        <s-text size="large" weight="semibold">Acrylic Shapes</s-text>
        <s-button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="primary"
        >
          {showAddForm ? 'Cancel' : 'Add Shape'}
        </s-button>
      </div>

      {showAddForm && (
        <s-box padding="base" background="surface" style={{ marginBottom: '24px' }}>
          <fetcher.Form method="post" onSubmit={handleAdd}>
            <input type="hidden" name="action" value="addAcrylicShape" />
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Acrylic Shape</s-text>
              <s-text-field
                label="Shape Name"
                value={newShape.name}
                onChange={(value) => setNewShape({ ...newShape, name: value })}
                name="name"
                error={errors.shapeName}
                required
              />
              <s-text-field
                label="Image URL"
                value={newShape.imageUrl}
                onChange={(value) => setNewShape({ ...newShape, imageUrl: value })}
                name="imageUrl"
                placeholder="https://..."
                error={errors.imageUrl}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <s-button type="submit" variant="primary">Save Shape</s-button>
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
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Shape Name</th>
              <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {acrylicShapes.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
                  No acrylic shapes added yet. Click "Add Shape" to get started.
                </td>
              </tr>
            ) : (
              acrylicShapes.map((shape) => (
                <tr key={shape._id.toString()} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '16px' }}>
                    {shape.imageUrl ? (
                      <img
                        src={shape.imageUrl}
                        alt={shape.name}
                        style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{
                        width: '40px',
                        height: '40px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999'
                      }}>
                        N/A
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <s-text weight="semibold">{shape.name}</s-text>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <fetcher.Form method="post" style={{ display: 'inline' }}>
                      <input type="hidden" name="action" value="deleteAcrylicShape" />
                      <input type="hidden" name="id" value={shape._id.toString()} />
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
