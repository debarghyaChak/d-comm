const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  _id: String, // ✅ Explicit `_id`
  name: String,
  description: String,
  price: Number,
  image: String,
  stock: {
    type: Map,
    of: Map, // ✅ Nested map: color → size → quantity
  },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });

// ✅ Virtual field to calculate total available quantity dynamically
productSchema.virtual("totalQuantity").get(function () {
  return Object.values(this.stock || {}).reduce((colorAcc, sizes) => {
    return colorAcc + Object.values(sizes).reduce((sizeAcc, qty) => sizeAcc + qty, 0);
  }, 0);
});
const Product = mongoose.model("Product", productSchema);
module.exports = Product;

