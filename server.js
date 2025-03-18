
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Enable CORS with a comprehensive configuration
// This middleware applies to all routes
app.use(cors({
  origin: '*', // Allow all origins - critical for public API
  methods: ['GET', 'HEAD', 'OPTIONS'], // Allow common HTTP methods
  allowedHeaders: ['Content-Type', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  credentials: false, // Don't send cookies
  maxAge: 86400, // Cache preflight requests for 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204 // Standard OPTIONS success response
}));

// 2. Add a specific OPTIONS handler for preflight requests
app.options('*', (req, res) => {
  res.status(204).send();
});

app.use(express.json());

// ✅ Root route to confirm server is running
app.get('/', (req, res) => {
  // Set CORS headers for the root endpoint
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin, X-Requested-With');
  
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
    // Set CORS headers even for error responses
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin, X-Requested-With');
    
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
    
    // Set CORS headers explicitly in the response - belt and suspenders approach
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin, X-Requested-With');
    
    res.json(data);
  } catch (error) {
    console.error('SpyFu API Request Failed:', error.message);
    
    // Set CORS headers even for error responses
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin, X-Requested-With');
    
    res.status(500).json({ 
      error: 'SpyFu API request failed', 
      details: error.message,
      message: 'If you are seeing this from a browser client, please enter traffic data manually.'
    });
  }
});

// Special CORS test endpoint - helps diagnose if CORS is properly configured
app.get('/cors-test', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin, X-Requested-With');
  
  res.json({ 
    success: true, 
    message: 'CORS is properly configured!',
    origin: req.headers.origin || 'No origin header',
    headers: req.headers
  });
});

app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
