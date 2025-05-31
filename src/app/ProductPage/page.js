"use client";
import { useState } from "react";
import React from "react";
import Image from "next/image";
import SortDropdown from "../components/SortDropdown";
import ProductCard from "../components/ProductCards";
import useProducts from "@/data/products";

const Page = () => {
  const products = useProducts();
  // ✅ Fix: Define State for Sorting & Selected Product
  const [sortOption, setSortOption] = useState("default");
  const [selectedProduct, setSelectedProduct] = useState(null);

  // ✅ Fix: Declare Sorting Logic
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
        <h1 className="text-5xl font-bold">Our <span className="text-blue-500">Latest</span> Sneakers!</h1>
        <p className="text-lg text-gray-600 mt-2">
          Check out our premium latest sneakers from Nike!
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
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
              onClick={() => setSelectedProduct(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
