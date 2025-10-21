import { useState } from "react";
import { Form } from "react-router";
import ColorForm, { COLOR_EFFECTS } from "./ColorForm";

export default function ColorSettings({ colors }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const handleEditClick = (color) => {
    setEditingId(color._id.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
  };

  const getInitialAddState = () => ({
    name: "",
    description: "",
    colorEffect: COLOR_EFFECTS.SINGLE,
    colors: ["#000000"],
    additionalPricing: "none",
    basePrice: ""
  });

  const getEditState = (color) => ({
    name: color.name,
    description: color.description || "",
    colorEffect: color.colorEffect || COLOR_EFFECTS.SINGLE,
    colors: color.colors || [color.hex || "#000000"],
    additionalPricing: color.additionalPricing || "none",
    basePrice: color.basePrice || ""
  });

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Colors</h2>
        {!showAddForm && !editingId && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
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
            Add Color
          </button>
        )}
      </div>

      {showAddForm && (
        <div style={{
          padding: '16px',
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <ColorForm
            initialState={getInitialAddState()}
            isEdit={false}
            onCancel={handleCancelAdd}
          />
        </div>
      )}

      {editingId && (
        <div style={{
          padding: '16px',
          background: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <ColorForm
            initialState={getEditState(colors.find(c => c._id.toString() === editingId))}
            isEdit={true}
            onCancel={handleCancelEdit}
            colorId={editingId}
          />
        </div>
      )}

      {!showAddForm && !editingId && (
        <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Preview</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Color Name</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Effect</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Base Price</th>
                <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {colors.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
                    No colors added yet. Click "Add Color" to get started.
                  </td>
                </tr>
              ) : (
                colors.map((color) => (
                  <tr key={color._id.toString()} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {(color.colors || [color.hex]).slice(0, 4).map((c, i) => (
                          <div key={i} style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: c,
                            border: '1px solid #ddd',
                            borderRadius: '2px'
                          }} />
                        ))}
                        {(color.colors || [color.hex]).length > 4 && (
                          <div style={{
                            width: '20px',
                            height: '20px',
                            border: '1px solid #ddd',
                            borderRadius: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: '#666'
                          }}>
                            +{(color.colors || [color.hex]).length - 4}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600 }}>{color.name}</div>
                      {color.description && (
                        <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                          {color.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ color: '#666' }}>
                        {color.colorEffect === COLOR_EFFECTS.SINGLE && 'Single'}
                        {color.colorEffect === COLOR_EFFECTS.MULTIPLE && 'Multiple'}
                        {color.colorEffect === COLOR_EFFECTS.FLOW && 'Flow'}
                        {!color.colorEffect && 'Single'}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ color: '#666' }}>
                        {color.basePrice ? `$${color.basePrice}` : '-'}
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => handleEditClick(color)}
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
                        <Form method="post" style={{ display: 'inline' }}>
                          <input type="hidden" name="action" value="deleteColor" />
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
                        </Form>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
