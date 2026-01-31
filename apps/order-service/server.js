require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const client = require("prom-client");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

/* ---------------- PROMETHEUS SETUP ---------------- */

const register = new client.Registry();

client.collectDefaultMetrics({
  register
});

/* ---------------- DATABASE CONNECTION ---------------- */

prisma.$connect()
  .then(() => console.log("PostgreSQL connected via Prisma"))
  .catch(err => console.log("Database connection error:", err));

/* ---------------- ROUTES ---------------- */

app.get("/health", (req, res) => {
  res.send("Order Service is running");
});

app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// CREATE Order
app.post("/orders", async (req, res) => {
  try {
    const { userId, product, quantity, price } = req.body;
    const order = await prisma.order.create({
      data: {
        userId,
        product,
        quantity,
        price
      }
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET All Orders
app.get("/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Order by ID
app.get("/orders/:id", async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE Order
app.put("/orders/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status }
    });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE Order
app.delete("/orders/:id", async (req, res) => {
  try {
    await prisma.order.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ---------------- SERVER ---------------- */

app.listen(5000, () => {
  console.log("Order Service running on port 5000");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
