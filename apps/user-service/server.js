require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");


const app = express();
app.use(express.json());

// connect MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// health endpoint
app.get("/health", (req, res) => {
  res.send("User Service is running");
});

app.listen(4000, () => {
  console.log("User Service running on port 4000");
});
