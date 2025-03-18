
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend access
app.use(cors({
  origin: '*', // Allows requests from anywhere (adjust as needed)
  methods: 'GET'
}));

app.use(express.json());

// ✅ Root route to confirm server is running
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

  const username = process.env.SPYFU_API_USERNAME;
  const apiKey = process.env.SPYFU_API_KEY;

  const url = `https://www.spyfu.com/apis/domain_stats_api/v2/getDomainStatsForExactDate?domain=${domain}&month=3&year=2023&countryCode=US&api_username=${username}&api_key=${apiKey}`;

  try {
    console.log(`Making request to: ${url}`);
    const response = await fetch(url);
    const data = await response.json();
    console.log('SpyFu API response received');
    res.json(data);
  } catch (error) {
    console.error('SpyFu API Request Failed:', error.message);
    res.status(500).json({ error: 'SpyFu API request failed', details: error.message });
  }
});

app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
