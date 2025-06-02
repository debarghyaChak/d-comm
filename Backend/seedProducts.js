require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models.js");
const { updateStock } = require("./server"); // ✅ Import stock update function

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected for Seeding! 🚀"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const products = [
  {
    _id: "P0000001",
    name: "Nike Air Max1",
    description: "Lightweight running shoes with supreme comfort.",
    price: 120,
    image: "/Images/product1.jpg",
    stock: {
      Red: { S: 12, M: 3, L: 4, XL: 7 },
      Blue: { S: 4, M: 6, L: 9, XL: 12 },
      Black: { S: 6, M: 7, L: 5, XL: 9 },
    },
  },
  {
    _id: "P0000002",
    name: "Nike Jordan I",
    description: "Classic basketball sneakers with premium leather.",
    price: 440,
    image: "/Images/product2.webp",
    stock: {
      Red: { S: 6, M: 5, L: 4, XL: 4 },
      Blue: { S: 5, M: 6, L: 4, XL: 4 },
      Black: { S: 4, M: 5, L: 5, XL: 5 },
    },
  },
  {
    _id: "P0000003",
    name: "Nike Jordan II",
    description: "Classic basketball sneakers with premium leather.",
    price: 290,
    image: "/Images/product3.jpg",
    stock: {
      Red: { S: 7, M: 6, L: 5, XL: 5 },
      Blue: { S: 6, M: 7, L: 5, XL: 5 },
      Black: { S: 5, M: 6, L: 6, XL: 6 },
    },
  },
  {
    _id: "P0000004",
    name: "Nike Jordan III",
    description: "Classic basketball sneakers with premium leather.",
    price: 540,
    image: "/Images/product4.jpg",
    stock: {
      Red: { S: 8, M: 7, L: 6, XL: 6 },
      Blue: { S: 7, M: 8, L: 6, XL: 6 },
      Black: { S: 6, M: 7, L: 7, XL: 7 },
    },
  },
];

const seedDatabase = async () => {
  try {
    await Product.deleteMany(); // ✅ Clears existing products
    await Product.insertMany(products); // ✅ Inserts new products
    console.log("✅ Database seeded successfully! 🚀");

    // ✅ Emit WebSocket stock updates for all products and wait for them to complete
    await Promise.all(products.map(product => updateStock(product._id)));

    console.log("✅ Stock updates emitted for all products.");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    mongoose.connection.close(); // ✅ Ensure it's closed only after all tasks are done
  }
};


seedDatabase();
