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

  let config = null;
  let currentSelection = {
    font: null,
    color: '#ff1493',
    customText: 'Your Text',
    glowEnabled: true
  };

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
      <div style="display:flex; min-height:100vh;">
        <!-- Left Preview -->
        <div style="flex:1; position:relative; display:flex; align-items:center; justify-content:center; background:#0a0a0a;">
          <div id="glow-toggle" style="position:absolute; top:20px; left:20px; display:flex; gap:6px; align-items:center; cursor:pointer; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:6px 12px;">
            <input type="checkbox" id="glow-checkbox" checked style="cursor:pointer;">
            <label for="glow-checkbox" style="cursor:pointer;">Glow</label>
          </div>

          <div style="text-align:center;">
            <div id="preview-text" style="
              font-size:80px;
              font-weight:bold;
              color:\${currentSelection.color};
              font-family:'Dancing Script', cursive;
              text-shadow:0 0 20px \${currentSelection.color}, 0 0 40px \${currentSelection.color};
              transition:all .3s ease;
            ">
              \${currentSelection.customText}
            </div>
            <p style="color:rgba(255,255,255,0.6); font-size:12px; margin-top:6px;">Colours may appear different in real life</p>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div style="width:400px; background:#111; padding:30px; display:flex; flex-direction:column; gap:20px;">
          <h2 style="font-size:22px; font-weight:600;">Unleash Your Creativity</h2>

          <div>
            <label style="font-size:14px; font-weight:500;">Enter Your Text</label>
            <input id="custom-text-input" type="text" placeholder="Your Text" style="width:100%; margin-top:6px; padding:10px; border-radius:8px; border:none; background:#1e1e1e; color:white; font-size:16px;">
          </div>

          <div>
            <label style="font-size:14px; font-weight:500;">Choose a font</label>
            <div id="font-list" style="display:grid; grid-template-columns:repeat(2,1fr); gap:8px; margin-top:8px;"></div>
          </div>

          <div>
            <label style="font-size:14px; font-weight:500;">Choose a color</label>
            <input id="color-picker" type="color" value="\${currentSelection.color}" style="width:100%; height:40px; margin-top:8px; background:none; border:none; cursor:pointer;">
          </div>

          <div>
            <button id="buy-now-btn" style="width:100%; padding:14px; background:#0066cc; border:none; border-radius:8px; color:white; font-size:16px; font-weight:600; cursor:pointer;">Buy Now</button>
            <div id="total-price" style="margin-top:10px; font-weight:bold;">Rs 0.00</div>
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
  }

  function setupInteractions() {
    const input = document.getElementById('custom-text-input');
    const preview = document.getElementById('preview-text');
    const colorPicker = document.getElementById('color-picker');
    const glowCheckbox = document.getElementById('glow-checkbox');

    input.addEventListener('input', () => {
      currentSelection.customText = input.value || 'Your Text';
      preview.textContent = currentSelection.customText;
      calculatePrice();
    });

    colorPicker.addEventListener('input', e => {
      currentSelection.color = e.target.value;
      updateGlow();
    });

    glowCheckbox.addEventListener('change', e => {
      currentSelection.glowEnabled = e.target.checked;
      updateGlow();
    });

    document.getElementById('buy-now-btn').addEventListener('click', addToCart);
  }

  function updateGlow() {
    const preview = document.getElementById('preview-text');
    preview.style.color = currentSelection.color;
    preview.style.textShadow = currentSelection.glowEnabled
      ? \`0 0 20px \${currentSelection.color}, 0 0 40px \${currentSelection.color}\`
      : 'none';
  }

  function renderFonts() {
    const fonts = (config?.fonts || [
      { name: 'Barcelona', fontFamily: 'Dancing Script' },
      { name: 'Brave', fontFamily: 'Lobster' },
      { name: 'Rocket', fontFamily: 'Pacifico' },
      { name: 'Vintage', fontFamily: 'Playfair Display' }
    ]);

    const list = document.getElementById('font-list');
    fonts.forEach(f => {
      const div = document.createElement('div');
      div.style.cssText = \`
        padding:10px;
        text-align:center;
        border:1px solid rgba(255,255,255,0.2);
        border-radius:8px;
        cursor:pointer;
        font-family:'\${f.fontFamily}', cursive;
      \`;
      div.textContent = f.name;
      div.addEventListener('click', () => {
        document.querySelectorAll('#font-list div').forEach(el => el.style.borderColor='rgba(255,255,255,0.2)');
        div.style.borderColor = '#fff';
        currentSelection.font = f;
        document.getElementById('preview-text').style.fontFamily = f.fontFamily + ', cursive';
        calculatePrice();
      });
      list.appendChild(div);
    });
  }

  function calculatePrice() {
    const length = currentSelection.customText.length;
    let basePrice = 1000;
    let perLetter = 50;
    let total = basePrice + length * perLetter;
    updatePrice(total);
  }

  function updatePrice(price) {
    const el = document.getElementById('total-price');
    if (el) el.textContent = 'Rs ' + price.toFixed(2);
  }

  function addToCart() {
    if (!currentSelection.customText) return alert('Please enter your text');
    alert('Added to cart! Total: ' + document.getElementById('total-price').textContent);
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
