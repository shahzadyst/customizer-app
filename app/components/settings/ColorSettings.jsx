import { useState, useEffect } from "react";
import { useFetcher } from "react-router";

const COLOR_EFFECTS = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
  FLOW: 'flow'
};

export default function ColorSettings({ colors }) {
  const fetcher = useFetcher();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newColor, setNewColor] = useState({
    name: "",
    description: "",
    colorEffect: COLOR_EFFECTS.SINGLE,
    colors: ["#000000"],
    additionalPricing: "none",
    basePrice: ""
  });
  const [editColor, setEditColor] = useState({});
  const [errors, setErrors] = useState({});

  const validateColor = (name, colors) => {
    const errors = {};
    if (!name || name.trim().length === 0) {
      errors.colorName = "Color name is required";
    }
    if (!colors || colors.length === 0) {
      errors.colors = "At least one color is required";
    }
    return errors;
  };

  const handleAddColor = (e) => {
    const validationErrors = validateColor(newColor.name, newColor.colors);
    if (Object.keys(validationErrors).length > 0) {
      e.preventDefault();
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setNewColor({
      name: "",
      description: "",
      colorEffect: COLOR_EFFECTS.SINGLE,
      colors: ["#000000"],
      additionalPricing: "none",
      basePrice: ""
    });
    setShowAddForm(false);
  };

  const handleEditClick = (color) => {
    setEditingId(color._id.toString());
    setEditColor({
      name: color.name,
      description: color.description || "",
      colorEffect: color.colorEffect || COLOR_EFFECTS.SINGLE,
      colors: color.colors || [color.hex || "#000000"],
      additionalPricing: color.additionalPricing || "none",
      basePrice: color.basePrice || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditColor({});
    setErrors({});
  };

  const handleUpdateColor = (e) => {
    const validationErrors = validateColor(editColor.name, editColor.colors);
    if (Object.keys(validationErrors).length > 0) {
      e.preventDefault();
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setEditingId(null);
    setEditColor({});
  };

  const handleColorEffectChange = (effect, isEdit = false) => {
    const state = isEdit ? editColor : newColor;
    const setState = isEdit ? setEditColor : setNewColor;

    if (effect === COLOR_EFFECTS.SINGLE) {
      setState({ ...state, colorEffect: effect, colors: [state.colors[0] || "#000000"] });
    } else {
      setState({ ...state, colorEffect: effect });
    }
  };

  const addColorToArray = (isEdit = false) => {
    const state = isEdit ? editColor : newColor;
    const setState = isEdit ? setEditColor : setNewColor;

    if (state.colors.length < 8) {
      setState({ ...state, colors: [...state.colors, "#000000"] });
    }
  };

  const removeColorFromArray = (index, isEdit = false) => {
    const state = isEdit ? editColor : newColor;
    const setState = isEdit ? setEditColor : setNewColor;

    if (state.colors.length > 1) {
      setState({ ...state, colors: state.colors.filter((_, i) => i !== index) });
    }
  };

  const updateColorInArray = (index, value, isEdit = false) => {
    const state = isEdit ? editColor : newColor;
    const setState = isEdit ? setEditColor : setNewColor;

    const newColors = [...state.colors];
    newColors[index] = value;
    setState({ ...state, colors: newColors });
  };

  const ColorPreview = ({ colors, colorEffect }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      if (colorEffect === COLOR_EFFECTS.MULTIPLE && colors.length > 1) {
        const interval = setInterval(() => {
          setCurrentIndex((prev) => (prev + 1) % colors.length);
        }, 500);
        return () => clearInterval(interval);
      }
    }, [colors, colorEffect]);

    if (colorEffect === COLOR_EFFECTS.SINGLE) {
      return (
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          color: colors[0]
        }}>
          PREVIEW
        </div>
      );
    }

    if (colorEffect === COLOR_EFFECTS.MULTIPLE) {
      return (
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          color: colors[currentIndex]
        }}>
          PREVIEW
        </div>
      );
    }

    if (colorEffect === COLOR_EFFECTS.FLOW) {
      return (
        <div style={{
          fontSize: '48px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          display: 'flex'
        }}>
          {'PREVIEW'.split('').map((letter, i) => (
            <span
              key={i}
              style={{
                color: colors[i % colors.length],
                animation: colors.length > 1 ? 'flowAnimation 3s ease-in-out infinite' : 'none',
                animationDelay: `${i * 0.1}s`
              }}
            >
              {letter}
            </span>
          ))}
        </div>
      );
    }

    return null;
  };

  const ColorForm = ({ state, setState, isEdit, onSubmit }) => (
    <fetcher.Form method="post" onSubmit={onSubmit}>
      <input type="hidden" name="action" value={isEdit ? "updateColor" : "addColor"} />
      {isEdit && <input type="hidden" name="id" value={editingId} />}
      <input type="hidden" name="colorEffect" value={state.colorEffect} />
      <input type="hidden" name="colors" value={JSON.stringify(state.colors)} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{isEdit ? 'Edit Color' : 'Add New Color'}</h3>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Label *</label>
          <input
            type="text"
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
            name="name"
            placeholder="RGB"
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
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Description</label>
          <textarea
            value={state.description}
            onChange={(e) => setState({ ...state, description: e.target.value })}
            name="description"
            placeholder="Shows inline with the label"
            maxLength={255}
            rows={2}
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
          <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
            Shows inline with the label. {state.description ? `${255 - state.description.length} characters remaining` : '255 characters remaining'}.
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Color Effect *</label>
          <select
            value={state.colorEffect}
            onChange={(e) => handleColorEffectChange(e.target.value, isEdit)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '14px',
              background: 'white'
            }}
          >
            <option value={COLOR_EFFECTS.SINGLE}>Single Color</option>
            <option value={COLOR_EFFECTS.MULTIPLE}>Multiple Colors</option>
            <option value={COLOR_EFFECTS.FLOW}>Flow</option>
          </select>
          <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
            {state.colorEffect === COLOR_EFFECTS.SINGLE && 'Single or multiple colors. Multiple color option will cycle through the colors in the visualization.'}
            {state.colorEffect === COLOR_EFFECTS.MULTIPLE && 'Single or multiple colors. Multiple color option will cycle through the colors in the visualization.'}
            {state.colorEffect === COLOR_EFFECTS.FLOW && 'Flow option will transition through them.'}
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            {state.colorEffect === COLOR_EFFECTS.SINGLE ? 'Color *' : 'Colors *'}
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
            {state.colors.map((color, index) => (
              <div key={index} style={{ position: 'relative' }}>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => updateColorInArray(index, e.target.value, isEdit)}
                  style={{
                    width: '80px',
                    height: '80px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                />
                {state.colorEffect !== COLOR_EFFECTS.SINGLE && state.colors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeColorFromArray(index, isEdit)}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: '2px solid white',
                      background: '#000',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      lineHeight: 1,
                      padding: 0
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {state.colorEffect !== COLOR_EFFECTS.SINGLE && state.colors.length < 8 && (
            <button
              type="button"
              onClick={() => addColorToArray(isEdit)}
              style={{
                padding: '8px 16px',
                background: 'white',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '18px', lineHeight: 1 }}>⊕</span>
              Add Color
            </button>
          )}
        </div>

        <div style={{
          padding: '24px',
          background: '#f5f5f5',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100px'
        }}>
          <style>{`
            @keyframes flowAnimation {
              0%, 100% { opacity: 1; transform: translateY(0); }
              50% { opacity: 0.7; transform: translateY(-5px); }
            }
          `}</style>
          <ColorPreview colors={state.colors} colorEffect={state.colorEffect} />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Additional Pricing</label>
          <select
            value={state.additionalPricing}
            onChange={(e) => setState({ ...state, additionalPricing: e.target.value })}
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

        {state.additionalPricing === 'basePrice' && (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Base Price *</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>$</span>
              <input
                type="number"
                step="0.01"
                value={state.basePrice}
                onChange={(e) => setState({ ...state, basePrice: e.target.value })}
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
            Save Color
          </button>
          <button
            type="button"
            onClick={() => isEdit ? handleCancelEdit() : setShowAddForm(false)}
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
      </div>
    </fetcher.Form>
  );

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Colors</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
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
          {showAddForm ? 'Cancel' : 'Add Color'}
        </button>
      </div>

      {showAddForm && (
        <div style={{ padding: '16px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '24px' }}>
          <ColorForm
            state={newColor}
            setState={setNewColor}
            isEdit={false}
            onSubmit={handleAddColor}
          />
        </div>
      )}

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
                editingId === color._id.toString() ? (
                  <tr key={color._id.toString()} style={{ borderBottom: '1px solid #f0f0f0', background: '#f9f9f9' }}>
                    <td colSpan="5" style={{ padding: '16px' }}>
                      <ColorForm
                        state={editColor}
                        setState={setEditColor}
                        isEdit={true}
                        onSubmit={handleUpdateColor}
                      />
                    </td>
                  </tr>
                ) : (
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
                      <div style={{ color: '#666' }}>{color.basePrice ? `$${color.basePrice}` : '-'}</div>
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
                        <fetcher.Form method="post" style={{ display: 'inline' }}>
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
                        </fetcher.Form>
                      </div>
                    </td>
                  </tr>
                )
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
