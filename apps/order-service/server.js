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
  res.send("Order Service is running");
});

// ==============================
// START SERVER
// ==============================
app.listen(5000, () => {
  console.log("Order Service running on port 5000");
});
