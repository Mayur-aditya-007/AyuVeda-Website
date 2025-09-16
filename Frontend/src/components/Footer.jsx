// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 text-gray-600">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo & tagline */}
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="font-semibold text-gray-900">AyuVeda</span>
          </Link>
          <p className="mt-3 text-sm text-gray-500">
            Blending Ayurvedic wisdom with modern guidance for holistic well-being.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-green-700">About</Link></li>
            <li><Link to="/services" className="hover:text-green-700">Services</Link></li>
            <li><Link to="/blog" className="hover:text-green-700">Blog</Link></li>
            <li><Link to="/contact" className="hover:text-green-700">Contact</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Resources</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/terms" className="hover:text-green-700">Terms & Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-green-700">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Get in Touch</h4>
          <ul className="space-y-2 text-sm">
            <li>Email: <a href="mailto:support@ayurveda.com" className="hover:text-green-700">support@ayurveda.com</a></li>
            <li>Phone: <a href="tel:+911234567890" className="hover:text-green-700">+91 12345 67890</a></li>
          </ul>
          <div className="flex gap-4 mt-4 text-xl">
            <a href="#" aria-label="Facebook" className="hover:text-green-700">📘</a>
            <a href="#" aria-label="Instagram" className="hover:text-green-700">📸</a>
            <a href="#" aria-label="Twitter" className="hover:text-green-700">🐦</a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} AyuVeda. All rights reserved.
      </div>
    </footer>
  );
}
