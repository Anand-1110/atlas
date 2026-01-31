require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const client = require("prom-client");

const app = express();
app.use(express.json());

/* ---------------- PROMETHEUS SETUP ---------------- */

const register = new client.Registry();

client.collectDefaultMetrics({
  register
});

/* ---------------- MONGODB ---------------- */

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

/* ---------------- ROUTES ---------------- */

app.get("/health", (req, res) => {
  res.send("Order Service is running");
});

app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

/* ---------------- SERVER ---------------- */

app.listen(5000, () => {
  console.log("Order Service running on port 5000");
});
