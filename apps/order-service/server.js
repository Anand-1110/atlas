require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const client = require("prom-client");
const logger = require("./logger");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

/* ---------------- PROMETHEUS SETUP ---------------- */

const register = new client.Registry();

client.collectDefaultMetrics({
  register
});

app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", register.contentType);
  res.end(await register.metrics());
});

/* ---------------- REQUEST LOGGING MIDDLEWARE ---------------- */

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });
  next();
});

/* ---------------- DATABASE CONNECTION ---------------- */

prisma.$connect()
  .then(() => logger.info("PostgreSQL connected via Prisma"))
  .catch(err => logger.error("Database connection error", { error: err.message }));

/* ---------------- ROUTES ---------------- */

app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "order-service" });
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
    logger.info("Order created", { orderId: order.id, userId, product });
    res.status(201).json(order);
  } catch (error) {
    logger.error("Failed to create order", { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// GET All Orders
app.get("/orders", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });
    logger.info("Retrieved all orders", { count: orders.length });
    res.json(orders);
  } catch (error) {
    logger.error("Failed to retrieve orders", { error: error.message });
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
      logger.warn("Order not found", { orderId: req.params.id });
      return res.status(404).json({ error: "Order not found" });
    }
    logger.info("Retrieved order", { orderId: order.id });
    res.json(order);
  } catch (error) {
    logger.error("Failed to retrieve order", { orderId: req.params.id, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// UPDATE Order
app.put("/orders/:id", async (req, res) => {
  try {
    const { userId, product, quantity, price } = req.body;
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(userId && { userId }),
        ...(product && { product }),
        ...(quantity && { quantity }),
        ...(price && { price })
      }
    });
    logger.info("Order updated", { orderId: order.id });
    res.json(order);
  } catch (error) {
    if (error.code === 'P2025') {
      logger.warn("Order not found for update", { orderId: req.params.id });
      return res.status(404).json({ error: "Order not found" });
    }
    logger.error("Failed to update order", { orderId: req.params.id, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// DELETE Order
app.delete("/orders/:id", async (req, res) => {
  try {
    await prisma.order.delete({
      where: { id: parseInt(req.params.id) }
    });
    logger.info("Order deleted", { orderId: req.params.id });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    if (error.code === 'P2025') {
      logger.warn("Order not found for deletion", { orderId: req.params.id });
      return res.status(404).json({ error: "Order not found" });
    }
    logger.error("Failed to delete order", { orderId: req.params.id, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/* ---------------- GRACEFUL SHUTDOWN ---------------- */

process.on('SIGINT', async () => {
  logger.info("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

/* ---------------- START SERVER ---------------- */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Order Service started`, { port: PORT });
});
