require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const Product = require("./models.js"); // ✅ Import the Product model
const http = require("http"); // Required for WebSockets
const socketIo = require("socket.io");


const app = express();
app.use(express.json());
app.use(cors()); // ✅ Enable cross-origin requests

// ✅ Initialize WebSocket AFTER Express is set up
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } }); // ✅ WebSocket initialized here

// ✅ Attach WebSocket handlers
io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected! 🚀"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

  // ✅ Emit stock updates when products are modified
const updateStock = async (productId) => {
  const product = await Product.findById(productId);
  if (!product) {
    console.error(`❌ Product not found: ${productId}`);
    return;
  }

  const cleanStock = {};

  // Ensure compatibility with both Maps and plain objects (for safety)
  const stock = product.stock instanceof Map ? product.stock : new Map(Object.entries(product.stock));

  for (const [color, sizeMap] of stock.entries()) {
    cleanStock[color] = {};

    const sizes = sizeMap instanceof Map ? sizeMap : new Map(Object.entries(sizeMap));

    for (const [size, qty] of sizes.entries()) {
      cleanStock[color][size] = qty;
    }
  }

  // Emit the clean object
  io.emit("stockUpdated", {
    productId,
    newStock: cleanStock,
  });

  console.log(`✅ Stock updated and emitted for ${productId}:`, cleanStock);
};



module.exports = { io, updateStock }; // ✅ Export `updateStock` globally


// ✅ Define a simple test route
app.get("/", (req, res) => {
  res.send("Backend is running! 🚀");
});

// ✅ Fetch all products from MongoDB
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find(); // ✅ Fetch products from MongoDB
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

// ✅ Now pass `io` to orderRoutes AFTER `io` is initialized
const orderRoutes = require("./routes/orderRoutes")(io);
app.use("/api", orderRoutes); // Attach order routes

// ✅ Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT} 🔥`));
