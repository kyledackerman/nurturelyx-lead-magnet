
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Add error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('CRITICAL ERROR - UNCAUGHT EXCEPTION:', error);
  // We'll log but not exit the process as Railway will restart it
});

// Add error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL ERROR - UNHANDLED REJECTION:', reason);
});

// Extremely permissive CORS configuration - Accept ALL origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: '*',
  credentials: false
}));

// Ensure CORS headers on every response
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

// Middleware to parse JSON requests
app.use(express.json());

// Root Route (Confirms API is Running)
app.get("/api", (req, res) => {
  try {
    console.log("API root endpoint called");
    res.json({ 
      message: "SpyFu Proxy Server is running!", 
      status: "OK",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error in /api route:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Health check route
app.get("/health", (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    console.log("Health check called");
    
    res.json({
      status: "healthy",
      serverTime: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`
      },
      spyfuCredentials: {
        hasApiUsername: !!process.env.SPYFU_API_USERNAME,
        hasApiKey: !!process.env.SPYFU_API_KEY,
        // Fallback credentials available
        usingFallbacks: true
      }
    });
  } catch (error) {
    console.error("Error in /health route:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// SpyFu Proxy API Route
app.get("/proxy/spyfu", async (req, res) => {
  console.log("SpyFu proxy endpoint called");
  try {
    const { domain } = req.query;

    if (!domain) {
      return res.status(400).json({ error: "Domain parameter is required" });
    }

    // Use environment variables for SpyFu API credentials with fallbacks
    const username = process.env.SPYFU_API_USERNAME || 'bd5d70b5-7793-4c6e-b012-2a62616bf1af';
    const apiKey = process.env.SPYFU_API_KEY || 'VESAPD8P';

    if (!username || !apiKey) {
      console.error("SpyFu API credentials are missing");
      return res.status(500).json({ error: "SpyFu API credentials are missing" });
    }

    const url = `https://www.spyfu.com/apis/domain_stats_api/v2/getDomainStatsForExactDate?domain=${domain}&month=3&year=2023&countryCode=US&api_username=${username}&api_key=${apiKey}`;

    console.log(`Fetching SpyFu API: ${url}`);
    const response = await fetch(url, {
      timeout: 15000, // 15 second timeout
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; RailwayApp/1.0)'
      }
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
    console.log("SpyFu API call successful");
    res.json(data);
  } catch (error) {
    console.error("SpyFu API Fetch Error:", error.message);
    res.status(500).json({
      error: "SpyFu API request failed",
      details: error.message || 'Unknown error occurred'
    });
  }
});

// Debug Route to Check CORS
app.get("/debug-headers", (req, res) => {
  try {
    console.log("Debug headers endpoint called");
    res.json({
      headers: req.headers,
      message: "CORS Debugging - Headers Confirmed"
    });
  } catch (error) {
    console.error("Error in /debug-headers route:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist'), {
  fallthrough: true,
  index: 'index.html'
}));

// Any routes not matched by API endpoints should serve the index.html
app.get('*', (req, res) => {
  try {
    console.log(`Serving frontend for path: ${req.path}`);
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } catch (error) {
    console.error("Error serving index.html:", error);
    res.status(500).send("Error serving application. Please try again later.");
  }
});

// Start Server with better error handling
const server = app.listen(PORT, () => {
  console.log(`
🚀 Server running on port ${PORT}
📁 Serving static files from: ${path.join(__dirname, 'dist')}
🔌 API endpoints:
   - /api (Server status)
   - /health (Health check)
   - /proxy/spyfu (SpyFu proxy)
   - /debug-headers (CORS debugging)
  `);
}).on('error', (error) => {
  console.error('SERVER START ERROR:', error);
});

// Handle server shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
