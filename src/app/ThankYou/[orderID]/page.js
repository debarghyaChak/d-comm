'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const Page = () => {
  const { orderID } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL  = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {

    console.log("Extracted Order ID from useParams():", orderID);
    if (!orderID) return;

    const fetchOrder = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/orders/${orderID}`);
        setOrder(response.data);
      } catch (err) {
        setError('Failed to fetch order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderID]);

  if (loading) return <div className="text-center py-10 mt-15">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500 mt-15">{error}</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50 mt-15">
      <div className="bg-white p-10 rounded shadow-md text-center max-w-lg  w-3/4">
        <Image
          src={"/success-icon.webp"}
          alt="Success"
          width={80}
          height={80}
          className="mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold text-blue-600 mb-2">Thank you for your purchase!</h1>
        <p className="mb-6 text-gray-700">
          Your order has been successfully placed. We’ve sent a confirmation to your email.
        </p>

        <div className="bg-gray-100 p-4 rounded mb-4 text-left">
          <p><strong>Order ID:</strong> {order.orderDetails.orderID}</p>
          <p><strong>Product:</strong> {order.orderDetails.productName}</p>
          <p><strong>Color:</strong> {order.orderDetails.color}</p>
          <p><strong>Size:</strong> {order.orderDetails.size}</p>
          <p><strong>Quantity:</strong> {order.orderDetails.quantity}</p>
          <p><strong>Total Price:</strong> ${order.orderDetails.totalPrice}</p>
          <p><strong>Status:</strong> {order.transactionStatus}</p>
        </div>

        <h1 className="text-xl font-bold text-blue-600 mb-2">Customer Details</h1>
        <div className="bg-gray-100 p-4 rounded mb-4 text-left">
          <p><strong>Name</strong> {order.customer.fullName}</p>
          <p><strong>Product:</strong> {order.customer.email}</p>
          <p><strong>Color:</strong> {order.customer.phone}</p>
          <p><strong>Size:</strong> {order.customer.address}</p>
          <p><strong>Quantity:</strong> {order.customer.cityStateZip}</p>
         
        </div>

        <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
          Continue Shopping!
        </Link>
      </div>
    </div>
  );
};

export default Page;
