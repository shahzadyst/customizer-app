import { useState, useEffect, memo } from "react";

const COLOR_EFFECTS = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
  FLOW: 'flow'
};

const ColorPreview = memo(({ colors, colorEffect }) => {
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
      <>
        <style>{`
          @keyframes flowAnimation {
            0%, 100% { opacity: 1; transform: translateY(0); }
            50% { opacity: 0.7; transform: translateY(-5px); }
          }
        `}</style>
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
      </>
    );
  }

  return null;
});

ColorPreview.displayName = 'ColorPreview';

export default ColorPreview;
