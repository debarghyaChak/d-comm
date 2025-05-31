const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderDetails: {
    orderID: String,  // ✅ Unique identifier for the order
    productID: String,
    productName: String,
    color: String,  // ✅ Add color
    size: String, //add size
    unitPrice: Number,  // ✅ Store price per item
    quantity: Number,
    totalPrice: Number
  },
  customer: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    cityStateZip: String
  },
   transactionStatus: String,
  createdAt: { type: Date, default: Date.now }  // ✅ Auto timestamps
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
