// api/proxy.js
const https = require('https');
const http = require('http');
const { URL } = require('url');

module.exports = async (req, res) => {
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

  try {
    const parsedUrl = new URL(targetUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    // Extract channel info from URL for logging
    const channelMatch = targetUrl.match(/channel=([^&]+)/);
    const channelName = channelMatch ? channelMatch[1] : 'unknown';
    
    console.log(`Proxying request for channel: ${channelName}`);
    
    // Set up request options
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: req.method,
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
      }
    };
    
    // Handle special headers for specific channels
    if (targetUrl.includes('riahd') || targetUrl.includes('primafhd')) {
      options.headers['User-Agent'] = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36';
    }
    
    // Handle range requests for video streaming
    if (req.headers.range) {
      options.headers['Range'] = req.headers.range;
    }
    
    // Create the proxy request
    const proxyReq = httpModule.request(options, (proxyRes) => {
      // Forward status code and headers
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      
      // Pipe the response data
      proxyRes.pipe(res);
      
      console.log(`Response status: ${proxyRes.statusCode} for channel: ${channelName}`);
    });
    
    // Handle errors
    proxyReq.on('error', (err) => {
      console.error(`Proxy error for channel ${channelName}:`, err);
      
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Proxy error',
          message: err.message,
          channel: channelName
        });
      }
    });
    
    // End the request
    proxyReq.end();
    
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
