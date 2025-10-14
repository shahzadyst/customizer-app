export const loader = async ({ params, request }) => {
  const { shop } = params;
  const appUrl = process.env.SHOPIFY_APP_URL || "";

  const scriptContent = `
(function() {
  'use strict';

  const SHOP_DOMAIN = '${shop}';
  const API_URL = '${appUrl}/api/config/' + SHOP_DOMAIN;

  let config = null;
  let currentSelection = {
    font: null,
    color: null,
    size: null,
    usageType: null,
    acrylicShape: null,
    backboardColor: null,
    hangingOption: null,
    customText: ''
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
      background: rgba(0, 0, 0, 0.7);
      z-index: 10000;
      overflow-y: auto;
    \`;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = \`
      background: white;
      max-width: 900px;
      margin: 50px auto;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    \`;

    modalContent.innerHTML = \`
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
        <h2 style="margin: 0; font-size: 28px; color: #333;">Customize Your Signage</h2>
        <button id="close-modal" style="background: none; border: none; font-size: 32px; cursor: pointer; color: #666;">&times;</button>
      </div>

      <div id="customizer-content" style="display: grid; gap: 20px;">
        <div id="preview-section" style="background: #f8f8f8; padding: 30px; border-radius: 8px; text-align: center; min-height: 200px;">
          <div id="preview-text" style="font-size: 48px; font-weight: bold; margin-bottom: 20px;">Your Text Here</div>
          <div id="preview-details" style="font-size: 14px; color: #666;"></div>
        </div>

        <div id="options-container" style="display: grid; gap: 20px;"></div>

        <div style="margin-top: 20px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">Custom Text</label>
          <input
            type="text"
            id="custom-text-input"
            placeholder="Enter your text here"
            style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px;"
          />
        </div>

        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button id="add-to-cart-btn" style="flex: 1; padding: 15px 30px; background: #000; color: white; border: none; border-radius: 6px; font-size: 16px; font-weight: 600; cursor: pointer;">
            Add to Cart
          </button>
          <button id="cancel-btn" style="padding: 15px 30px; background: #f0f0f0; color: #333; border: none; border-radius: 6px; font-size: 16px; font-weight: 600; cursor: pointer;">
            Cancel
          </button>
        </div>
      </div>
    \`;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('cancel-btn').addEventListener('click', closeModal);
    document.getElementById('add-to-cart-btn').addEventListener('click', addToCart);
    document.getElementById('custom-text-input').addEventListener('input', updatePreview);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  function renderOptions() {
    if (!config) return;

    const container = document.getElementById('options-container');
    container.innerHTML = '';

    const sections = [
      { title: 'Font', key: 'fonts', displayKey: 'font' },
      { title: 'Color', key: 'colors', displayKey: 'color' },
      { title: 'Size', key: 'sizes', displayKey: 'size' },
      { title: 'Usage Type', key: 'usageTypes', displayKey: 'usageType' },
      { title: 'Acrylic Shape', key: 'acrylicShapes', displayKey: 'acrylicShape' },
      { title: 'Backboard Color', key: 'backboardColors', displayKey: 'backboardColor' },
      { title: 'Hanging Option', key: 'hangingOptions', displayKey: 'hangingOption' }
    ];

    sections.forEach(section => {
      const items = config[section.key];
      if (items && items.length > 0) {
        const sectionDiv = document.createElement('div');
        sectionDiv.innerHTML = \`
          <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">\${section.title}</label>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;"></div>
        \`;

        const optionsGrid = sectionDiv.querySelector('div');

        items.forEach(item => {
          const option = document.createElement('button');
          option.className = 'option-btn';
          option.dataset.section = section.displayKey;
          option.dataset.value = JSON.stringify(item);
          option.style.cssText = \`
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 6px;
            background: white;
            cursor: pointer;
            text-align: left;
            transition: all 0.2s;
          \`;

          let displayContent = item.name;
          if (item.hexValue) {
            displayContent = \`
              <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 24px; height: 24px; border-radius: 4px; background: \${item.hexValue}; border: 1px solid #ddd;"></div>
                <span>\${item.name}</span>
              </div>
            \`;
          }
          if (item.priceModifier && item.priceModifier > 0) {
            displayContent += \` <span style="color: #666; font-size: 12px;">(+$\${item.priceModifier})</span>\`;
          }

          option.innerHTML = displayContent;

          option.addEventListener('click', function() {
            document.querySelectorAll(\`[data-section="\${section.displayKey}"]\`).forEach(btn => {
              btn.style.borderColor = '#ddd';
              btn.style.background = 'white';
            });
            this.style.borderColor = '#000';
            this.style.background = '#f8f8f8';

            currentSelection[section.displayKey] = item;
            updatePreview();
          });

          optionsGrid.appendChild(option);
        });

        container.appendChild(sectionDiv);
      }
    });
  }

  function updatePreview() {
    const textInput = document.getElementById('custom-text-input');
    const previewText = document.getElementById('preview-text');
    const previewDetails = document.getElementById('preview-details');

    currentSelection.customText = textInput ? textInput.value : '';

    if (previewText) {
      previewText.textContent = currentSelection.customText || 'Your Text Here';

      if (currentSelection.font) {
        previewText.style.fontFamily = currentSelection.font.fontFamily;
      }
      if (currentSelection.color) {
        previewText.style.color = currentSelection.color.hexValue;
      }
      if (currentSelection.backboardColor) {
        previewText.parentElement.style.background = currentSelection.backboardColor.hexValue;
      }
    }

    if (previewDetails) {
      const details = [];
      if (currentSelection.size) details.push(\`Size: \${currentSelection.size.name}\`);
      if (currentSelection.usageType) details.push(\`Usage: \${currentSelection.usageType.name}\`);
      if (currentSelection.acrylicShape) details.push(\`Shape: \${currentSelection.acrylicShape.name}\`);
      if (currentSelection.hangingOption) details.push(\`Hanging: \${currentSelection.hangingOption.name}\`);

      previewDetails.textContent = details.join(' • ');
    }
  }

  function calculateTotalPrice() {
    let total = 0;
    Object.values(currentSelection).forEach(item => {
      if (item && item.priceModifier) {
        total += parseFloat(item.priceModifier);
      }
    });
    return total;
  }

  function addToCart() {
    if (!currentSelection.customText) {
      alert('Please enter your custom text');
      return;
    }

    const customization = {
      text: currentSelection.customText,
      font: currentSelection.font?.name,
      color: currentSelection.color?.name,
      size: currentSelection.size?.name,
      usageType: currentSelection.usageType?.name,
      acrylicShape: currentSelection.acrylicShape?.name,
      backboardColor: currentSelection.backboardColor?.name,
      hangingOption: currentSelection.hangingOption?.name,
      totalPrice: calculateTotalPrice()
    };

    console.log('Adding to cart:', customization);

    window.dispatchEvent(new CustomEvent('signageCustomized', {
      detail: customization
    }));

    alert('Customization saved! Total additional cost: $' + customization.totalPrice.toFixed(2));
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
        customText: ''
      };
      updatePreview();
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
