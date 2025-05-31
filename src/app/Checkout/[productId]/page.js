"use client";

import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import useProducts from "@/data/products";
import { useRouter } from "next/navigation";

const page = () => {
  const products = useProducts();
  const { productId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    cityStateZip: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [errors, setErrors] = useState({});

  // Get color, size, quantity from searchParams
  const selectedColor = searchParams.get("color") || "N/A";
  const selectedSize = searchParams.get("size") || "N/A";
  const quantity = parseInt(searchParams.get("quantity") || "1");

  useEffect(() => {
    if (products.length > 0) {
      const foundProduct = products.find(
        (product) => product._id === productId
      );
      setSelectedProduct(foundProduct || null);
    }
  }, [products, productId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "cardNumber" ? formatCardNumber(value) : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.(com|net|org|edu|gov|info|io|co|biz|in|us|uk|de|fr|jp|cn|au)$/.test(
        formData.email.trim()
      )
    ) {
      newErrors.email = "Invalid email format or unsupported domain ending";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d+$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone number must contain only digits";
    } else if (formData.phone.trim().length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.cityStateZip.trim())
      newErrors.cityStateZip = "Zip Code is required";
    else if (!/^\d+$/.test(formData.cityStateZip.trim())) {
      newErrors.cityStateZip = "Zip code must contain only digits";
    } else if (formData.cityStateZip.trim().length !== 6) {
      newErrors.cityStateZip = "Zip code must be exactly 6 digits";
    }
    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = "Card Number is required";
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/-/g, ""))) {
      newErrors.cardNumber = "Card Number must contain exactly 16 digits";
    } else if (!/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(formData.cardNumber)) {
      newErrors.cardNumber =
        "Card Number must be in the format xxxx-xxxx-xxxx-xxxx";
    }
    if (!formData.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    } else {
      const today = new Date();
      const expiry = new Date(formData.expiryDate);

      if (expiry <= today) {
        newErrors.expiryDate = "Expiry date must be in the future";
      }
    }

    if (!formData.cvv.trim()) newErrors.cvv = "CVV is required";
    else if (formData.cvv.trim().length !== 3) {
      newErrors.cvv = "CVV must be exactly 3 digits";
    } else if (!/^\d+$/.test(formData.cvv.trim())) {
      newErrors.cvv = "CVV must contain only digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatCardNumber = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{4})/g, "$1-")
      .replace(/-$/, "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      // ✅ Simulate transaction type (70% success, 15% declined, 15% failure)
      const transactionType =
        Math.random() < 0.7 ? 1 : Math.random() < 0.5 ? 2 : 3;

      const orderDetails = {
        productId: selectedProduct._id,
        productName: selectedProduct.name,
        color: selectedColor, // ✅ Include color
        size: selectedSize,
        quantity,
        totalPrice: selectedProduct.price * quantity,
        customer: { ...formData },
        transactionType, // ✅ Passing the simulated transaction type
      };

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      try {
        const response = await fetch(`${API_URL}/api/place-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderDetails),
        });

        const data = await response.json();

        if (data.message.includes("success")) {
          router.push(`/ThankYou/${data.orderID}`);
        } else {
          let errorMessage = "Something went wrong.";

          if (data.message.includes("Declined")) {
            errorMessage =
              "Payment was declined. Please use a different card or try again.";
          } else if (data.message.includes("Gateway Failure")) {
            errorMessage =
              "Transaction failed due to payment gateway issues. Try again later.";
          } else if (data.message.includes("Product details mismatch")) {
            errorMessage =
              "Mismatch in product details. Check the price and name before placing the order.";
          } else if (data.message.includes("Missing required fields")) {
            errorMessage = "Please fill in all required fields correctly.";
          }

          alert(errorMessage);
        }
      } catch (error) {
        console.error("Error placing order:", error);
        alert("Error connecting to the server. Try again.");
      }
    }
  };

  // ✅ Move conditional rendering AFTER all hooks
  if (!selectedProduct) {
    return <p className="text-center text-red-500 mt-10">Product not found</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Checkout</h1>

      {/* Order Summary */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-screen-lg mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Order Summary
        </h2>
        <div className="flex items-center justify-between border-b pb-4 mb-4">
          <Image
            src={selectedProduct.image}
            alt={selectedProduct.name}
            width={100}
            height={100}
            className="rounded-md"
          />
          <div className="flex flex-col ml-3">
            <h3 className="font-semibold">{selectedProduct.name}</h3>
            <p className="text-sm text-gray-600">
              Color: {selectedColor} | Size: {selectedSize}
            </p>
            <p className="text-gray-600">Quantity: {quantity}</p>
          </div>
          <p className="text-lg font-bold ml-auto">${selectedProduct.price}</p>
        </div>

        <div className="flex justify-between text-lg font-bold mt-4">
          <span>Total:</span>
          <span>${selectedProduct.price * quantity}</span>
        </div>
      </div>

      {/* Billing Details Form */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-screen-lg mx-auto mt-8">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Billing Details
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            className="w-full p-3 border rounded-lg shadow-md"
            onChange={handleInputChange}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm">{errors.fullName}</p>
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 border rounded-lg shadow-md"
            onChange={handleInputChange}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            className="w-full p-3 border rounded-lg shadow-md"
            onChange={handleInputChange}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone}</p>
          )}
          <textarea
            name="address"
            placeholder="Address"
            className="w-full p-3 border rounded-lg shadow-md"
            onChange={handleInputChange}
          />
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address}</p>
          )}
          <input
            type="text"
            name="cityStateZip"
            placeholder="Zip Code"
            className="w-full p-3 border rounded-lg shadow-md"
            onChange={handleInputChange}
          />
          {errors.cityStateZip && (
            <p className="text-red-500 text-sm">{errors.cityStateZip}</p>
          )}

          <h2 className="text-xl font-semibold mb-4 text-center mt-4">
            Card Details
          </h2>
          <input
            type="text"
            name="cardNumber"
            placeholder="Card Number"
            className="w-full p-3 border rounded-lg shadow-md"
            maxLength="19"
            value={formData.cardNumber}
            onChange={handleInputChange}
          />
          {errors.cardNumber && (
            <p className="text-red-500 text-sm">{errors.cardNumber}</p>
          )}

          <div className="flex space-x-4">
            <div className="w-full">
              <label className="block text-gray-700 font-small ml-3">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                className="w-full p-3 border rounded-lg shadow-md"
                onChange={handleInputChange}
              />
              {errors.expiryDate && (
                <p className="text-red-500 text-sm">{errors.expiryDate}</p>
              )}
            </div>
            <div className="w-full">
              <label className="block text-gray-700 font-small ml-3">CVV</label>
              <input
                type="text"
                name="cvv"
                className="w-full p-3 border rounded-lg shadow-md"
                maxLength="3"
                onChange={handleInputChange}
              />
              {errors.cvv && (
                <p className="text-red-500 text-sm">{errors.cvv}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full bg-blue-500 text-white py-3 rounded-lg shadow-lg hover:bg-blue-600 transition"
          >
            Place Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default page;
