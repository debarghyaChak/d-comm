const { io } = require("./server"); // ✅ Ensure WebSocket instance is imported

io.emit("stockUpdated", { productId: "P0000001", newStock: { test: "data" } });
console.log("✅ Manually emitted stock update.");
process.exit();
