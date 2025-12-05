import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkBase =
    "px-2 py-1 text-sm md:text-[15px] font-medium transition border-b-2 border-transparent";
  const active = "text-blue-600 border-blue-600";
  const inactive = "text-slate-800 hover:text-blue-600";

  const navItem = (to: string, label: string) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        `${linkBase} ${isActive ? active : inactive}`
      }
      onClick={() => setOpen(false)}
    >
      {label}
    </NavLink>
  );

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md py-3">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight text-[#1E293B]"
        >
          MaintainPro
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItem("/", "Home")}
          {navItem("/about", "About")}
          {navItem("/login", "Login")}
          {navItem("/dashboard", "Dashboard")}
        </nav>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-3">
          <Link
            to="/submit-ticket"
            className="hidden md:inline-block rounded-lg px-4 py-2 text-sm font-semibold transition bg-blue-600 text-white hover:bg-blue-700"
          >
            Submit a maintenance request
          </Link>

          <button
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-700 hover:bg-slate-100"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {open ? (
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden transition-colors bg-white shadow-md">
          <div className="px-4 py-3 flex flex-col gap-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${linkBase} text-slate-800 ${isActive ? active : ""}`
              }
              onClick={() => setOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `${linkBase} text-slate-800 ${isActive ? active : ""}`
              }
              onClick={() => setOpen(false)}
            >
              About
            </NavLink>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `${linkBase} text-slate-800 ${isActive ? active : ""}`
              }
              onClick={() => setOpen(false)}
            >
              Login
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `${linkBase} text-slate-800 ${isActive ? active : ""}`
              }
              onClick={() => setOpen(false)}
            >
              Dashboard
            </NavLink>

            <Link
              to="/submit-ticket"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg px-4 py-2 text-sm font-semibold text-center bg-blue-600 text-white"
            >
              Submit a maintenance request
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
