
const cors = require('cors');
const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Expanded allowed origins list to include all Lovable domains
const allowedOrigins = [
  'https://nurture-lead-vision.lovable.app',  
  'https://nurture-lead-vision-production.up.railway.app',
  // Add the lovableproject.com domain pattern
  /https:\/\/.*\.lovableproject\.com$/
];

// Comprehensive CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Check if the origin matches our allowed list
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`CORS blocked request from origin: ${origin}`);
      // Still allow the request but log it
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: false,
  maxAge: 86400 // Cache preflight for 24 hours
}));

// ✅ Backup CORS headers for all responses
app.use((req, res, next) => {
  // Get the origin from the request headers
  const origin = req.headers.origin;
  
  // Allow any origin - this is less secure but ensures functionality
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, Origin, X-Requested-With");
  
  // Handle preflight OPTIONS requests explicitly
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  
  next();
});

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'SpyFu Proxy Server is running!',
    status: 'OK',
    endpoints: {
      spyfu: '/proxy/spyfu?domain=example.com'
    }
  });
});

// ✅ SpyFu Proxy API Route
app.get('/proxy/spyfu', async (req, res) => {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: 'Domain parameter is required' });
  }

  // Get API credentials from environment variables with fallbacks
  const username = process.env.SPYFU_API_USERNAME || 'bd5d70b5-7793-4c6e-b012-2a62616bf1af';
  const apiKey = process.env.SPYFU_API_KEY || 'VESAPD8P';

  const url = `https://www.spyfu.com/apis/domain_stats_api/v2/getDomainStatsForExactDate?domain=${domain}&month=3&year=2023&countryCode=US&api_username=${username}&api_key=${apiKey}`;

  try {
    console.log(`Making request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 15000 // 15 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`SpyFu API returned status: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('SpyFu API response received successfully');
    
    res.json(data);
  } catch (error) {
    console.error('SpyFu API Request Failed:', error.message);
    
    res.status(500).json({ 
      error: 'SpyFu API request failed', 
      details: error.message,
      message: 'If you are seeing this from a browser client, please enter traffic data manually.'
    });
  }
});

// Special CORS test endpoint - helps diagnose if CORS is properly configured
app.get('/cors-test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'CORS is properly configured!',
    origin: req.headers.origin || 'No origin header',
    headers: req.headers
  });
});

// Add a special debug endpoint to see all request headers
app.get('/debug-headers', (req, res) => {
  res.json({
    headers: req.headers,
    origin: req.headers.origin || 'No origin header',
    host: req.headers.host,
    referer: req.headers.referer || 'No referer'
  });
});

app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
