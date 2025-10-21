import { useState, memo, useEffect } from "react";
import { Form } from "react-router";

const COLOR_EFFECTS = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
  FLOW: 'flow'
};

const ColorPreviewInForm = memo(({ colors, colorEffect }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (colorEffect === COLOR_EFFECTS.MULTIPLE && colors.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % colors.length);
      }, 500);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [colors.length, colorEffect]);

  if (colorEffect === COLOR_EFFECTS.SINGLE) {
    return (
      <div style={{
        fontSize: '60px',
        fontWeight: 'bold',
        letterSpacing: '2px',
        color: colors[0],
        padding: '50px 0px'
      }}>
        PREVIEW
      </div>
    );
  }

  if (colorEffect === COLOR_EFFECTS.MULTIPLE) {
    return (
      <div style={{
        fontSize: '60px',
        fontWeight: 'bold',
        letterSpacing: '2px',
        position: 'absolute',
        color: 'white',
        top: '0px',
        left: '50px',
        WebkitTextStroke: `4px ${colors[currentIndex]}`,
        padding: '50px 0px',
        animation: '12s linear infinite dVFlEb'
      }}>
        PREVIEW
      </div>
    );
  }

  if (colorEffect === COLOR_EFFECTS.FLOW) {
    return (
      <>
        <style>{`
          @keyframes bGunhW {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
        <div style={{
          fontSize: '60px',
          padding: '50px 0px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          backgroundImage: '-webkit-linear-gradient(-45deg, rgb(234, 58, 169), rgb(247, 204, 25), rgb(84, 181, 246), rgb(235, 64, 52), rgb(90, 29, 136), rgb(253, 244, 220), rgb(36, 217, 199), rgb(255, 0, 0))',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: '2s linear infinite bGunhW',
          backgroundSize: '200% 200%'
        }}>
          PREVIEW
        </div>
      </>
    );
  }

  return null;
});

ColorPreviewInForm.displayName = 'ColorPreviewInForm';

const ColorForm = memo(({
  initialState,
  isEdit = false,
  onCancel,
  colorId = null,
  errors = {}
}) => {
  const [state, setState] = useState(initialState);

  const handleColorEffectChange = (effect) => {
    if (effect === COLOR_EFFECTS.SINGLE) {
      setState({ ...state, colorEffect: effect, colors: [state.colors[0] || "#000000"] });
    } else {
      setState({ ...state, colorEffect: effect });
    }
  };

  const addColorToArray = () => {
    if (state.colors.length < 8) {
      setState({ ...state, colors: [...state.colors, "#000000"] });
    }
  };

  const removeColorFromArray = (index) => {
    if (state.colors.length > 1) {
      setState({ ...state, colors: state.colors.filter((_, i) => i !== index) });
    }
  };

  const updateColorInArray = (index, value) => {
    const newColors = [...state.colors];
    newColors[index] = value;
    setState({ ...state, colors: newColors });
  };

  return (
    <Form method="post">
      <input type="hidden" name="action" value={isEdit ? "updateColor" : "addColor"} />
      {isEdit && colorId && <input type="hidden" name="id" value={colorId} />}
      <input type="hidden" name="colorEffect" value={state.colorEffect} />
      <input type="hidden" name="colors" value={JSON.stringify(state.colors)} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
          {isEdit ? 'Edit Color' : 'Add New Color'}
        </h3>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Label *</label>
          <input
            type="text"
            value={state.name}
            onChange={(e) => setState({ ...state, name: e.target.value })}
            name="name"
            placeholder="RGB"
            autoComplete="off"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid ' + (errors.colorName ? '#d32f2f' : '#ddd'),
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          {errors.colorName && (
            <div style={{ color: '#d32f2f', fontSize: '12px', marginTop: '4px' }}>
              {errors.colorName}
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Description
          </label>
          <textarea
            value={state.description}
            onChange={(e) => setState({ ...state, description: e.target.value })}
            name="description"
            placeholder="Shows inline with the label"
            maxLength={255}
            rows={2}
            autoComplete="off"
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
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Color Effect *
          </label>
          <select
            value={state.colorEffect}
            onChange={(e) => handleColorEffectChange(e.target.value)}
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
                  onChange={(e) => updateColorInArray(index, e.target.value)}
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
                    onClick={() => removeColorFromArray(index)}
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
              onClick={addColorToArray}
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

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Preview</label>
          <div style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '16px',
            background: '#f9f9f9',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '180px',
            position: 'relative'
          }}>
            <ColorPreviewInForm colors={state.colors} colorEffect={state.colorEffect} />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
            Additional Pricing
          </label>
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Base Price *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>$</span>
              <input
                type="number"
                step="0.01"
                value={state.basePrice}
                onChange={(e) => setState({ ...state, basePrice: e.target.value })}
                name="basePrice"
                placeholder="0.00"
                autoComplete="off"
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
            onClick={onCancel}
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
    </Form>
  );
});

ColorForm.displayName = 'ColorForm';

export default ColorForm;
export { COLOR_EFFECTS };
