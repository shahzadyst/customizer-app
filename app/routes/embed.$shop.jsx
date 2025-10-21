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

  let apiUrl = '${appUrl}/api/config/' + SHOP_DOMAIN;
  if (customizerId) {
    apiUrl += '?customizerId=' + customizerId;
  }
  const API_URL = apiUrl;

  let config = null;
  let currentSelection = {
    font: null,
    color: null,
    size: null,
    usageType: null,
    acrylicShape: null,
    backboardColor: null,
    hangingOption: null,
    customText: '',
    glowEnabled: true
  };

  async function loadConfig() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (data.success) {
        config = data.config;
        console.log('Signage customizer config loaded:', config);
      } else {
        console.error('Failed to load config:', data.error);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  }

  function createModal() {
    const modal = document.createElement('div');
    modal.id = 'signage-customizer-modal';
    modal.style.cssText = \`
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 10000;
      overflow-y: auto;
    \`;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = \`
      display: grid;
      grid-template-columns: 2fr 1fr;
      max-width: 1600px;
      height: 100vh;
      margin: 0 auto;
      background: #1a1a1a;
    \`;

    modalContent.innerHTML = \`
      <div style="position: relative; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #2a4858 0%, #1a2832 100%); padding: 40px;">
        <div style="position: absolute; top: 20px; left: 20px; display: flex; gap: 10px; align-items: center;">
          <button id="glow-toggle" style="padding: 8px 16px; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.3s;">
            On
          </button>
          <span style="color: rgba(255,255,255,0.6); font-size: 14px;">Glow</span>
        </div>

        <div style="position: absolute; top: 20px; right: 20px; color: white; text-align: right;">
          <div style="font-size: 24px; font-weight: 600;" id="total-price">Rs 0.00</div>
          <div style="font-size: 12px; opacity: 0.7;">IND TAX</div>
        </div>

        <div id="preview-container" style="position: relative;">
          <div id="preview-text" style="font-size: 72px; font-weight: bold; color: #ff1493; text-shadow: 0 0 40px #ff1493, 0 0 80px #ff1493; transition: all 0.3s; white-space: nowrap; font-family: 'Dancing Script', cursive;">
            Your Text
          </div>
          <div id="preview-dimensions" style="position: absolute; bottom: -30px; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,0.5); font-size: 12px; white-space: nowrap;">
            120"
          </div>
        </div>
      </div>

      <div style="background: #1a1a1a; color: white; overflow-y: auto; padding: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
          <div>
            <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">Enter Your Text</h2>
            <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.5);">
              <button id="add-text-button" style="background: #0066cc; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 8px;">+ Text</button>
              Text can be used to center your design display
            </p>
          </div>
          <button id="close-modal" style="background: none; border: none; font-size: 32px; cursor: pointer; color: rgba(255,255,255,0.7); padding: 0; line-height: 1;">&times;</button>
        </div>

        <div style="margin-bottom: 24px;">
          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <button class="text-align-btn" data-align="left" style="flex: 1; padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: white; cursor: pointer; font-size: 14px;">
              ≡
            </button>
            <button class="text-align-btn" data-align="center" style="flex: 1; padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: white; cursor: pointer; font-size: 14px;">
              ≡
            </button>
            <button class="text-align-btn" data-align="right" style="flex: 1; padding: 10px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; color: white; cursor: pointer; font-size: 14px;">
              ≡
            </button>
          </div>
          <textarea
            id="custom-text-input"
            placeholder="Your Text"
            style="width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.2); border-radius: 6px; font-size: 16px; background: rgba(255,255,255,0.05); color: white; resize: none; height: 60px; font-family: inherit;"
          ></textarea>
        </div>

        <div id="options-container" style="display: flex; flex-direction: column; gap: 24px;">
        </div>

        <div style="position: sticky; bottom: 0; left: 0; right: 0; padding: 20px 0; background: #1a1a1a; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 30px;">
          <button id="buy-now-btn" style="width: 100%; padding: 16px; background: #0066cc; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; transition: background 0.3s;">
            Buy Now
          </button>
        </div>
      </div>
    \`;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('buy-now-btn').addEventListener('click', addToCart);
    document.getElementById('custom-text-input').addEventListener('input', updatePreview);
    document.getElementById('glow-toggle').addEventListener('click', toggleGlow);

    document.querySelectorAll('.text-align-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.text-align-btn').forEach(b => {
          b.style.background = 'rgba(255,255,255,0.1)';
          b.style.borderColor = 'rgba(255,255,255,0.2)';
        });
        this.style.background = 'rgba(255,255,255,0.2)';
        this.style.borderColor = 'rgba(255,255,255,0.4)';
      });
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  function toggleGlow() {
    currentSelection.glowEnabled = !currentSelection.glowEnabled;
    const toggleBtn = document.getElementById('glow-toggle');
    const previewText = document.getElementById('preview-text');

    if (currentSelection.glowEnabled) {
      toggleBtn.textContent = 'On';
      toggleBtn.style.background = 'rgba(255,255,255,0.2)';
      if (previewText && currentSelection.color) {
        previewText.style.textShadow = \`0 0 40px \${currentSelection.color.hexValue}, 0 0 80px \${currentSelection.color.hexValue}\`;
      }
    } else {
      toggleBtn.textContent = 'Off';
      toggleBtn.style.background = 'rgba(255,255,255,0.05)';
      if (previewText) {
        previewText.style.textShadow = 'none';
      }
    }
  }

  function renderOptions() {
    if (!config) return;

    const container = document.getElementById('options-container');
    container.innerHTML = '';

    if (config.fonts && config.fonts.length > 0) {
      const section = createSection('Choose a font', config.fonts, 'font', (item) => {
        return \`
          <div style="padding: 10px; border: 2px solid rgba(255,255,255,0.2); border-radius: 8px; background: rgba(255,255,255,0.05); cursor: pointer; text-align: center; transition: all 0.2s; font-family: '\${item.fontFamily}', cursive;">
            <div style="font-size: 18px; margin-bottom: 4px;">\${item.name}</div>
          </div>
        \`;
      }, true);
      container.appendChild(section);
    }

    const colorSection = createColorSection();
    if (colorSection) container.appendChild(colorSection);

    const sizeSection = createGridSection('Choose a size', 'sizes', 'size');
    if (sizeSection) container.appendChild(sizeSection);

    const usageSection = createGridSection('Type of Outdoor', 'usageTypes', 'usageType');
    if (usageSection) container.appendChild(usageSection);

    const shapeSection = createGridSection('Acrylic Shape', 'acrylicShapes', 'acrylicShape');
    if (shapeSection) container.appendChild(shapeSection);

    const backboardSection = createBackboardSection();
    if (backboardSection) container.appendChild(backboardSection);

    const hangingSection = createGridSection('Wall Mounting Kit OR Sign Hanging kit', 'hangingOptions', 'hangingOption');
    if (hangingSection) container.appendChild(hangingSection);
  }

  function createSection(title, items, key, renderItem, isFont = false) {
    const section = document.createElement('div');
    section.innerHTML = \`
      <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: white;">\${title}</h3>
      <div id="\${key}-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;"></div>
    \`;

    const grid = section.querySelector(\`#\${key}-grid\`);

    items.forEach(item => {
      const option = document.createElement('div');
      option.className = \`option-\${key}\`;
      option.dataset.value = JSON.stringify(item);
      option.innerHTML = renderItem(item);

      option.addEventListener('click', function() {
        document.querySelectorAll(\`.option-\${key}\`).forEach(opt => {
          const child = opt.firstElementChild;
          if (child) {
            child.style.borderColor = 'rgba(255,255,255,0.2)';
            child.style.background = 'rgba(255,255,255,0.05)';
          }
        });

        const child = this.firstElementChild;
        if (child) {
          child.style.borderColor = 'white';
          child.style.background = 'rgba(255,255,255,0.15)';
        }

        currentSelection[key] = item;
        updatePreview();
        calculatePrice();
      });

      grid.appendChild(option);
    });

    return section;
  }

  function createColorSection() {
    if (!config.colors || config.colors.length === 0) return null;

    const section = document.createElement('div');
    section.innerHTML = \`
      <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: white;">Nit Pick</h3>
      <div id="color-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)); gap: 12px;"></div>
    \`;

    const grid = section.querySelector('#color-grid');

    config.colors.forEach(color => {
      const option = document.createElement('div');
      option.className = 'option-color';
      option.dataset.value = JSON.stringify(color);
      option.innerHTML = \`
        <div style="width: 40px; height: 40px; border-radius: 8px; background: \${color.hexValue}; cursor: pointer; border: 3px solid rgba(255,255,255,0.2); transition: all 0.2s;"></div>
      \`;

      option.addEventListener('click', function() {
        document.querySelectorAll('.option-color > div').forEach(opt => {
          opt.style.borderColor = 'rgba(255,255,255,0.2)';
          opt.style.transform = 'scale(1)';
        });

        this.firstElementChild.style.borderColor = 'white';
        this.firstElementChild.style.transform = 'scale(1.1)';

        currentSelection.color = color;
        updatePreview();
        calculatePrice();
      });

      grid.appendChild(option);
    });

    return section;
  }

  function createGridSection(title, configKey, selectionKey) {
    if (!config[configKey] || config[configKey].length === 0) return null;

    const section = document.createElement('div');
    section.innerHTML = \`
      <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: white;">\${title}</h3>
      <div id="\${selectionKey}-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;"></div>
    \`;

    const grid = section.querySelector(\`#\${selectionKey}-grid\`);

    config[configKey].forEach(item => {
      const option = document.createElement('div');
      option.className = \`option-\${selectionKey}\`;
      option.dataset.value = JSON.stringify(item);
      option.innerHTML = \`
        <div style="padding: 12px; border: 2px solid rgba(255,255,255,0.2); border-radius: 8px; background: rgba(255,255,255,0.05); cursor: pointer; text-align: center; transition: all 0.2s;">
          <div style="font-size: 14px; font-weight: 500;">\${item.name}</div>
          \${item.priceModifier > 0 ? \`<div style="font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 4px;">+$\${item.priceModifier}</div>\` : ''}
        </div>
      \`;

      option.addEventListener('click', function() {
        document.querySelectorAll(\`.option-\${selectionKey} > div\`).forEach(opt => {
          opt.style.borderColor = 'rgba(255,255,255,0.2)';
          opt.style.background = 'rgba(255,255,255,0.05)';
        });

        this.firstElementChild.style.borderColor = 'white';
        this.firstElementChild.style.background = 'rgba(255,255,255,0.15)';

        currentSelection[selectionKey] = item;
        updatePreview();
        calculatePrice();
      });

      grid.appendChild(option);
    });

    return section;
  }

  function createBackboardSection() {
    if (!config.backboardColors || config.backboardColors.length === 0) return null;

    const section = document.createElement('div');
    section.innerHTML = \`
      <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px; color: white;">Backboard Color</h3>
      <p style="font-size: 13px; color: rgba(255,255,255,0.5); margin-bottom: 12px;">Excellent clear acrylic backboard</p>
      <div id="backboard-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(50px, 1fr)); gap: 12px;"></div>
    \`;

    const grid = section.querySelector('#backboard-grid');

    config.backboardColors.forEach(color => {
      const option = document.createElement('div');
      option.className = 'option-backboard';
      option.dataset.value = JSON.stringify(color);
      option.innerHTML = \`
        <div style="width: 50px; height: 50px; border-radius: 50%; background: \${color.hexValue}; cursor: pointer; border: 3px solid rgba(255,255,255,0.2); transition: all 0.2s;"></div>
      \`;

      option.addEventListener('click', function() {
        document.querySelectorAll('.option-backboard > div').forEach(opt => {
          opt.style.borderColor = 'rgba(255,255,255,0.2)';
          opt.style.transform = 'scale(1)';
        });

        this.firstElementChild.style.borderColor = 'white';
        this.firstElementChild.style.transform = 'scale(1.1)';

        currentSelection.backboardColor = color;
        updatePreview();
        calculatePrice();
      });

      grid.appendChild(option);
    });

    return section;
  }

  function updatePreview() {
    const textInput = document.getElementById('custom-text-input');
    const previewText = document.getElementById('preview-text');

    currentSelection.customText = textInput ? textInput.value : '';

    if (previewText) {
      previewText.textContent = currentSelection.customText || 'Your Text';

      if (currentSelection.font) {
        previewText.style.fontFamily = \`'\${currentSelection.font.fontFamily}', cursive\`;
      }
      if (currentSelection.color) {
        previewText.style.color = currentSelection.color.hexValue;
        if (currentSelection.glowEnabled) {
          previewText.style.textShadow = \`0 0 40px \${currentSelection.color.hexValue}, 0 0 80px \${currentSelection.color.hexValue}\`;
        } else {
          previewText.style.textShadow = 'none';
        }
      }
    }
  }

  function calculatePrice() {
    if (!currentSelection.font || !currentSelection.customText || !config.pricings) {
      updatePriceDisplay(0);
      return;
    }

    const selectedFont = currentSelection.font;
    const pricing = config.pricings.find(p => p._id === selectedFont.pricingId);

    if (!pricing) {
      updatePriceDisplay(0);
      return;
    }

    let totalPrice = 0;
    const textLength = currentSelection.customText.length;

    if (pricing.letterPricingType === 'fixed' && pricing.sizeBoundaries && pricing.sizeBoundaries.length > 0) {
      const boundary = pricing.sizeBoundaries[0];
      const pricePerLetter = parseFloat(boundary.pricePerLetter || 0);
      const signStartPrice = parseFloat(boundary.signStartPrice || 0);

      totalPrice = (pricePerLetter * textLength) + signStartPrice;
    } else if (pricing.letterPricingType === 'material' && pricing.sizeBoundaries && pricing.sizeBoundaries.length > 0) {
      const boundary = pricing.sizeBoundaries[0];
      const materialPrice = parseFloat(boundary.materialPrice || 0);
      const signStartPrice = parseFloat(boundary.signStartPrice || 0);

      totalPrice = (materialPrice * textLength * 10) + signStartPrice;
    }

    Object.values(currentSelection).forEach(item => {
      if (item && typeof item === 'object' && item.priceModifier) {
        totalPrice += parseFloat(item.priceModifier);
      }
    });

    updatePriceDisplay(totalPrice);
  }

  function updatePriceDisplay(price) {
    const priceElement = document.getElementById('total-price');
    if (priceElement) {
      priceElement.textContent = \`Rs \${price.toFixed(2)}\`;
    }
  }

  function addToCart() {
    if (!currentSelection.customText) {
      alert('Please enter your custom text');
      return;
    }

    if (!currentSelection.font) {
      alert('Please select a font');
      return;
    }

    const priceText = document.getElementById('total-price').textContent;
    const price = parseFloat(priceText.replace('Rs ', ''));

    const customization = {
      text: currentSelection.customText,
      font: currentSelection.font?.name,
      color: currentSelection.color?.name,
      size: currentSelection.size?.name,
      usageType: currentSelection.usageType?.name,
      acrylicShape: currentSelection.acrylicShape?.name,
      backboardColor: currentSelection.backboardColor?.name,
      hangingOption: currentSelection.hangingOption?.name,
      glowEnabled: currentSelection.glowEnabled,
      totalPrice: price
    };

    console.log('Adding to cart:', customization);

    window.dispatchEvent(new CustomEvent('signageCustomized', {
      detail: customization
    }));

    alert('Customization saved! Total price: Rs ' + price.toFixed(2));
    closeModal();
  }

  function openModal() {
    if (!config) {
      alert('Configuration is still loading. Please try again in a moment.');
      return;
    }

    const modal = document.getElementById('signage-customizer-modal');
    if (modal) {
      modal.style.display = 'block';
      renderOptions();
      currentSelection = {
        font: null,
        color: null,
        size: null,
        usageType: null,
        acrylicShape: null,
        backboardColor: null,
        hangingOption: null,
        customText: '',
        glowEnabled: true
      };
      updatePreview();
      calculatePrice();
    }
  }

  function closeModal() {
    const modal = document.getElementById('signage-customizer-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  function init() {
    loadConfig();
    createModal();

    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('signage-customizer-btn') ||
          e.target.closest('.signage-customizer-btn')) {
        e.preventDefault();
        openModal();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
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
