require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const client = require("prom-client");
const logger = require("./logger");
const morgan = require("morgan");
const { child } = require("winston");

const app = express();
app.use(express.json());

/* ---------------- PROMETHEUS SETUP ---------------- */

const register = new client.Registry();

client.collectDefaultMetrics({
  register
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

/* ---------------- REQUEST LOGGING WITH MORGAN (Console Only) ---------------- */

// Morgan format: method url status response-time
app.use(morgan(':method :url :status :response-time ms'));

/* ---------------- MONGODB CONNECTION ---------------- */

mongoose.connect(process.env.MONGO_URL)
  .then(() => logger.info("MongoDB connected successfully"))
  .catch(err => logger.error("MongoDB connection failed", { error: err.message }));

/* ---------------- USER MODEL ---------------- */

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

/* ---------------- ROUTES ---------------- */

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '3.0',
    service: 'user-service',
    timestamp: new Date().toISOString()
  });
});

// CREATE User
app.post("/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.create({ name, email });
    logger.info("User created", { userId: user._id, email: user.email });
    res.status(201).json(user);
  } catch (error) {
    logger.error("Failed to create user", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// GET All Users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    logger.info("Retrieved all users", { count: users.length });
    res.json(users);
  } catch (error) {
    logger.error("Failed to retrieve users", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// GET User by ID
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      logger.warn("User not found", { userId: req.params.id });
      return res.status(404).json({ error: "User not found" });
    }
    logger.info("Retrieved user", { userId: user._id });
    res.json(user);
  } catch (error) {
    logger.error("Failed to retrieve user", { userId: req.params.id, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// UPDATE User
app.put("/users/:id", async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email },
      { new: true, runValidators: true }
    );
    if (!user) {
      logger.warn("User not found for update", { userId: req.params.id });
      return res.status(404).json({ error: "User not found" });
    }
    logger.info("User updated", { userId: user._id });
    res.json(user);
  } catch (error) {
    logger.error("Failed to update user", { userId: req.params.id, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// DELETE User
app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      logger.warn("User not found for deletion", { userId: req.params.id });
      return res.status(404).json({ error: "User not found" });
    }
    logger.info("User deleted", { userId: req.params.id });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    logger.error("Failed to delete user", { userId: req.params.id, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`User Service started`, { port: PORT });
});
