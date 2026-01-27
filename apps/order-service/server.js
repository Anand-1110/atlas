require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DB_URL
});

app.get("/health", (req, res) => {
  res.send("Order Service is running");
});

app.listen(5000, () => {
  console.log("Order Service running on port 5000");
});
