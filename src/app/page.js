"use client";

import { useState } from "react";
import Image from "next/image";
import ProductCard from "./components/ProductCards";
import SortDropdown from "./components/SortDropdown";
import useProducts from "@/data/products";


// Import sneakers dynamically

export default function Home() {
  const products = useProducts();
  console.log("Products received in frontend:", products);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortOption, setSortOption] = useState("default");

  // Sorting logic
  const sortedProducts = [...products].sort((a, b) => {
  if (sortOption === "price-high") return b.price - a.price;
  if (sortOption === "price-low") return a.price - b.price;
  if (sortOption === "alphabetical") return a.name.localeCompare(b.name);
  return 0;
});



  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Hero Section */}
      <div className="text-center my-6 mt-15">
        <h1 className="text-5xl font-bold">D-<span className="text-blue-500">Comm</span></h1>
        <p className="text-lg text-gray-600 mt-2">
          Check out our premium sneakers
        </p>
      </div>

      {/* Sorting Dropdown Component */}
      <SortDropdown setSortOption={setSortOption} />

      {/* Product Grid Component */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {sortedProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            setSelectedProduct={setSelectedProduct}
          />
        ))}
      </div>

      {/* Modal Popup */}
      {selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
            <Image
              src={selectedProduct.image}
              alt={selectedProduct.name}
              width={300}
              height={300}
              className="w-full rounded-md"
            />
            <h2 className="text-2xl font-bold mt-2">{selectedProduct.name}</h2>
            <p className="text-gray-500">{selectedProduct.description}</p>
            <p className="text-lg font-bold mt-2">${selectedProduct.price}</p>
            <button
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700"
              onClick={() => setSelectedProduct(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
