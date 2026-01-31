require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

// ✅ ADD THIS
const client = require("prom-client");

const app = express();
app.use(express.json());

// ==============================
// PROMETHEUS METRICS SETUP
// ==============================
const register = new client.Registry();

// collect default Node.js metrics
client.collectDefaultMetrics({
  register,
});

// expose metrics endpoint
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// ==============================
// CONNECT MONGODB
// ==============================
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// ==============================
// HEALTH ENDPOINT
// ==============================
app.get("/health", (req, res) => {
  res.send("User Service is running");
});

// ==============================
// START SERVER
// ==============================
app.listen(4000, () => {
  console.log("User Service running on port 4000");
});
