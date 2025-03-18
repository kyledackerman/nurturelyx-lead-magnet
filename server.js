
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Trust Railway proxy
app.set('trust proxy', 1);

// ✅ Allow CORS for All Domains (Fixes API Connectivity Issues)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Handle OPTIONS Preflight Requests
app.options('*', (req, res) => {
  res.status(200).end();
});

// ✅ Root Route (Confirms API is Running)
app.get('/', (req, res) => {
  res.json({ 
    message: 'SpyFu Proxy Server is running!', 
    status: 'OK',
    endpoints: {
      spyfu: '/proxy/spyfu?domain=example.com',
      debug: '/debug-headers'
    }
  });
});

// ✅ SpyFu API Proxy Route (THIS IS THE MISSING PIECE!)
app.get('/proxy/spyfu', async (req, res) => {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: 'Domain parameter is required' });
  }

  const username = process.env.SPYFU_API_USERNAME;
  const apiKey = process.env.SPYFU_API_KEY;
  
  const url = `https://www.spyfu.com/apis/domain_stats_api/v2/getDomainStatsForExactDate?domain=${domain}&month=3&year=2023&countryCode=US&api_username=${username}&api_key=${apiKey}`;

  try {
    console.log(`Making request to: ${url}`);
    const response = await fetch(url);
    const data = await response.json();

    // ✅ Ensure CORS is Applied on API Response
    res.header("Access-Control-Allow-Origin", "*");
    res.json(data);
  } catch (error) {
    console.error('SpyFu API Request Failed:', error.message);
    res.status(500).json({ error: 'SpyFu API request failed', details: error.message });
  }
});

// ✅ Catch-All Route for Undefined Endpoints
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// ✅ Start Server
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
