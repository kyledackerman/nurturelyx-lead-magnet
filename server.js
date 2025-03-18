const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ SUPER PERMISSIVE CORS configuration - Accept ALL origins with ALL methods
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  credentials: false,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// ✅ Ensure CORS headers on EVERY Response
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(204).send();
  }
  
  next();
});

// ✅ Middleware to parse JSON requests
app.use(express.json());

// ✅ Root Route (Confirms API is Running) - Keep this super simple
app.get("/api", (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ 
    message: "SpyFu Proxy Server is running!", 
    status: "OK"
  });
});

// ✅ SpyFu Proxy API Route
app.get("/proxy/spyfu", async (req, res) => {
  // Ensure CORS headers for this specific route
  res.header('Access-Control-Allow-Origin', '*');
  
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: "Domain parameter is required" });
  }

  // ✅ Use environment variables for SpyFu API credentials
  const username = process.env.SPYFU_API_USERNAME || 'bd5d70b5-7793-4c6e-b012-2a62616bf1af';
  const apiKey = process.env.SPYFU_API_KEY || 'VESAPD8P';

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
  res.header('Access-Control-Allow-Origin', '*');
  res.json({
    headers: req.headers,
    message: "CORS Debugging - Headers Confirmed.",
  });
});

// ✅ Health Check Route
app.get("/health", (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  
  const credentials = {
    hasApiUsername: !!process.env.SPYFU_API_USERNAME,
    hasApiKey: !!process.env.SPYFU_API_KEY,
    fallbackUsername: 'bd5d70b5-7793-4c6e-b012-2a62616bf1af',
    fallbackKeyAvailable: true
  };
  
  res.json({
    status: "healthy",
    serverTime: new Date().toISOString(),
    credentials
  });
});

// Serve static files from the 'dist' directory (Vite build output)
app.use(express.static(path.join(__dirname, 'dist')));

// Any routes not matched by API endpoints should serve the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ✅ Start Server
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}, serving both API and frontend`)
);
