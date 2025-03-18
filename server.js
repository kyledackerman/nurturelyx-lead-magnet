
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ CORS configuration - Allow all origins but with proper headers
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// ✅ Ensure CORS headers on Every Response
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// ✅ Middleware to parse JSON requests
app.use(express.json());

// ✅ Root Route (Confirms API is Running)
app.get("/", (req, res) => {
  res.json({ 
    message: "SpyFu Proxy Server is running!", 
    status: "OK",
    endpoints: {
      spyfu: "/proxy/spyfu?domain=example.com",
      debug: "/debug-headers"
    }
  });
});

// ✅ SpyFu Proxy API Route
app.get("/proxy/spyfu", async (req, res) => {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: "Domain parameter is required" });
  }

  // ✅ Use environment variables for SpyFu API credentials
  const username = process.env.SPYFU_API_USERNAME;
  const apiKey = process.env.SPYFU_API_KEY;

  if (!username || !apiKey) {
    console.error("SpyFu API credentials are missing");
    return res.status(500).json({ error: "SpyFu API credentials are missing" });
  }

  const url = `https://www.spyfu.com/apis/domain_stats_api/v2/getDomainStatsForExactDate?domain=${domain}&month=3&year=2023&countryCode=US&api_username=${username}&api_key=${apiKey}`;

  try {
    console.log(`Fetching SpyFu API: ${url}`);
    const response = await fetch(url, {
      timeout: 10000, // 10 second timeout
    });
    
    if (!response.ok) {
      console.error(`SpyFu API Error: ${response.status} - ${response.statusText}`);
      return res.status(response.status).json({ 
        error: "SpyFu API request failed", 
        status: response.status,
        statusText: response.statusText
      });
    }

    const data = await response.json();

    // ✅ Apply CORS Headers on API Response
    res.header("Access-Control-Allow-Origin", "*");
    res.json(data);
  } catch (error) {
    console.error("SpyFu API Fetch Error:", error.message);
    res.status(500).json({
      error: "SpyFu API request failed",
      details: error.message,
    });
  }
});

// ✅ Debug Route to Check CORS
app.get("/debug-headers", (req, res) => {
  res.json({
    headers: req.headers,
    message: "CORS Debugging - Headers Confirmed.",
  });
});

// ✅ Health Check Route
app.get("/health", (req, res) => {
  const credentials = {
    hasApiUsername: !!process.env.SPYFU_API_USERNAME,
    hasApiKey: !!process.env.SPYFU_API_KEY
  };
  
  res.json({
    status: "healthy",
    serverTime: new Date().toISOString(),
    credentials
  });
});

// ✅ Catch-All Route for Undefined Endpoints
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// ✅ Start Server
app.listen(PORT, () =>
  console.log(`🚀 Proxy server running on port ${PORT}`)
);
