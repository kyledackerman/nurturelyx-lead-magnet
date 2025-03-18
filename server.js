
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Allow All Origins, But Log Them for Debugging
const allowedOrigins = [
  "https://nurture-lead-vision.lovable.app",
  "https://nurture-lead-vision-production.up.railway.app",
];

// ✅ CORS Middleware - Allow Specific Domains
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ CORS blocked request from: ${origin}`);
        callback(new Error("CORS Not Allowed"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Ensure CORS Headers on Every Response
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// ✅ Root Route (Confirms API is Running) - MOVED UP in the order
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

  const username = process.env.SPYFU_API_USERNAME;
  const apiKey = process.env.SPYFU_API_KEY;

  const url = `https://www.spyfu.com/apis/domain_stats_api/v2/getDomainStatsForExactDate?domain=${domain}&month=3&year=2023&countryCode=US&api_username=${username}&api_key=${apiKey}`;

  try {
    console.log(`Making request to: ${url}`);
    const response = await fetch(url);
    const data = await response.json();

    // ✅ Apply CORS Headers on API Response
    res.header("Access-Control-Allow-Origin", "*");
    res.json(data);
  } catch (error) {
    console.error("SpyFu API Request Failed:", error.message);
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

// ✅ Catch-All Route for Undefined Endpoints - This should always be LAST
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// ✅ Start Server
app.listen(PORT, () =>
  console.log(`🚀 Proxy server running on port ${PORT}`)
);
