/**
 * Calculate actual character dimensions using canvas measurement
 */
export function getActualCharacterDimensions(char, heightInCm, fontFamily) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  
  const baseFontSize = 1000;
  ctx.font = `bold ${baseFontSize}px "${fontFamily}", cursive`;
  
  const metrics = ctx.measureText(char);
  
  const pixelWidth = (metrics.actualBoundingBoxRight || 0) + 
                     (metrics.actualBoundingBoxLeft || 0);
  
  const charWidth = pixelWidth || metrics.width;
  const widthToHeightRatio = charWidth / baseFontSize;
  const actualWidthInCm = heightInCm * widthToHeightRatio;
  
  return {
    widthCm: actualWidthInCm,
    heightCm: heightInCm,
    ratio: widthToHeightRatio
  };
}

/**
 * Calculate dimensions for entire text with multiple lines
 */
export function calculateTextDimensions(text, font, sizeMultiplier) {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length === 0 || !font) {
    return { widthCm: 0, heightCm: 0, widthIn: 0, heightIn: 0, numberOfLines: 0 };
  }
  
  const hasUppercase = (text) => /[A-Z]/.test(text);
  
  let maxWidthCm = 0;
  let lineHeights = [];
  
  lines.forEach(line => {
    let lineHeightCm;
    if (hasUppercase(line)) {
      lineHeightCm = (font.minHeightUppercase || font.minHeightUppercaseLetter || 10) * sizeMultiplier;
    } else {
      lineHeightCm = (font.minHeightLowercase || 
                     font.minHeightSmallestLetter || 
                     (font.minHeightUppercase || 10) * 0.7) * sizeMultiplier;
    }
    
    lineHeights.push(lineHeightCm);
    
    let lineWidthCm = 0;
    for (let char of line) {
      const charDimensions = getActualCharacterDimensions(
        char, 
        lineHeightCm, 
        font.fontFamily || font.fontFaceFamily
      );
      lineWidthCm += charDimensions.widthCm;
    }
    
    maxWidthCm = Math.max(maxWidthCm, lineWidthCm);
  });
  
  const totalHeightCm = lineHeights.reduce((sum, height) => sum + height, 0) + 
                       (lines.length > 1 ? (lines.length - 1) * lineHeights[0] * 0.5 : 0);
  
  const widthIn = maxWidthCm / 2.54;
  const heightIn = totalHeightCm / 2.54;
  
  return {
    widthCm: Math.round(maxWidthCm * 10) / 10,
    heightCm: Math.round(totalHeightCm * 10) / 10,
    widthIn: Math.ceil(widthIn),
    heightIn: Math.ceil(heightIn),
    numberOfLines: lines.length,
    lineHeights: lineHeights
  };
}