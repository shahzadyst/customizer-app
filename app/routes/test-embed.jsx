export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const host = url.host;
  const protocol = url.protocol;
  console.log('ASDFASDFSDAFSADF');
  const testShop = "customizer-app-store-2.myshopify.com";
  const embedUrl = `${protocol}//${host}/embed/${testShop}`;
  const apiUrl = `${protocol}//${host}/api/config/${testShop}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Embed Script Tester</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f6f6f7;
    }
    .card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    h1 { color: #202223; margin-top: 0; }
    h2 { color: #202223; font-size: 18px; margin-top: 0; }
    .url-box {
      background: #f6f6f7;
      padding: 16px;
      border-radius: 4px;
      font-family: 'Monaco', monospace;
      font-size: 14px;
      word-break: break-all;
      margin: 12px 0;
    }
    .status {
      padding: 8px 12px;
      border-radius: 4px;
      display: inline-block;
      font-size: 14px;
      font-weight: 500;
      margin-top: 8px;
    }
    .success { background: #d1f7e5; color: #006644; }
    .error { background: #ffd6d6; color: #c41e3a; }
    .warning { background: #fff4d6; color: #916a00; }
    button {
      background: #008060;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      margin-top: 8px;
    }
    button:hover {
      background: #006e52;
    }
    #test-button {
      margin: 20px 0;
      padding: 16px 32px;
      font-size: 16px;
    }
  </style>
</head>
<body>
  <h1>🔧 Embed Script Tester</h1>

  <div class="card">
    <h2>Environment Information</h2>
    <p><strong>Current Host:</strong></p>
    <div class="url-box">${protocol}//${host}</div>

    <p><strong>Test Shop:</strong></p>
    <div class="url-box">${testShop}</div>
  </div>

  <div class="card">
    <h2>Embed Script URL</h2>
    <p>This is the URL that should be used in your theme:</p>
    <div class="url-box">${embedUrl}</div>

    <p><strong>Status:</strong> <span id="embed-status" class="status warning">Testing...</span></p>

    <button onclick="window.open('${embedUrl}', '_blank')">
      Open Embed Script in New Tab
    </button>
  </div>

  <div class="card">
    <h2>API Configuration URL</h2>
    <p>This is the API endpoint the embed script calls:</p>
    <div class="url-box">${apiUrl}</div>

    <p><strong>Status:</strong> <span id="api-status" class="status warning">Testing...</span></p>

    <button onclick="window.open('${apiUrl}', '_blank')">
      Open API Config in New Tab
    </button>
  </div>

  <div class="card">
    <h2>Test Customizer</h2>
    <p>Click the button below to test the customizer:</p>

    <button id="test-button" class="signage-customizer-btn">
      🎨 Open Customizer
    </button>

    <div id="result" style="margin-top: 20px;"></div>
  </div>

  <div class="card">
    <h2>Script Tag for Theme</h2>
    <p>Copy this script tag and add it to your theme.liquid file before &lt;/body&gt;:</p>
    <div class="url-box">&lt;script src="${embedUrl}" defer&gt;&lt;/script&gt;</div>
  </div>

  <script src="${embedUrl}"></script>

  <script>
    async function testEmbed() {
      try {
        const response = await fetch('${embedUrl}');
        const statusEl = document.getElementById('embed-status');

        if (response.ok) {
          const text = await response.text();
          if (text.includes('function') && text.includes('signage-customizer')) {
            statusEl.textContent = 'Working ✓';
            statusEl.className = 'status success';
          } else {
            statusEl.textContent = 'Invalid response';
            statusEl.className = 'status error';
          }
        } else {
          statusEl.textContent = 'Error: ' + response.status;
          statusEl.className = 'status error';
        }
      } catch (err) {
        document.getElementById('embed-status').textContent = 'Failed: ' + err.message;
        document.getElementById('embed-status').className = 'status error';
      }
    }

    async function testAPI() {
      try {
        const response = await fetch('${apiUrl}');
        const statusEl = document.getElementById('api-status');

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            statusEl.textContent = 'Working ✓';
            statusEl.className = 'status success';
          } else {
            statusEl.textContent = 'No config found';
            statusEl.className = 'status warning';
          }
        } else {
          statusEl.textContent = 'Error: ' + response.status;
          statusEl.className = 'status error';
        }
      } catch (err) {
        document.getElementById('api-status').textContent = 'Failed: ' + err.message;
        document.getElementById('api-status').className = 'status error';
      }
    }

    testEmbed();
    testAPI();

    window.addEventListener('signageCustomized', function(e) {
      const resultEl = document.getElementById('result');
      resultEl.innerHTML = '<div class="status success" style="display: block; margin-top: 12px;"><strong>Customization saved!</strong><br><br>' + JSON.stringify(e.detail, null, 2).replace(/\\n/g, '<br>').replace(/ /g, '&nbsp;') + '</div>';
    });
  </script>
</body>
</html>
  `;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
};

export default function TestEmbed() {
  return null;
}
