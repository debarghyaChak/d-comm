module.exports = (io) => {
  const express = require("express");
  const router = express.Router();
  const Order = require("../orderModel");
  const Product = require("../models");
  const nodemailer = require("nodemailer");
  require("dotenv").config();
  const { updateStock } = require("../server");

  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 587,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });

  router.post("/place-order", async (req, res) => {
    try {
      console.log("Received order details:", req.body); //debug
      const {
        productId,
        productName,
        color, // ✅ Add color
        size, //add size
        quantity,
        totalPrice,
        customer,
        transactionType,
      } = req.body;

      if (
        !productId ||
        !productName ||
        !quantity ||
        !totalPrice ||
        !customer ||
        !customer.email
      ) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // ✅ Fetch the product from the database
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // ✅ Validate product name & price against database values
      if (
        product.name !== productName ||
        Number(product.price) * Number(quantity) !== Number(totalPrice)
      ) {
        return res.status(400).json({ message: "Product details mismatch" });
      }

      // ✅ Prevent negative or zero quantity orders
      if (quantity <= 0) {
        return res.status(400).json({
          message: "❌ Quantity must be at least 1.",
        });
      }

      //check for trying to purchase more than available quantity
      const stock = product.stock;

      // Find matching color (case-insensitive)
      const availableColors = Array.from(stock.keys());
      const matchedColor = availableColors.find(
        (c) => c.toLowerCase() === color.toLowerCase()
      );

      if (!matchedColor) {
        return res.status(400).json({
          message: "❌ Color not found in stock",
          debug: { triedColor: color, availableColors },
        });
      }

      // Get the size map for that color
      const colorStock = stock.get(matchedColor);

      // Now get available sizes
      const availableSizes = Array.from(colorStock.keys());
      const matchedSize = availableSizes.find(
        (s) => s.toLowerCase() === size.toLowerCase()
      );

      if (!matchedSize) {
        return res.status(400).json({
          message: "❌ Size not found in stock for this color",
          debug: { triedSize: size, availableSizes },
        });
      }

      const availableStock = colorStock.get(matchedSize);

      if (quantity > availableStock) {
        return res.status(400).json({
          message: "❌ Not enough stock available!",
          availableStock,
        });
      }

      let transactionStatus;
      if (transactionType === 1)
        transactionStatus = "Approved"; // ✅ Successful transaction
      else if (transactionType === 2)
        transactionStatus = "Declined"; // ❌ Payment rejected
      else if (transactionType === 3)
        transactionStatus = "Gateway Failure"; // ⚠ Transaction error
      else transactionStatus = "Unknown"; // 🚫 Invalid type

      // ❌ If transaction fails, stop the order process
      if (transactionStatus !== "Approved") {
        const failedMailOptions = {
          from: '"D-Comm Support" <noreply@shop.com>',
          to: customer.email,
          subject: `Transaction ${transactionStatus} - Order Not Processed`,
          text: `Hello ${customer.fullName},\n\n${
            transactionStatus === "Declined"
              ? "Your payment method was declined. If this was an error, you may retry the payment. If any amount was deducted, please contact customer support."
              : "The payment did not go through due to a gateway error. If any amount was deducted, please contact customer support."
          }\n\nThank you for choosing D-Comm.`,
        };

        await transporter.sendMail(failedMailOptions); // ✅ Send failure email BEFORE returning

        return res.status(400).json({
          message: `${transactionStatus}. Order not placed.`,
        });
      }

      // ✅ Generate unique order ID
      const orderID = `ORD-${Date.now()}`;

      // ✅ Create new order instance
      const newOrder = new Order({
        orderDetails: {
          orderID,
          productID: productId,
          productName,
          color: color ?? "Not specified", // ✅ Add color
          size: size ?? "Not specified", // add size
          unitPrice: product.price, // ✅ Save unit price
          quantity: quantity,
          totalPrice,
        },
        customer,
        transactionStatus,
        createdAt: new Date(),
      });

      // ✅ Save order to database
      await newOrder.save();

      // ✅ Update product inventory count
      // await Product.findByIdAndUpdate(productId, {
      //   $inc: { quantity: -quantity }, // ✅ Reduce stock dynamically
      // });

      await Product.findByIdAndUpdate(
        productId,
        { $inc: { [`stock.${color}.${size}`]: -quantity } }, // ✅ Deduct from the correct variant
        { new: true }
      );

      const updatedProduct = await Product.findById(productId); // Fetch latest stock
      console.log(
        `Emitting stock update for ${productId}: New Stock =`,
        updatedProduct.stock
      );
      updateStock(productId);

      const mailOptions = {
        from: '"D-Comm Support" <noreply@shop.com>',
        to: customer.email,
        subject: `Order Confirmation - Order ID: ${orderID}`,
        text: `Hello ${
          customer.fullName
        },\n\nThank you for shopping with D-Comm! Your order has been successfully placed.\n\n🔹 **Order Number:** ${orderID}\n\n🔹 **Product Details:**\n- **Product Name:** ${productName}\n- **Color:** ${color}\n- **Size:** ${size}\n- **Quantity:** ${quantity}\n- **Unit Price:** $${
          product.price
        }\n- **Total Price:** $${totalPrice}\n\n📍 **Customer Information:**\n- **Name:** ${
          customer.fullName
        }\n- **Email:** ${customer.email}\n- **Phone Number:** ${
          customer.phone ?? "Not provided"
        }\n- **Address:** ${
          customer.address ?? "Not provided"
        }\n- **Zip Code:** ${
          customer.cityStateZip ?? "Not provided"
        }\n\n💳 **Transaction Details:**\n- **Transaction Status:** ${transactionStatus}\n\n📦 **Shipping Information:**\nYour order is being prepared for dispatch. You will receive tracking details once it ships.\n\n✅ **Confirmation Message:**\nYour payment has been processed successfully, and your order is now confirmed. If you have any questions, feel free to contact our support team.\n\nBest regards,\nD-Comm Support Team`,
      };

      await transporter.sendMail(mailOptions);

      res.status(201).json({ message: "Order placed successfully", orderID });
    } catch (error) {
      console.error("Error placing order:", error);
      res.status(500).json({ message: "Error placing order", error });
    }
  });

  router.get("/orders/:orderID", async (req, res) => {
    try {
      const { orderID } = req.params;
      const order = await Order.findOne({ "orderDetails.orderID": orderID });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.status(200).json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  return router; // ✅ Correct way to return router from the function
};
