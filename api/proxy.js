// api/proxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, User-Agent, Range');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Get the target URL from query parameters
  const targetUrl = req.query.url;
  
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing URL parameter' });
  }

  // Extract channel info from URL for logging
  const channelMatch = targetUrl.match(/channel=([^&]+)/);
  const channelName = channelMatch ? channelMatch[1] : 'unknown';
  
  console.log(`Proxying request for channel: ${channelName}`);
  console.log(`Target URL: ${targetUrl}`);

  // Determine if this is a license request
  const isLicenseRequest = targetUrl.includes('license') || targetUrl.includes('key') || req.query.license;

  // Create proxy configuration
  const proxyConfig = {
    target: targetUrl,
    changeOrigin: true,
    followRedirects: true,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Referer': 'https://get.perfecttv.net/',
      'Origin': 'https://get.perfecttv.net',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'cross-site'
    },
    onProxyReq: (proxyReq, req, res) => {
      // Add custom headers for specific channels
      if (targetUrl.includes('riahd') || targetUrl.includes('primafhd')) {
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36');
      }
      
      // Handle range requests for video streaming
      if (req.headers.range) {
        proxyReq.setHeader('Range', req.headers.range);
      }
      
      // Add authentication if present in original URL
      if (targetUrl.includes('username=')) {
        const urlObj = new URL(targetUrl);
        const username = urlObj.searchParams.get('username');
        const password = urlObj.searchParams.get('password');
        
        if (username && password) {
          // Some services might require basic auth
          const auth = Buffer.from(`${username}:${password}`).toString('base64');
          proxyReq.setHeader('Authorization', `Basic ${auth}`);
        }
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      // Add CORS headers to the response
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, User-Agent, Range');
      
      // Handle different content types
      const contentType = proxyRes.headers['content-type'];
      
      if (contentType) {
        // Ensure proper content type for streams
        if (targetUrl.includes('.m3u8') || targetUrl.includes('playlist')) {
          res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        } else if (targetUrl.includes('.mpd')) {
          res.setHeader('Content-Type', 'application/dash+xml');
        } else if (targetUrl.includes('.ts')) {
          res.setHeader('Content-Type', 'video/MP2T');
        } else if (targetUrl.includes('license') || isLicenseRequest) {
          res.setHeader('Content-Type', 'application/octet-stream');
        }
      }
      
      // Pass through important headers
      if (proxyRes.headers['content-length']) {
        res.setHeader('Content-Length', proxyRes.headers['content-length']);
      }
      if (proxyRes.headers['content-range']) {
        res.setHeader('Content-Range', proxyRes.headers['content-range']);
      }
      if (proxyRes.headers['accept-ranges']) {
        res.setHeader('Accept-Ranges', proxyRes.headers['accept-ranges']);
      }
      
      console.log(`Response status: ${proxyRes.statusCode} for channel: ${channelName}`);
    },
    onError: (err, req, res) => {
      console.error(`Proxy error for channel ${channelName}:`, err);
      
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Proxy error',
          message: err.message,
          channel: channelName
        });
      }
    }
  };

  // Special handling for DRM license requests
  if (isLicenseRequest) {
    // For Widevine licenses
    if (targetUrl.includes('widevine') || targetUrl.includes('hypp.tv')) {
      proxyConfig.headers['Content-Type'] = 'application/octet-stream';
      proxyConfig.headers['dt-custom-data'] = req.headers['dt-custom-data'] || '';
    }
    
    // For ClearKey licenses
    if (targetUrl.includes('clearkey')) {
      // Extract key ID and key from URL if present
      const keyMatch = targetUrl.match(/license_key=([^:]+):([^&]+)/);
      if (keyMatch) {
        const [, keyId, key] = keyMatch;
        return res.status(200).json({
          keys: [{
            kty: 'oct',
            kid: keyId,
            k: key
          }]
        });
      }
    }
  }

  // Create and use the proxy
  const proxy = createProxyMiddleware(proxyConfig);
  
  // Apply the proxy to the request
  proxy(req, res);
};
