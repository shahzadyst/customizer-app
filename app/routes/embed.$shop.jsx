// app/routes/embed.$shop.jsx
export const loader = async ({ params, request }) => {
  const { shop } = params;
  const url = new URL(request.url);
  const appUrl = process.env.SHOPIFY_APP_URL || `${url.protocol}//${url.host}`;

  const scriptContent = `
(function() {
  'use strict';

  const SHOP_DOMAIN = '${shop}';
  const scriptTag = document.currentScript || document.querySelector('script[src*="embed"]');
  const customizerId = scriptTag ? scriptTag.getAttribute('data-customizer-id') : null;
  const LoaderDiv = document.querySelector('#sign-customizer-' + customizerId);

  let apiUrl = '${appUrl}/api/config/' + SHOP_DOMAIN;
  if (customizerId) apiUrl += '?customizerId=' + customizerId;
  const API_URL = apiUrl;

  // Load custom fonts CSS
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = '${appUrl}/api/fonts/' + SHOP_DOMAIN; 
  document.head.appendChild(fontLink);

  let config = null;
  let currentSelection = {
    font: null,
    color: null,
    size: null,
    usageType: null,
    acrylicShape: null,
    backboardColor: null,
    hangingOption: null,
    background: '#1a1a2e',
    customText: 'Your Text',
    glowEnabled: true,
    colorAnimationInterval: null
  };

  // Default backgrounds
  const defaultBackgrounds = [
    '#1a1a2e', '#16213e', '#0f3460', '#533483', '#2d4059',
    '#ea5455', '#f07b3f', '#ffd460', '#2bcbba', '#4a90e2'
  ];

  // ============================================
  // NEW: Canvas-based measurement functions
  // ============================================
  

  /**
 * Get character metrics using canvas measurement
 * Returns the actual bounding box height of a character
 */
  function getCharacterMetrics(char, fontFamily) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const measurementFontSize = 1000;
    
    ctx.font = \`bold \${measurementFontSize}px "\${fontFamily}"\`;
    const metrics = ctx.measureText(char);
    
    const ascent = metrics.actualBoundingBoxAscent || measurementFontSize * 0.8;
    const descent = metrics.actualBoundingBoxDescent || measurementFontSize * 0.2;
    const totalHeight = ascent + descent;
    const width = metrics.width;
    
    return {
      height: totalHeight,
      width: width,
      ascent: ascent,
      descent: descent,
      heightRatio: totalHeight / measurementFontSize,
      widthRatio: width / measurementFontSize
    };
  }

  /**
   * Find the shortest character in the text
   * This character will receive the minimum height
   */
  function findShortestCharacter(text, fontFamily) {
    const allChars = text.split('').filter(char => char.trim().length > 0);
    
    if (allChars.length === 0) return null;
    
    let shortestChar = allChars[0];
    let shortestHeight = getCharacterMetrics(allChars[0], fontFamily).height;
    
    allChars.forEach(char => {
      const metrics = getCharacterMetrics(char, fontFamily);
      if (metrics.height < shortestHeight) {
        shortestHeight = metrics.height;
        shortestChar = char;
      }
    });
    
    return {
      char: shortestChar,
      metrics: getCharacterMetrics(shortestChar, fontFamily)
    };
  }


  /**
   * Check if character is uppercase
   */
  function isUppercase(char) {
    return /[A-Z]/.test(char);
  }
  
  /**
   * Calculate text dimensions with uppercase/lowercase handling
   */
  
  function calculateTextDimensions(text, font, sizeMultiplier) {
    const lines = text.split('\\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0 || !font) {
      return { 
        widthCm: 0, 
        heightCm: 0, 
        widthIn: 0, 
        heightIn: 0, 
        numberOfLines: 0,
        lineHeights: [],
        shortestChar: null
      };
    }
    
    // STEP 1: Find the shortest character across ALL text
    const allText = lines.join('');
    const shortestCharInfo = findShortestCharacter(allText, font.fontFamily);
    
    if (!shortestCharInfo) {
      return { 
        widthCm: 0, 
        heightCm: 0, 
        widthIn: 0, 
        heightIn: 0, 
        numberOfLines: 0,
        lineHeights: [],
        shortestChar: null
      };
    }
    
    // STEP 2: Determine minimum height based on shortest character type
    const shortestIsUppercase = isUppercase(shortestCharInfo.char);
    const minHeight = shortestIsUppercase 
      ? (font.minHeightUppercase || 10)
      : (font.minHeightLowercase || font.minHeightUppercase * 0.7 || 7);
    
    // Apply size multiplier
    const actualMinHeight = minHeight * sizeMultiplier;
    
    // STEP 3: Calculate scaling factor
    const scalingFactor = actualMinHeight / shortestCharInfo.metrics.height;
    
    // STEP 4: Calculate dimensions for each line
    let lineHeights = [];
    let maxWidth = 0;
    
    lines.forEach((line, lineIndex) => {
      let lineMaxAscent = 0;
      let lineMaxDescent = 0;
      let lineWidth = 0;
      
      for (let char of line) {
        const charMetrics = getCharacterMetrics(char, font.fontFamily);
        const scaledAscent = charMetrics.ascent * scalingFactor;
        const scaledDescent = charMetrics.descent * scalingFactor;
        const scaledWidth = charMetrics.width * scalingFactor;
        
        const NEON_SPACING_MULTIPLIER = 1.0;
        const actualWidth = scaledWidth * NEON_SPACING_MULTIPLIER;
        
        lineMaxAscent = Math.max(lineMaxAscent, scaledAscent);
        lineMaxDescent = Math.max(lineMaxDescent, scaledDescent);
        lineWidth += actualWidth;
      }
      
      const lineHeight = lineMaxAscent + lineMaxDescent;
      lineHeights.push(lineHeight);
      maxWidth = Math.max(maxWidth, lineWidth);
    });
    
    // STEP 5: Calculate total height with line spacing
    const LINE_SPACING_RATIO = 0.1;
    const avgLineHeight = lineHeights.reduce((sum, h) => sum + h, 0) / lineHeights.length;
    const lineSpacing = avgLineHeight * LINE_SPACING_RATIO;
    
    const totalTextHeight = lineHeights.reduce((sum, height) => sum + height, 0) + 
                            (lines.length > 1 ? (lines.length - 1) * lineSpacing : 0);
    
    // STEP 6: Add vertical padding
    const hasAnyUppercase = /[A-Z]/.test(allText);
    const VERTICAL_PADDING_UPPERCASE = 1.05;
    const VERTICAL_PADDING_LOWERCASE = 1.02;
    
    const VERTICAL_PADDING_MULTIPLIER = hasAnyUppercase 
      ? VERTICAL_PADDING_UPPERCASE 
      : VERTICAL_PADDING_LOWERCASE;
    
    const totalHeight = totalTextHeight * VERTICAL_PADDING_MULTIPLIER;
    
    // STEP 7: Add horizontal padding
    const HORIZONTAL_PADDING_CM = 1;
    const totalWidth = maxWidth + HORIZONTAL_PADDING_CM;
    
    // Round up to whole inches
    const heightInInches = Math.ceil(totalHeight / 2.54);
    const widthInInches = Math.ceil(totalWidth / 2.54);
    
    return {
      widthCm: totalWidth,
      heightCm: totalHeight,
      widthIn: widthInInches,
      heightIn: heightInInches,
      numberOfLines: lines.length,
      lineHeights: lineHeights,
      shortestChar: shortestCharInfo.char,
      shortestCharHeight: actualMinHeight,
      scalingFactor: scalingFactor
    };
  }

  function getActualCharacterWidth(char, shortestCharHeight, scalingFactor, fontFamily) {
    const charMetrics = getCharacterMetrics(char, fontFamily);
    const scaledWidth = charMetrics.width * scalingFactor;
    
    // Add spacing multiplier for physical neon sign spacing
    const NEON_SPACING_MULTIPLIER = 1.3;
    return scaledWidth * NEON_SPACING_MULTIPLIER;
  }

  /**
   * Calculate material length for a character (for pricing)
   */
  function getMaterialLength(char, shortestCharHeight, scalingFactor, fontFamily) {
    const charMetrics = getCharacterMetrics(char, fontFamily);
    const scaledWidth = charMetrics.width * scalingFactor;
    
    // Material length is approximately 1.45x the display width
    // This accounts for the tube following the character outline
    const MATERIAL_PATH_MULTIPLIER = 1.45;
    
    return scaledWidth * MATERIAL_PATH_MULTIPLIER;
  }

  /**
   * Find size boundary that fits the sign dimensions
   */
  function findSizeBoundary(widthCm, heightCm, sizeBoundaries) {
    if (!sizeBoundaries || sizeBoundaries.length === 0) {
      return null;
    }
    
    const sortedBoundaries = [...sizeBoundaries].sort((a, b) => {
      const aWidth = parseFloat(a.maxWidth || Infinity);
      const bWidth = parseFloat(b.maxWidth || Infinity);
      return aWidth - bWidth;
    });
    
    for (let boundary of sortedBoundaries) {
      const maxWidth = parseFloat(boundary.maxWidth || Infinity);
      const maxHeight = parseFloat(boundary.maxHeight || Infinity);
      
      if (widthCm <= maxWidth && heightCm <= maxHeight) {
        return boundary;
      }
    }
    
    return sortedBoundaries[sortedBoundaries.length - 1];
  }
  
  function findSizeBoundary(widthCm, heightCm, sizeBoundaries) {
    if (!sizeBoundaries || sizeBoundaries.length === 0) {
      return null;
    }
    
    // Sort boundaries by maxWidth to ensure we check from smallest to largest
    const sortedBoundaries = [...sizeBoundaries].sort((a, b) => {
      const aWidth = parseFloat(a.maxWidth || Infinity);
      const bWidth = parseFloat(b.maxWidth || Infinity);
      return aWidth - bWidth;
    });
    
    // Find first boundary where sign fits within BOTH width AND height
    for (let boundary of sortedBoundaries) {
      const maxWidth = parseFloat(boundary.maxWidth || Infinity);
      const maxHeight = parseFloat(boundary.maxHeight || Infinity);
      
      if (widthCm <= maxWidth && heightCm <= maxHeight) {
        return boundary;
      }
    }
    
    // If no boundary fits, use the last one (infinity rule)
    return sortedBoundaries[sortedBoundaries.length - 1];
  }
  function calculateMaterialBasedPrice(text, font, sizeMultiplier, pricing) {
    const lines = text.split('\\n').filter(line => line.trim().length > 0);
    const allText = lines.join('');
    
    // Get dimensions to find appropriate size boundary
    const dimensions = calculateTextDimensions(text, font, sizeMultiplier);
    const sizeBoundary = findSizeBoundary(dimensions.widthCm, dimensions.heightCm, pricing.sizeBoundaries);
    
    if (!sizeBoundary) {
      return 0;
    }
    
    const materialPricePerCm = parseFloat(sizeBoundary.materialPrice || 0);
    const signStartPrice = parseFloat(sizeBoundary.signStartPrice || 0);
    
    // Calculate total material length using the scaling factor
    let totalMaterialLength = 0;
    
    for (let char of allText) {
      if (char.trim().length === 0) continue;
      const charMaterialLength = getMaterialLength(
        char, 
        dimensions.shortestCharHeight, 
        dimensions.scalingFactor, 
        font.fontFamily
      );
      totalMaterialLength += charMaterialLength;
    }
    
    const totalPrice = signStartPrice + (totalMaterialLength * materialPricePerCm);
    
    return totalPrice;
  } 
  function calculateFixedPricePerLetter(text, pricing) {
    const lines = text.split('\\n').filter(line => line.trim().length > 0);
    const totalLetterCount = lines.reduce((sum, line) => sum + line.length, 0);
    
    const sizeBoundary = pricing.sizeBoundaries?.[0];
    if (!sizeBoundary) return 0;
    
    const pricePerLetter = parseFloat(sizeBoundary.pricePerLetter || 0);
    const signStartPrice = parseFloat(sizeBoundary.signStartPrice || 0);
    
    return signStartPrice + (totalLetterCount * pricePerLetter);
  }
  
  async function loadConfig() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (data.success) {
        config = data.config;
        renderCustomizer();
      } else {
        console.error('Failed to load config:', data.error);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      renderCustomizer(); // fallback UI
    }
  }

  function renderCustomizer() {
    if (document.getElementById('signage-customizer-section')) return;

    const container = document.createElement('section');
    container.id = 'signage-customizer-section';
    container.style.cssText = \`
      width: 100%;
      background: #0a0a0a;
      color: #fff;
      padding: 0;
      font-family: 'Poppins', sans-serif;
      overflow: hidden;
    \`;

    container.innerHTML = \`
      <div style="display:flex; height:100vh;">
        <!-- Left Preview -->
        <div style="flex:1; position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden;" id="preview-container">
          <!-- Glow Toggle -->
          <div style="position:absolute; top:20px; left:20px; z-index:10;">
            <div style="display:inline-flex; background:#fff; border-radius:25px; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,0.3);">
              <button id="glow-on-btn" style="padding:8px 20px; border:none; background:#0066cc; color:white; cursor:pointer; font-weight:600; transition:all 0.3s;">On</button>
              <button id="glow-off-btn" style="padding:8px 20px; border:none; background:#fff; color:#333; cursor:pointer; font-weight:600; transition:all 0.3s;">Off</button>
            </div>
          </div>

          <!-- Price Display -->
          <div style="position:absolute; top:20px; right:20px; z-index:10;">
            <div style="background:rgba(255,255,255,0.95); padding:12px 24px; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.3);">
              <div id="total-price" style="font-weight:bold; font-size:24px; color:#0066cc;">Rs 0.00</div>
              <div style="font-size:11px; color:#666; margin-top:2px;">95% OFF</div>
            </div>
          </div>

          <!-- Canvas Preview -->
          <div style="text-align:center; position:relative; z-index:1; display:inline-block;">
            <div style="position:relative; display:inline-block;">              
              <canvas id="preview-canvas" width="900" height="400" style="max-width:90%; display:block;"></canvas>
            </div>
            <p style="color:rgba(255,255,255,0.6); font-size:11px; margin-top:60px;">Colours may appear different in real life</p>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div style="width:420px; background:#0a0a0a; padding:20px; display:flex; flex-direction:column; gap:16px; overflow-y:auto; max-height:100vh; border-left:1px solid #222;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h2 style="font-size:20px; font-weight:600; margin:0;">Unleash Your Creativity</h2>
            <button id="buy-now-btn" style="padding:10px 20px; background:#0066cc; border:none; border-radius:6px; color:white; font-size:14px; font-weight:600; cursor:pointer;">Buy Now</button>
          </div>

          <!-- Text Input -->
          <div>
            <label style="font-size:13px; font-weight:500; color:#aaa;">Enter Your Text</label>
            <textarea 
              id="custom-text-input" 
              placeholder="Enter your text (use new lines for multiple lines)"
              style="width:100%; margin-top:6px; padding:10px; border-radius:6px; border:1px solid #333; background:#1a1a1a; color:white; font-size:14px; min-height:80px; resize:vertical; font-family:inherit;"
            >Your Text</textarea>
            <div style="color:#666; font-size:11px; margin-top:6px;">
              <span id="char-count">9</span> characters to customize your design identity.
              <br/><span id="line-count">1</span> Number of Lines of text
            </div>
          </div>

          <!-- Font Selection -->
          <div>
            <label style="font-size:13px; font-weight:500; color:#aaa;">Choose a font</label>
            <div id="font-list" style="display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:8px;"></div>
          </div>

          <!-- Color Selection -->
          <div>
            <label style="font-size:13px; font-weight:500; color:#aaa;">Color</label>
            <div id="color-list" style="display:flex; flex-wrap: wrap; gap:8px; margin-top:8px;"></div>
          </div>

          <!-- Size Selection -->
          <div>
            <label style="font-size:13px; font-weight:500; color:#aaa;">Choose a size</label>
            <div id="size-list" style="display:grid; grid-template-columns:repeat(2,1fr); gap:8px; margin-top:8px;"></div>
          </div>

          <!-- Usage Type -->
          <div id="usage-type-section" style="display:none;">
            <label style="font-size:13px; font-weight:500; color:#aaa;">Indoor or Outdoor</label>
            <div id="usage-type-list" style="display:grid; grid-template-columns:repeat(2,1fr); gap:8px; margin-top:8px;"></div>
          </div>

          <!-- Acrylic Shape -->
          <div id="acrylic-shape-section" style="display:none;">
            <label style="font-size:13px; font-weight:500; color:#aaa;">Acrylic Shape</label>
            <div id="acrylic-shape-list" style="display:grid; grid-template-columns:repeat(2,1fr); gap:8px; margin-top:8px;"></div>
          </div>

          <!-- Backboard Color -->
          <div id="backboard-color-section" style="display:none;">
            <label style="font-size:13px; font-weight:500; color:#aaa;">Backboard Color</label>
            <div id="backboard-color-list" style="display:grid; grid-template-columns:repeat(2,1fr); gap:8px; margin-top:8px;"></div>
          </div>

          <!-- Hanging Option -->
          <div id="hanging-option-section" style="display:none;">
            <label style="font-size:13px; font-weight:500; color:#aaa;">Hanging</label>
            <div id="hanging-option-list" style="display:grid; grid-template-columns:repeat(2,1fr); gap:8px; margin-top:8px;"></div>
          </div>

          <!-- Background Selection -->
          <div>
            <label style="font-size:13px; font-weight:500; color:#aaa;">Background</label>
            <div id="background-list" style="display:flex; gap:6px; margin-top:8px; overflow-x:auto; padding-bottom:4px;"></div>
          </div>
        </div>
      </div>
    \`;

    if (LoaderDiv && LoaderDiv.parentNode) {
      LoaderDiv.style.display = "none";
      LoaderDiv.parentNode.insertBefore(container, LoaderDiv.nextSibling);
    } else {
      document.body.appendChild(container);
    }

    setupInteractions();
    renderFonts();
    renderColors();
    renderSizes();
    renderUsageTypes();
    renderAcrylicShapes();
    renderBackboardColors();
    renderHangingOptions();
    renderBackgrounds();
  }

  function setupInteractions() {
    const textarea = document.getElementById('custom-text-input');
    const glowOnBtn = document.getElementById('glow-on-btn');
    const glowOffBtn = document.getElementById('glow-off-btn');
    const charCount = document.getElementById('char-count');
    const lineCount = document.getElementById('line-count');

    textarea.addEventListener('input', () => {
      currentSelection.customText = textarea.value || 'Your Text';
      updateCharAndLineCount();
      renderCanvas();
      calculatePrice();
    });

    function updateCharAndLineCount() {
      const text = currentSelection.customText || 'Your Text';
      const totalChars = text.length;
      const lines = text.split('\\n').filter(line => line.trim().length > 0);
      const lineCountNum = lines.length;
      
      charCount.textContent = totalChars;
      lineCount.textContent = lineCountNum;
    }

    glowOnBtn.addEventListener('click', () => {
      currentSelection.glowEnabled = true;
      glowOnBtn.style.background = '#0066cc';
      glowOnBtn.style.color = 'white';
      glowOffBtn.style.background = '#fff';
      glowOffBtn.style.color = '#333';
      renderCanvas();
    });

    glowOffBtn.addEventListener('click', () => {
      currentSelection.glowEnabled = false;
      glowOffBtn.style.background = '#0066cc';
      glowOffBtn.style.color = 'white';
      glowOnBtn.style.background = '#fff';
      glowOnBtn.style.color = '#333';
      renderCanvas();
    });

    document.getElementById('buy-now-btn').addEventListener('click', addToCart);
    updateCharAndLineCount();
    renderCanvas();
  }

  function renderCanvas() {  // Remove (currentSelection, config) parameters
    const canvas = document.getElementById('preview-canvas');
    const previewContainer = document.getElementById('preview-container');
    if (!canvas) return;
    
    // Update background
    previewContainer.style.background = currentSelection.background;  // Add this back
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    const displayWidth = 900;
    const displayHeight = 400;
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    ctx.scale(dpr, dpr);
    
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    
    const fontFamily = currentSelection.font?.fontFamily || 'Dancing Script';
    const fontSize = 100;
    
    const fontString = 'bold ' + fontSize + 'px "' + fontFamily + '", cursive';
    const fontLoadPromise = document.fonts ? document.fonts.load(fontString) : Promise.resolve();
    
    fontLoadPromise.then(() => {
      ctx.clearRect(0, 0, displayWidth, displayHeight);
      
      ctx.font = fontString;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const allText = currentSelection.customText || 'Your Text';
      const lines = allText.split('\\n').filter(line => line.trim().length > 0);
      
      if (lines.length === 0) {
        lines.push('Your Text');
      }
      
      const lineHeight = fontSize * 1.2;
      const totalHeight = lines.length * fontSize + (lines.length - 1) * (lineHeight - fontSize);
      const startY = displayHeight / 2 - totalHeight / 2 + fontSize / 2;
      
      const renderColor = getCurrentRenderColor();  // Remove currentSelection parameter
      
      // Render text
      lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        renderTextLine(ctx, line, displayWidth / 2, y, renderColor);  // Remove currentSelection parameter
      });
      
      // Get actual text bounding box and draw dimension lines
      const bbox = getTextBoundingBox(ctx, allText, displayWidth / 2, displayHeight / 2, fontSize, fontFamily);
      
      if (bbox && currentSelection.font && currentSelection.size) {
        const dimensions = calculateTextDimensions(allText, currentSelection.font, currentSelection.size.multiplier);
        
        // Add extra padding to account for glow effect
        const glowPadding = currentSelection.glowEnabled ? 20 : 5;
        const margin = 50;
        
        const visualTop = bbox.top - glowPadding;
        const visualBottom = bbox.bottom + glowPadding;
        const visualLeft = bbox.left - glowPadding;
        const visualRight = bbox.right + glowPadding;
        
        // Height indicator (left side)
        drawDimensionLine(
          ctx,
          visualLeft - margin, visualTop,
          visualLeft - margin, visualBottom,
          dimensions.heightIn + 'in',
          true
        );
        
        // Width indicator (bottom)
        drawDimensionLine(
          ctx,
          visualLeft, visualBottom + margin,
          visualRight, visualBottom + margin,
          dimensions.widthIn + 'in',
          false
        );
        
        // Store dimensions
        currentSelection.boxDimensions = {
          width: dimensions.widthCm,
          height: dimensions.heightCm,
          numberOfLines: dimensions.numberOfLines,
          heightInInches: dimensions.heightIn,
          widthInInches: dimensions.widthIn,
          lineHeights: dimensions.lineHeights
        };
      }
    }).catch(err => {
      console.warn('Font loading failed, using fallback:', err);
    });
  }

  // REPLACE THIS FUNCTION (around line 400-420)
  function renderTextLine(ctx, text, x, y, color) {  // Remove currentSelection parameter
    if (currentSelection.glowEnabled) {  // Use global currentSelection
      const rgbColor = hexToRgb(color);
      
      const textColor = 'rgb(' + 
        Math.round(rgbColor.r * 0.2 + 255 * 0.8) + ',' +
        Math.round(rgbColor.g * 0.2 + 255 * 0.8) + ',' +
        Math.round(rgbColor.b * 0.2 + 255 * 0.8) + ')';
      
      // 5 layers of glow
      ctx.shadowBlur = 80;
      ctx.shadowColor = color;
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      
      ctx.shadowBlur = 40;
      ctx.shadowColor = color;
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      
      ctx.shadowBlur = 20;
      ctx.shadowColor = color;
      ctx.globalAlpha = 1;
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
      
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      ctx.globalAlpha = 1;
      ctx.fillStyle = textColor;
      ctx.fillText(text, x, y);
      
      ctx.shadowBlur = 0;
      ctx.fillStyle = textColor;
      ctx.fillText(text, x, y);
      
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
    }
  }

  // ============================================
  // UPDATED: Using new canvas-based calculations
  // ============================================
  function drawDimensionLine(ctx, x1, y1, x2, y2, label, isVertical = false) {
    ctx.save();
    
    // Line color - subtle but visible
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    
    // Draw main line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Draw end caps (arrows/ticks)
    const capSize = 8;
    if (isVertical) {
      // Top cap
      ctx.beginPath();
      ctx.moveTo(x1 - capSize, y1);
      ctx.lineTo(x1 + capSize, y1);
      ctx.stroke();
      
      // Bottom cap
      ctx.beginPath();
      ctx.moveTo(x2 - capSize, y2);
      ctx.lineTo(x2 + capSize, y2);
      ctx.stroke();
      
      // Draw label
      ctx.font = '14px Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      const labelY = (y1 + y2) / 2;
      ctx.fillText(label, x1 - 15, labelY);
    } else {
      // Left cap
      ctx.beginPath();
      ctx.moveTo(x1, y1 - capSize);
      ctx.lineTo(x1, y1 + capSize);
      ctx.stroke();
      
      // Right cap
      ctx.beginPath();
      ctx.moveTo(x2, y2 - capSize);
      ctx.lineTo(x2, y2 + capSize);
      ctx.stroke();
      
      // Draw label
      ctx.font = '14px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const labelX = (x1 + x2) / 2;
      ctx.fillText(label, labelX, y2 + 15);
    }
    
    ctx.restore();
  }

  function getTextBoundingBox(ctx, text, x, y, fontSize, fontFamily) {
    const lines = text.split('\\n').filter(line => line.trim().length > 0);
    if (lines.length === 0) return null;
    
    ctx.font = \`bold \${fontSize}px "\${fontFamily}", cursive\`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const lineHeight = fontSize * 1.2;
    const totalTextHeight = lines.length * fontSize + (lines.length - 1) * (lineHeight - fontSize);
    const startY = y - totalTextHeight / 2 + fontSize / 2;
    
    // Find widest line and measure actual bounds
    let maxWidth = 0;
    let maxAscent = 0;
    let maxDescent = 0;
    
    lines.forEach((line, index) => {
      const metrics = ctx.measureText(line);
      const lineY = startY + index * lineHeight;
      
      // Get actual bounding box metrics (includes ascenders/descenders)
      const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.8;
      const descent = metrics.actualBoundingBoxDescent || fontSize * 0.2;
      
      maxWidth = Math.max(maxWidth, metrics.width);
      
      // Track the highest ascent and lowest descent across all lines
      if (index === 0) {
        maxAscent = ascent;
      }
      if (index === lines.length - 1) {
        maxDescent = descent;
      }
    });
    
    // Calculate actual top and bottom including ascenders/descenders
    const firstLineY = startY;
    const lastLineY = startY + (lines.length - 1) * lineHeight;
    
    const actualTop = firstLineY - maxAscent;
    const actualBottom = lastLineY + maxDescent;
    const actualHeight = actualBottom - actualTop;
    
    return {
      left: x - maxWidth / 2,
      right: x + maxWidth / 2,
      top: actualTop,
      bottom: actualBottom,
      width: maxWidth,
      height: actualHeight
    };
  }
  function getCurrentRenderColor() {  // Remove currentSelection parameter
    if (!currentSelection.color) return '#ff1493';
    
    const colorObj = currentSelection.color;
    
    if (colorObj.colorEffect === 'single' || !colorObj.colors || colorObj.colors.length === 0) {
      return colorObj.hex || '#ff1493';
    }
    
    if (colorObj.currentAnimationIndex !== undefined) {
      return colorObj.colors[colorObj.currentAnimationIndex] || colorObj.colors[0];
    }
    
    return colorObj.colors[0];
  }


  function startColorAnimation(colorObj) {
    if (currentSelection.colorAnimationInterval) {
      clearInterval(currentSelection.colorAnimationInterval);
    }
    
    if (!colorObj.colors || colorObj.colors.length <= 1) return;
    
    if (colorObj.colorEffect === 'multiple') {
      colorObj.currentAnimationIndex = 0;
      currentSelection.colorAnimationInterval = setInterval(() => {
        colorObj.currentAnimationIndex = (colorObj.currentAnimationIndex + 1) % colorObj.colors.length;
        renderCanvas();
      }, 2000);
    } else if (colorObj.colorEffect === 'flow') {
      colorObj.currentAnimationIndex = 0;
      let step = 0;
      currentSelection.colorAnimationInterval = setInterval(() => {
        step++;
        if (step >= 20) {
          step = 0;
          colorObj.currentAnimationIndex = (colorObj.currentAnimationIndex + 1) % colorObj.colors.length;
        }
        renderCanvas();
      }, 100);
    }
  }
  
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 20, b: 147 };
  }

  function createSelectableButton(text, container, containerId, onClick, isSelected = false) {
    const div = document.createElement('div');
    div.style.cssText = \`
      padding:12px 8px;
      text-align:center;
      border:2px solid \${isSelected ? '#0066cc' : '#333'};
      background:\${isSelected ? 'rgba(0,102,204,0.1)' : '#1a1a1a'};
      border-radius:6px;
      cursor:pointer;
      transition: all 0.2s ease;
      font-size:13px;
      font-weight:500;
    \`;
    div.textContent = text;
    
    div.addEventListener('click', () => {
      document.querySelectorAll('#' + containerId + ' div').forEach(el => {
        el.style.borderColor = '#333';
        el.style.background = '#1a1a1a';
      });
      div.style.borderColor = '#0066cc';
      div.style.background = 'rgba(0,102,204,0.1)';
      onClick();
    });
    
    container.appendChild(div);
    return div;
  }

  function renderFonts() {
    const fonts = config?.fonts || [];
    if (fonts.length === 0) return;

    const list = document.getElementById('font-list');
    fonts.forEach((f, idx) => {
      const btn = createSelectableButton(f.name, list, 'font-list', () => {
        currentSelection.font = f;
        renderCanvas();
        calculatePrice();
      }, idx === 0);
      
      btn.style.fontFamily = '"' + f.fontFamily + '", cursive';
      
      if (idx === 0 && !currentSelection.font) {
        btn.click();
      }
    });
  }

  function renderColors() {
    const colors = config?.colors || [];
    if (colors.length === 0) return;

    const list = document.getElementById('color-list');
    colors.forEach((c, idx) => {
      const div = document.createElement('div');
      div.style.cssText = \`
        height:50px;
        width:50px;
        border:2px solid #333;
        border-radius:6px;
        cursor:pointer;
        transition: all 0.2s ease;
        position: relative;
        overflow: hidden;
      \`;
      
      if (c.colorEffect === 'single' || !c.colors || c.colors.length === 0) {
        div.style.background = c.hex || '#000000';
      } else if (c.colorEffect === 'multiple') {
        div.style.background = c.colors[0];
      } else if (c.colorEffect === 'flow') {
        div.style.background = 'linear-gradient(90deg, ' + c.colors.join(', ') + ')';
      }
      
      div.addEventListener('click', () => {
        document.querySelectorAll('#color-list div').forEach(el => {
          el.style.borderColor = '#333';
        });
        div.style.borderColor = '#0066cc';
        
        currentSelection.color = {...c, currentAnimationIndex: 0};
        
        if (c.colorEffect === 'multiple' || c.colorEffect === 'flow') {
          startColorAnimation(currentSelection.color);
        } else {
          if (currentSelection.colorAnimationInterval) {
            clearInterval(currentSelection.colorAnimationInterval);
            currentSelection.colorAnimationInterval = null;
          }
        }
        
        renderCanvas();
        calculatePrice();
      });
      
      list.appendChild(div);
      
      if (idx === 0 && !currentSelection.color) {
        div.click();
      }
    });
  }

  function renderSizes() {
    const sizes = config?.sizes || [];
    if (sizes.length === 0) return;

    const list = document.getElementById('size-list');
    sizes.forEach((s, idx) => {
      const btn = createSelectableButton(s.label, list, 'size-list', () => {
        currentSelection.size = s;
        calculatePrice();
        renderCanvas();
      }, idx === 0);
      
      if (idx === 0 && !currentSelection.size) {
        btn.click();
      }
    });
  }

  function renderUsageTypes() {
    const usageTypes = config?.usageTypes || [];
    if (usageTypes.length === 0) return;

    document.getElementById('usage-type-section').style.display = 'block';
    const list = document.getElementById('usage-type-list');
    usageTypes.forEach((u, idx) => {
      const btn = createSelectableButton(u.name, list, 'usage-type-list', () => {
        currentSelection.usageType = u;
        calculatePrice();
      }, idx === 0);
      
      if (idx === 0 && !currentSelection.usageType) {
        btn.click();
      }
    });
  }

  function renderAcrylicShapes() {
    const shapes = config?.acrylicShapes || [];
    if (shapes.length === 0) return;

    document.getElementById('acrylic-shape-section').style.display = 'block';
    const list = document.getElementById('acrylic-shape-list');
    
    shapes.forEach((s, idx) => {
      const div = document.createElement('div');
      div.style.cssText = \`
        padding:12px 8px;
        text-align:left;
        border:2px solid #333;
        background:#1a1a1a;
        border-radius:6px;
        cursor:pointer;
        transition: all 0.2s ease;
        position: relative;
        display: flex;
        align-items: center;
        gap: 8px;
      \`;
      
      // Thumbnail image on right side
      if (s.imageUrl) {
        const img = document.createElement('img');
        img.src = s.imageUrl;
        img.style.cssText = 'width:50px; height:50px; object-fit:contain; flex-shrink:0; order: 2;filter: invert(1);';
        div.appendChild(img);
      }
      
      // Label container on left
      const labelContainer = document.createElement('div');
      labelContainer.style.cssText = 'display:flex; flex-direction:column; gap:2px; flex:1; order: 1;';
      
      const label = document.createElement('div');
      label.textContent = s.name;
      label.style.cssText = 'font-size:12px; font-weight:600; color:#fff;';
      labelContainer.appendChild(label);
      
      if (s.basePrice && parseFloat(s.basePrice) > 0) {
        const price = document.createElement('div');
        price.textContent = '+USD' + parseFloat(s.basePrice).toFixed(0);
        price.style.cssText = 'font-size:11px; color:#0066cc; font-weight:500;';
        labelContainer.appendChild(price);
      } else {
        const freeLabel = document.createElement('div');
        freeLabel.textContent = 'Free';
        freeLabel.style.cssText = 'font-size:11px; color:#4ade80; font-weight:500;';
        labelContainer.appendChild(freeLabel);
      }
      
      div.appendChild(labelContainer);
      
      // Create lightbox tooltip for this specific div
      if (s.imageUrl) {
        const tooltip = document.createElement('div');
        tooltip.style.cssText = \`
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          z-index: 1000;
          display: none;
          pointer-events: none;
          max-width: 250px;
        \`;
        
        const tooltipImg = document.createElement('img');
        tooltipImg.src = s.imageUrl;
        tooltipImg.style.cssText = 'width: 100%; height: auto; display: block; border-radius: 4px;';
        tooltip.appendChild(tooltipImg);
        
        // Arrow pointing down
        const arrow = document.createElement('div');
        arrow.style.cssText = \`
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 8px solid white;
        \`;
        tooltip.appendChild(arrow);
        
        div.appendChild(tooltip);
        
        // Show tooltip on hover
        tooltip.addEventListener('mouseenter', () => {
          tooltip.style.display = 'block';
        });
        
        div.addEventListener('mouseleave', () => {
          tooltip.style.display = 'none';
        });
      }
      
      div.addEventListener('click', () => {
        document.querySelectorAll('#acrylic-shape-list > div').forEach(el => {
          el.style.borderColor = '#333';
          el.style.background = '#1a1a1a';
        });
        div.style.borderColor = '#0066cc';
        div.style.background = 'rgba(0,102,204,0.1)';
        currentSelection.acrylicShape = s;
        renderCanvas();
        calculatePrice();
      });
      
      list.appendChild(div);
      
      if (idx === 0 && !currentSelection.acrylicShape) {
        div.click();
      }
    });
  }

  function renderBackboardColors() {
    const colors = config?.backboardColors || [];
    if (colors.length === 0) return;

    document.getElementById('backboard-color-section').style.display = 'block';
    const list = document.getElementById('backboard-color-list');
    colors.forEach((c, idx) => {
      const div = document.createElement('div');
      div.style.cssText = \`
        height:50px;
        background:\${c.hex};
        border:2px solid #333;
        border-radius:6px;
        cursor:pointer;
        transition: all 0.2s ease;
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:11px;
        font-weight:600;
        color:white;
        text-shadow:1px 1px 2px black;
      \`;
      div.textContent = c.name;
      
      div.addEventListener('click', () => {
        document.querySelectorAll('#backboard-color-list div').forEach(el => {
          el.style.borderColor = '#333';
        });
        div.style.borderColor = '#0066cc';
        currentSelection.backboardColor = c;
        calculatePrice();
      });
      
      list.appendChild(div);
      
      if (idx === 0 && !currentSelection.backboardColor) {
        div.click();
      }
    });
  }

  function renderHangingOptions() {
    const options = config?.hangingOptions || [];
    if (options.length === 0) return;

    document.getElementById('hanging-option-section').style.display = 'block';
    const list = document.getElementById('hanging-option-list');
    options.forEach((o, idx) => {
      const btn = createSelectableButton(o.name, list, 'hanging-option-list', () => {
        currentSelection.hangingOption = o;
        calculatePrice();
      }, idx === 0);
      
      if (idx === 0 && !currentSelection.hangingOption) {
        btn.click();
      }
    });
  }

  function renderBackgrounds() {
    const backgrounds = config?.backgrounds || defaultBackgrounds;
    const list = document.getElementById('background-list');
    
    backgrounds.forEach((bg, idx) => {
      const div = document.createElement('div');
      div.style.cssText = \`
        width:40px;
        height:40px;
        background:\${bg};
        border:2px solid \${idx === 0 ? '#0066cc' : '#333'};
        border-radius:6px;
        cursor:pointer;
        transition: all 0.2s ease;
        flex-shrink:0;
      \`;
      
      div.addEventListener('click', () => {
        document.querySelectorAll('#background-list div').forEach(el => {
          el.style.borderColor = '#333';
        });
        div.style.borderColor = '#0066cc';
        currentSelection.background = bg;
        renderCanvas();
      });
      
      list.appendChild(div);
      
      if (idx === 0) {
        currentSelection.background = bg;
      }
    });
  }

  function getLetterWidth(char, height, multiplier, font) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = font;
    const width = ctx.measureText(char).width;
    const fontSize = parseInt(font.match(/\\d+/)[0]);
    const characterRatio = width / fontSize;
    return height * characterRatio * multiplier;
  }

  function calculatePrice() {  // Remove (config, currentSelection) parameters
    if (!currentSelection.font || !currentSelection.size) {
      updatePrice(0);  // Add this
      return;
    }

    const allText = currentSelection.customText || 'Your Text';
    const font = currentSelection.font;
    const sizeMultiplier = currentSelection.size.multiplier;
    
    const pricing = config?.pricings?.find(p => p._id === font.pricingId);
    if (!pricing) {
      updatePrice(0);  // Add this
      return;
    }

    let totalPrice = 0;

    // Choose pricing method based on letterPricingType
    if (pricing.letterPricingType === 'material') {
      totalPrice = calculateMaterialBasedPrice(allText, font, sizeMultiplier, pricing);
    } else if (pricing.letterPricingType === 'fixed') {
      totalPrice = calculateFixedPricePerLetter(allText, pricing);
    }

    // Add additional pricing for options
    if (currentSelection.color?.additionalPricing === 'basePrice') {
      totalPrice += parseFloat(currentSelection.color.basePrice || 0);
    }
    if (currentSelection.backboardColor?.additionalPricing === 'basePrice') {
      totalPrice += parseFloat(currentSelection.backboardColor.basePrice || 0);
    }
    if (currentSelection.hangingOption?.additionalPricing === 'basePrice') {
      totalPrice += parseFloat(currentSelection.hangingOption.basePrice || 0);
    }

    updatePrice(totalPrice);  // Add this - was missing!
  }
  

  function getMaterialLength(char, heightInCm, fontFamily) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const measurementFontSize = 1000;
    ctx.font = \`bold \${measurementFontSize}px "\${fontFamily}"\`;
    const metrics = ctx.measureText(char);
    
    // For material cost, we use the actual character width without extra spacing
    const charWidth = metrics.width;
    const widthToHeightRatio = charWidth / measurementFontSize;
    const displayWidth = heightInCm * widthToHeightRatio;
    
    // Material length is approximately 1.4-1.5x the display width
    // This accounts for the tube following the character outline (top, bottom, curves)
    const MATERIAL_PATH_MULTIPLIER = 1.45;
    
    return displayWidth * MATERIAL_PATH_MULTIPLIER;
  }
  function updatePrice(price) {
    const el = document.getElementById('total-price');
    if (el) el.textContent = 'Rs ' + price.toFixed(2);
  }

  function addToCart() {
    if (!currentSelection.customText) return alert('Please enter your text');
    if (!currentSelection.font) return alert('Please select a font');
    if (!currentSelection.color) return alert('Please select a color');
    if (!currentSelection.size) return alert('Please select a size');
    
    const allText = currentSelection.customText || 'Your Text';
    const lines = allText.split('\\n').filter(line => line.trim().length > 0);
    
    const cartData = {
      text: currentSelection.customText,
      numberOfLines: lines.length,
      font: currentSelection.font.name,
      color: currentSelection.color.name,
      size: currentSelection.size.label,
      glowEnabled: currentSelection.glowEnabled,
      usageType: currentSelection.usageType?.name,
      acrylicShape: currentSelection.acrylicShape?.name,
      backboardColor: currentSelection.backboardColor?.name,
      hangingOption: currentSelection.hangingOption?.name,
      dimensions: currentSelection.boxDimensions,
      totalPrice: document.getElementById('total-price').textContent
    };
    
    console.log('Adding to cart:', cartData);
    alert('Added to cart!\\n' + 
          'Total: ' + cartData.totalPrice + '\\n' + 
          'Lines: ' + cartData.numberOfLines + '\\n' +
          'Box Dimensions: ' + cartData.dimensions.widthInInches + 'in (W) x ' + 
          cartData.dimensions.heightInInches + 'in (H)');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadConfig);
  else loadConfig();
})();
  `;

  return new Response(scriptContent, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
};