import { useState } from "react";
import { useFetcher } from "react-router";

export default function AcrylicShapeSettings({ acrylicShapes }) {
  const fetcher = useFetcher();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newShape, setNewShape] = useState({ name: "", imageUrl: "", description: "",additionalPricing: "none", basePrice: ""  });
  const [editShape, setEditShape] = useState({});
  const [errors, setErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);

  const validateShape = (name) => {
    const errors = {};
    if (!name || name.trim().length === 0) {
      errors.shapeName = "Shape name is required";
    }
    return errors;
  };

  const handleImageSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewShape({ ...newShape, imageUrl: reader.result});
      };
      reader.readAsDataURL(file);
    } else {
      setErrors({ ...errors, imageUrl: "Please select a valid image file" });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleImageSelect(file);
  };

  const handleAdd = (e) => {
    const validationErrors = validateShape(newShape.name);
    if (Object.keys(validationErrors).length > 0) {
      e.preventDefault();
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setNewShape({ name: "", imageUrl: "", description: "",additionalPricing: "none", basePrice: "" });
    setShowAddForm(false);
  };

  const handleEditClick = (shape) => {
    setEditingId(shape._id.toString());
    console.log(shape)
    setEditShape({
      name: shape.name,
      imageUrl: shape.imageUrl || "",
      description: shape.description || "",
      additionalPricing: shape.additionalPricing || "none",
      basePrice: shape.basePrice || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditShape({});
    setErrors({});
  };

  const handleUpdate = (e) => {
    console.log('=-----',editShape);
    const validationErrors = validateShape(editShape.name);
    if (Object.keys(validationErrors).length > 0) {
      e.preventDefault();
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setEditingId(null);
    setEditShape({});
  };

  const handleEditImageSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditShape({ ...editShape, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    } else {
      setErrors({ ...errors, imageUrl: "Please select a valid image file" });
    }
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
            <input type="hidden" name="imageUrl" value={newShape.imageUrl} />
            <s-stack direction="block" gap="base">
              <s-text weight="semibold">Add New Acrylic Shape</s-text>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Shape Name *</label>
                <input
                  type="text"
                  value={newShape.name}
                  onChange={(e) => setNewShape({ ...newShape, name: e.target.value })}
                  name="name"
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid ' + (errors.shapeName ? '#d32f2f' : '#ddd'),
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                {errors.shapeName && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.shapeName}</div>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Description</label>
                <textarea
                  value={newShape.description}
                  onChange={(e) => setNewShape({ ...newShape, description: e.target.value })}
                  name="description"
                  placeholder="Describe this acrylic shape..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    resize: 'vertical'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Additional Pricing</label>
                <select
                  value={newShape.additionalPricing}
                  onChange={(e) => setNewShape({ ...newShape, additionalPricing: e.target.value })}
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
              {newShape.additionalPricing === 'basePrice' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Base Price *</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: '#666' }}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={newShape.basePrice}
                      onChange={(e) => setNewShape({ ...newShape, basePrice: e.target.value })}
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
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Shape Image</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    border: '2px dashed ' + (dragOver ? '#000' : '#ddd'),
                    borderRadius: '8px',
                    padding: '32px',
                    textAlign: 'center',
                    background: dragOver ? '#f5f5f5' : '#fafafa',
                    transition: 'all 0.2s'
                  }}
                >
                  {newShape.imageUrl ? (
                    <div>
                      <img
                        src={newShape.imageUrl}
                        alt="Preview"
                        style={{
                          maxWidth: '200px',
                          maxHeight: '200px',
                          marginBottom: '16px',
                          border: '1px solid #ddd',
                          borderRadius: '4px'
                        }}
                      />
                      <div>
                        <button
                          type="button"
                          onClick={() => setNewShape({ ...newShape, imageUrl: "" })}
                          style={{
                            padding: '8px 16px',
                            background: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 500
                          }}
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                      <p style={{ marginBottom: '12px', color: '#666', fontSize: '14px' }}>
                        Drag and drop an image here, or click to select
                      </p>
                      <button
                        type="button"
                        onClick={() => document.getElementById('shape-image-upload').click()}
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
                        Select Image
                      </button>
                      <input
                        id="shape-image-upload"
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleImageSelect(e.target.files[0]);
                          }
                        }}
                      />
                      <p style={{ marginTop: '12px', color: '#999', fontSize: '12px' }}>
                        Supports: PNG, JPG, SVG (Max 5MB)
                      </p>
                    </div>
                  )}
                </div>
                {errors.imageUrl && <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>{errors.imageUrl}</div>}
              </div>

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
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: 600 }}>Description</th>
              <th style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {acrylicShapes.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#666' }}>
                  No acrylic shapes added yet. Click "Add Shape" to get started.
                </td>
              </tr>
            ) : (
              acrylicShapes.map((shape) => (
                editingId === shape._id.toString() ? (
                  <tr key={shape._id.toString()} style={{ borderBottom: '1px solid #f0f0f0', background: '#f9f9f9' }}>
                    <td colSpan="4" style={{ padding: '16px' }}>
                      <fetcher.Form method="post" onSubmit={handleUpdate}>
                        <input type="hidden" name="action" value="updateAcrylicShape" />
                        <input type="hidden" name="id" value={shape._id.toString()} />
                        <input type="hidden" name="imageUrl" value={editShape.imageUrl} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                          <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Shape Name *</label>
                            <input
                              type="text"
                              value={editShape.name}
                              onChange={(e) => setEditShape({ ...editShape, name: e.target.value })}
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
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Description</label>
                            <textarea
                              value={editShape.description}
                              onChange={(e) => setEditShape({ ...editShape, description: e.target.value })}
                              name="description"
                              rows="2"
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontSize: '14px',
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                resize: 'vertical'
                              }}
                            />
                          </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Additional Pricing</label>
                            <select
                              value={editShape.additionalPricing}
                              onChange={(e) => setEditShape({ ...editShape, additionalPricing: e.target.value })}
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
                          {editShape.additionalPricing === 'basePrice' && (
                            <div>
                              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Base Price *</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '14px', color: '#666' }}>$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editShape.basePrice}
                                  onChange={(e) => setEditShape({ ...editShape, basePrice: e.target.value })}
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
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Shape Image</label>
                          {editShape.imageUrl && (
                            <div style={{ marginBottom: '8px' }}>
                              <img src={editShape.imageUrl} alt="Preview" style={{ maxWidth: '100px', maxHeight: '100px', border: '1px solid #ddd', borderRadius: '4px' }} />
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                handleEditImageSelect(e.target.files[0]);
                              }
                            }}
                            style={{ fontSize: '14px' }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button type="submit" style={{ padding: '8px 16px', background: '#000', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Save</button>
                          <button type="button" onClick={handleCancelEdit} style={{ padding: '8px 16px', background: 'white', color: '#666', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>Cancel</button>
                        </div>
                      </fetcher.Form>
                    </td>
                  </tr>
                ) : (
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
                    <td style={{ padding: '16px' }}>
                      <s-text color="subdued">{shape.description || '-'}</s-text>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => handleEditClick(shape)} style={{ padding: '6px 12px', background: 'white', color: '#666', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: 'system-ui, -apple-system, sans-serif' }}>Edit</button>
                        <fetcher.Form method="post" style={{ display: 'inline' }}>
                          <input type="hidden" name="action" value="deleteAcrylicShape" />
                          <input type="hidden" name="id" value={shape._id.toString()} />
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
