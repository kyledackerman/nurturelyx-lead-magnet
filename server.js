
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Ensure Railway Uses the Correct Proxy Setup
app.set('trust proxy', 1);

// ✅ CORS Configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Handle CORS Preflight Requests
app.options('*', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(200).end();
});

// ✅ Debugging Route to Verify API is Running
app.get('/debug-headers', (req, res) => {
  res.json({
    headers: req.headers,
    message: "CORS Debugging - Headers Confirmed."
  });
});

// ✅ Main Route for API Status
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

// ✅ SpyFu Proxy Route (Ensure This Exists)
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
    res.json(data);
  } catch (error) {
    console.error('SpyFu API Request Failed:', error.message);
    res.status(500).json({ error: 'SpyFu API request failed', details: error.message });
  }
});

// ✅ Handle Undefined Routes (Fixes "Page Not Found")
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', message: 'This route does not exist' });
});

// ✅ Ensure the Server Listens on the Correct Port
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
