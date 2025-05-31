import React, { useState, useEffect } from "react";
import Image from "next/image";
import socket from "@/utils/socket";

const ProductCard = ({ product, setSelectedProduct }) => {
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [stock, setStock] = useState(product.stock);

  useEffect(() => {
    if (!socket) return;
    const handleStockUpdate = ({ productId, newStock }) => {
      if (productId === product._id && newStock) {
        setStock(newStock);

        // Reset quantity if it exceeds available stock
        if (selectedColor && selectedSize) {
          const updatedQty = newStock[selectedColor]?.[selectedSize] || 0;
          if (quantity > updatedQty) {
            setQuantity(updatedQty);
          }
        }

        // Reset size if the selected size is now out of stock
        if (
          selectedColor &&
          selectedSize &&
          newStock[selectedColor]?.[selectedSize] === 0
        ) {
          setSelectedSize("");
          setQuantity(1);
        }

        // Reset color if all sizes under it are now 0
        if (
          selectedColor &&
          (!newStock[selectedColor] ||
            Object.values(newStock[selectedColor]).every((qty) => qty === 0))
        ) {
          setSelectedColor("");
          setSelectedSize("");
          setQuantity(1);
        }
      }
    };

    socket.on("stockUpdated", handleStockUpdate);
    return () => socket.off("stockUpdated", handleStockUpdate);
  }, [product._id, selectedColor, selectedSize, quantity]);

  const handleColorChange = (e) => {
    setSelectedColor(e.target.value);
    setSelectedSize("");
    setQuantity(1);
  };

  const handleSizeChange = (e) => {
    setSelectedSize(e.target.value);
    setQuantity(1);
  };

  const handleQuantityChange = (delta) => {
    if (!selectedColor || !selectedSize) return;
    const maxQty = stock[selectedColor]?.[selectedSize] || 0;
    setQuantity((prev) => {
      let newQty = prev + delta;
      if (newQty < 1) return 1;
      if (newQty > maxQty) return maxQty;
      return newQty;
    });
  };

  // Filtered list of colors with available sizes
  const availableColors = Object.entries(stock).filter(([color, sizes]) =>
    Object.values(sizes).some((qty) => qty > 0)
  );

  // Filtered list of sizes for the selected color
  const availableSizes =
    selectedColor && stock[selectedColor]
      ? Object.entries(stock[selectedColor]).filter(([, qty]) => qty > 0)
      : [];

  const isOutOfStock =
    availableColors.length === 0 ||
    availableColors.every(([, sizes]) =>
      Object.values(sizes).every((qty) => qty === 0)
    );

  return (
    <div className="bg-white p-4 rounded-3xl shadow-md hover:shadow-lg hover:shadow-blue-500 hover:scale-105 transition transform duration-200">
      <Image
        src={product.image}
        alt={product.name}
        width={900}
        height={640}
        className="w-auto h-auto w-full rounded-md"
      />

      <h2 className="text-xl text-blue-500 font-semibold mt-2">
        {product.name}
      </h2>
      <p className="text-gray-500">{product.description}</p>
      <p className="text-lg font-bold mt-2">${product.price}</p>

      {!isOutOfStock && (
        <div className="flex gap-4 mt-4">
          {/* Color Selector */}
          <div className="flex-1">
            <label className="block text-black-500 font-medium">Color:</label>
            <select
              className="w-full p-2 border rounded-md mt-1"
              value={selectedColor}
              onChange={handleColorChange}
            >
              <option value="">Select Color</option>
              {availableColors.map(([color]) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          {/* Size Selector */}
          <div className="flex-1">
            <label className="block text-black-500 font-medium">Size:</label>
            <select
              className="w-full p-2 border rounded-md mt-1"
              value={selectedSize}
              onChange={handleSizeChange}
              disabled={!selectedColor}
            >
              <option value="">Select Size</option>
              {availableSizes.map(([size]) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity Selector */}
          {selectedColor && selectedSize && (
            <div className="flex flex-col space-y-1">
              <label className="block text-sm text-black font-medium">
                Quantity:
              </label>
              <div className="flex items-center justify-between border rounded-md px-2 py-1 bg-white shadow-sm w-[120px] mt-1">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className={`px-2 py-1 rounded-md transition font-medium ${
                    quantity <= 1
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-red-200 hover:bg-red-300"
                  }`}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="text-black text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className={`px-2 py-1 rounded-md transition font-medium ${
                    quantity >= (stock[selectedColor]?.[selectedSize] || 0)
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-green-200 hover:bg-green-300"
                  }`}
                  disabled={
                    quantity >= (stock[selectedColor]?.[selectedSize] || 0)
                  }
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-between mt-4">
        {isOutOfStock ? (
          <p className="text-red-500 font-semibold text-left mt-2">
            🚫 Product is Out of Stock
          </p>
        ) : (
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
            onClick={() => {
              if (!selectedColor || !selectedSize) {
                alert(
                  "Please select a color and size before proceeding to checkout!"
                );
                return;
              }

              window.location.href = `/Checkout/${product._id}?color=${selectedColor}&size=${selectedSize}&quantity=${quantity}`;
            }}
          >
            Buy Now
          </button>
        )}

        <button
          className="px-4 py-2 border rounded-md hover:bg-gray-200"
          onClick={() => setSelectedProduct(product)}
        >
          View Product
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
