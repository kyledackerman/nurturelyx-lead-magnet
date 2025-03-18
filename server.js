
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Trust Railway proxy
app.set('trust proxy', 1);

// ✅ Force CORS Headers for Every Response
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// ✅ Explicitly Handle OPTIONS Preflight Requests
app.options('*', (req, res) => {
  res.status(200).end();
});

// ✅ Root Route - Check if Server is Running
app.get('/', (req, res) => {
  res.json({ 
    message: 'SpyFu Proxy Server is running!', 
    status: 'OK' 
  });
});

// ✅ Proxy Route to SpyFu API
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

    // ✅ Enforce CORS on API response
    res.header("Access-Control-Allow-Origin", "*");
    res.json(data);
  } catch (error) {
    console.error('SpyFu API Request Failed:', error.message);
    res.status(500).json({ error: 'SpyFu API request failed', details: error.message });
  }
});

// ✅ 404 Catch-All
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// ✅ Start Server
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
