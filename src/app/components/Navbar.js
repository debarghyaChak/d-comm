"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react"; // ShadCN-compatible icons

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0); // Placeholder for cart item count

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/30 backdrop-blur-md shadow-md px-6 py-3 flex items-center justify-between z-50">
      {/* Logo */}
      <Link href="/"><div className="text-xl font-bold">D-<span className="text-blue-500">Comm</span></div></Link>
      

      {/* Desktop Navigation */}
      <div className="hidden md:flex space-x-6 text-lg">
        <Link href="/" className="hover:text-blue-500">Home</Link>
        <Link href="/ProductPage" className="hover:text-blue-500">Products</Link>
        {/* <Link href="/checkout" className="relative">
          <ShoppingCart className="inline-block w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-white rounded-full px-2 text-sm">
              {cartCount}
            </span>
          )}
        </Link> */}
      </div>

      {/* Mobile Menu Button & Cart */}
      <div className="md:hidden flex items-center space-x-4">
        {/* Cart Icon */}
        {/* <Link href="/checkout" className="relative">
          <ShoppingCart className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-red-500 text-white rounded-full px-2 text-sm">
              {cartCount}
            </span>
          )}
        </Link> */}

        {/* Hamburger Menu */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 bg-white/30 backdrop-blur-md rounded-md"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Navigation */}
      <div
        className={`fixed top-0 right-0 h-screen w-64 bg-white shadow-lg transform ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 md:hidden flex flex-col p-6`}
      >
        <button onClick={() => setMenuOpen(false)} className="self-end text-lg">✕</button>
        <Link href="/" className="py-2">Home</Link>
        <Link href="/ProductPage" className="py-2">Products</Link>
        {/* <Link href="/checkout" className="py-2">Checkout</Link> */}
      </div>
    </nav>
  );
};

export default Navbar;
