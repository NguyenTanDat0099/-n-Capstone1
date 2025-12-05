import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[#1E293B] text-gray-300 py-6 mt-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Logo và tên */}
        <h2 className="text-lg font-semibold text-white">
          © {new Date().getFullYear()} MaintainPro
        </h2>

        {/* Liên kết nhanh */}
        <div className="flex gap-6 text-sm">
          <a
            href="/about"
            className="hover:text-blue-400 transition-colors duration-200"
          >
            About
          </a>
          <a
            href="/login"
            className="hover:text-blue-400 transition-colors duration-200"
          >
            Login
          </a>
          <a
            href="/contact"
            className="hover:text-blue-400 transition-colors duration-200"
          >
            Contact
          </a>
        </div>

        {/* Mạng xã hội */}
        <div className="flex gap-4">
          <a href="#" className="hover:text-blue-400">
            <i className="fa-brands fa-facebook-f"></i>
          </a>
          <a href="#" className="hover:text-blue-400">
            <i className="fa-brands fa-twitter"></i>
          </a>
          <a href="#" className="hover:text-blue-400">
            <i className="fa-brands fa-linkedin-in"></i>
          </a>
        </div>
      </div>
    </footer>
  );
}
