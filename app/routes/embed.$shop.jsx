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
              <!-- Height indicator (left side) -->
              <div id="height-indicator" style="position:absolute; left:-60px; top:50%; transform:translateY(-50%); display:flex; align-items:center;">
                <div style="writing-mode:vertical-rl; transform:rotate(180deg); color:rgba(255,255,255,0.7); font-size:12px; margin-right:8px;" id="height-label">9in</div>
                <div style="width:2px; height:100px; background:rgba(255,0,0,0.8); position:relative;" id="height-line">
                  <div style="position:absolute; top:-4px; left:-3px; width:8px; height:8px; background:rgba(255,0,0,0.8);"></div>
                  <div style="position:absolute; bottom:-4px; left:-3px; width:8px; height:8px; background:rgba(255,0,0,0.8);"></div>
                  <div style="position:absolute; top:0; left:2px; width:15px; height:2px; background:rgba(255,0,0,0.8);"></div>
                  <div style="position:absolute; bottom:0; left:2px; width:15px; height:2px; background:rgba(255,0,0,0.8);"></div>
                </div>
              </div>
              
              <canvas id="preview-canvas" width="900" height="400" style="max-width:90%; display:block;"></canvas>
              
              <!-- Width indicator (bottom) -->
              <div id="width-indicator" style="position:absolute; bottom:-50px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; width:80%;">
                <div style="height:2px; background:rgba(255,0,0,0.8); position:relative; width:100%;" id="width-line">
                  <div style="position:absolute; left:-4px; top:-3px; width:8px; height:8px; background:rgba(255,0,0,0.8);"></div>
                  <div style="position:absolute; right:-4px; top:-3px; width:8px; height:8px; background:rgba(255,0,0,0.8);"></div>
                  <div style="position:absolute; left:0; top:2px; width:2px; height:15px; background:rgba(255,0,0,0.8);"></div>
                  <div style="position:absolute; right:0; top:2px; width:2px; height:15px; background:rgba(255,0,0,0.8);"></div>
                </div>
                <div style="color:rgba(255,255,255,0.7); font-size:12px; margin-top:8px;" id="width-label">24in</div>
              </div>
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
            <div id="color-list" style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-top:8px;"></div>
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

  function renderCanvas() {
    const canvas = document.getElementById('preview-canvas');
    const previewContainer = document.getElementById('preview-container');
    if (!canvas) return;
    
    // Update background
    previewContainer.style.background = currentSelection.background;
    
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
    const fontSize = 80;
    
    // Load font and render
    const fontString = 'bold ' + fontSize + 'px "' + fontFamily + '", cursive';
    const fontLoadPromise = document.fonts ? document.fonts.load(fontString) : Promise.resolve();
    
    fontLoadPromise.then(() => {
      // Clear again before rendering
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
      
      const renderColor = getCurrentRenderColor();
      
      lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        renderTextLine(ctx, line, displayWidth / 2, y, renderColor);
      });

      updateDimensionDisplay();
    }).catch(err => {
      console.warn('Font loading failed, using fallback:', err);
      // Clear and render with fallback
      ctx.clearRect(0, 0, displayWidth, displayHeight);
      ctx.font = 'bold 80px cursive';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const allText = currentSelection.customText || 'Your Text';
      const lines = allText.split('\\n').filter(line => line.trim().length > 0);
      
      if (lines.length === 0) {
        lines.push('Your Text');
      }
      
      const lineHeight = 80 * 1.2;
      const totalHeight = lines.length * 80 + (lines.length - 1) * (lineHeight - 80);
      const startY = displayHeight / 2 - totalHeight / 2 + 80 / 2;
      
      const renderColor = getCurrentRenderColor();
      
      lines.forEach((line, index) => {
        const y = startY + index * lineHeight;
        ctx.fillStyle = renderColor;
        ctx.fillText(line, displayWidth / 2, y);
      });
      
      updateDimensionDisplay();
    });
  }

  function renderTextLine(ctx, text, x, y, color) {
    if (currentSelection.glowEnabled) {
      const rgbColor = hexToRgb(color);
      const textColor = 'rgb(' + 
        Math.round(rgbColor.r * 0.1 + 255 * 0.9) + ',' +
        Math.round(rgbColor.g * 0.1 + 255 * 0.9) + ',' +
        Math.round(rgbColor.b * 0.1 + 255 * 0.9) + ')';
      
      ctx.shadowBlur = 40;
      ctx.shadowColor = color;
      ctx.fillStyle = textColor;
      ctx.fillText(text, x, y);
      
      ctx.shadowBlur = 0;
      ctx.fillText(text, x, y);
    } else {
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
    }
  }

  function updateDimensionDisplay() {
    if (!currentSelection.font || !currentSelection.size) return;
    
    const allText = currentSelection.customText || 'Your Text';
    const lines = allText.split('\\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      lines.push('Your Text');
    }
    
    const font = currentSelection.font;
    const sizeMultiplier = currentSelection.size.multiplier;
    const heightPerLine = (font.minHeightUppercase || 10) * sizeMultiplier;
    
    // Calculate total height with spacing between lines
    const lineSpacing = lines.length > 1 ? heightPerLine * 0.5 : 0;
    const totalHeight = heightPerLine * lines.length + lineSpacing * (lines.length - 1);
    
    // Calculate width for all lines and take the maximum
    const fontString = 'bold 100px "' + font.fontFamily + '"';
    let maxWidth = 0;
    
    lines.forEach(line => {
      let lineWidth = 0;
      for (let char of line) {
        lineWidth += getLetterWidth(char, heightPerLine, sizeMultiplier, fontString);
      }
      maxWidth = Math.max(maxWidth, lineWidth);
    });
    
    // Convert cm to inches (1 inch = 2.54 cm)
    const heightInInches = (totalHeight / 2.54).toFixed(0);
    const widthInInches = (maxWidth / 2.54).toFixed(0);
    
    // Update height label and line
    const heightLabel = document.getElementById('height-label');
    const heightLine = document.getElementById('height-line');
    if (heightLabel) heightLabel.textContent = heightInInches + 'in';
    if (heightLine) {
      const displayHeight = Math.min(200, totalHeight * 10);
      heightLine.style.height = displayHeight + 'px';
    }
    
    // Update width label and line
    const widthLabel = document.getElementById('width-label');
    const widthLine = document.getElementById('width-line');
    if (widthLabel) widthLabel.textContent = widthInInches + 'in';
    if (widthLine) {
      const widthIndicator = document.getElementById('width-indicator');
      if (widthIndicator) {
        const canvas = document.getElementById('preview-canvas');
        if (canvas) {
          const canvasWidth = canvas.offsetWidth;
          const textWidth = Math.min(canvasWidth * 0.9, maxWidth * 5);
          widthIndicator.style.width = textWidth + 'px';
        }
      }
    }
    
    // Store dimensions for shipping calculation
    currentSelection.boxDimensions = {
      width: maxWidth,
      height: totalHeight,
      numberOfLines: lines.length,
      heightInInches: parseFloat(heightInInches),
      widthInInches: parseFloat(widthInInches)
    };
  }

  function getCurrentRenderColor() {
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
    const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
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
        padding:8px;
        text-align:center;
        border:2px solid #333;
        background:#1a1a1a;
        border-radius:6px;
        cursor:pointer;
        transition: all 0.2s ease;
      \`;
      
      if (s.imageUrl) {
        const img = document.createElement('img');
        img.src = s.imageUrl;
        img.style.cssText = 'width:100%; height:60px; object-fit:contain; margin-bottom:4px;';
        div.appendChild(img);
      }
      
      const label = document.createElement('div');
      label.textContent = s.name;
      label.style.cssText = 'font-size:11px; font-weight:500;';
      div.appendChild(label);
      
      div.addEventListener('click', () => {
        document.querySelectorAll('#acrylic-shape-list div').forEach(el => {
          el.style.borderColor = '#333';
          el.style.background = '#1a1a1a';
        });
        div.style.borderColor = '#0066cc';
        div.style.background = 'rgba(0,102,204,0.1)';
        currentSelection.acrylicShape = s;
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

  function calculatePrice() {
    if (!currentSelection.font || !currentSelection.size) {
      updatePrice(0);
      return;
    }

    const allText = currentSelection.customText || 'Your Text';
    const lines = allText.split('\\n').filter(line => line.trim().length > 0);
    
    if (lines.length === 0) {
      lines.push('Your Text');
    }

    const font = currentSelection.font;
    const sizeMultiplier = currentSelection.size.multiplier;
    
    const pricing = config?.pricings?.find(p => p._id === font.pricingId);
    if (!pricing) {
      updatePrice(0);
      return;
    }

    let totalPrice = 0;

    if (pricing.letterPricingType === 'fixed') {
      // Calculate total characters across all lines
      const totalLetterCount = lines.reduce((sum, line) => sum + line.length, 0);
      let boundary = pricing.sizeBoundaries?.[0];
      
      const pricePerLetter = parseFloat(boundary?.pricePerLetter || 0);
      const signStartPrice = parseFloat(boundary?.signStartPrice || 0);
      
      totalPrice = signStartPrice + (totalLetterCount * pricePerLetter);
      
    } else if (pricing.letterPricingType === 'material') {
      const height = (font.minHeightUppercase || 10) * sizeMultiplier;
      
      let boundary = pricing.sizeBoundaries?.[0];
      const materialPrice = parseFloat(boundary?.materialPrice || 0);
      const signStartPrice = parseFloat(boundary?.signStartPrice || 0);
      
      const fontString = 'bold 100px "' + font.fontFamily + '"';
      
      // Calculate total length for all lines
      let totalLength = 0;
      lines.forEach(line => {
        let lineLength = 0;
        for (let char of line) {
          lineLength += getLetterWidth(char, height, sizeMultiplier, fontString);
        }
        totalLength += lineLength;
      });
      
      totalPrice = signStartPrice + (totalLength * materialPrice);
    }

    // Add additional pricing
    if (currentSelection.color?.additionalPricing === 'basePrice') {
      totalPrice += parseFloat(currentSelection.color.basePrice || 0);
    }
    if (currentSelection.backboardColor?.additionalPricing === 'basePrice') {
      totalPrice += parseFloat(currentSelection.backboardColor.basePrice || 0);
    }
    if (currentSelection.hangingOption?.additionalPricing === 'basePrice') {
      totalPrice += parseFloat(currentSelection.hangingOption.basePrice || 0);
    }

    updatePrice(totalPrice);
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