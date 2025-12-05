import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaTicketAlt, FaTools, FaCog, FaLaptop } from "react-icons/fa";

const Sidebar = () => {
  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: FaHome },
    { to: "/tickets", label: "My Tickets", icon: FaTicketAlt },
    { to: "/submit-ticket", label: "Submit Ticket", icon: FaTools },
    { to: "/devices", label: "My Devices", icon: FaLaptop },
    { to: "/settings", label: "Settings", icon: FaCog },
  ];

  return (
    <div className="h-screen bg-[#0f172a] text-white w-64 fixed flex flex-col">
      {/* Logo */}
      <div className="text-2xl font-bold px-6 py-4 border-b border-gray-700">
        MaintainPro
      </div>

      {/* Menu */}
      <nav className="flex-1 mt-4">
        <ul>
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 px-6 py-3 border-l-4 transition-colors duration-150",
                    isActive
                      ? "border-blue-500 bg-white/10 text-white font-semibold"
                      : "border-transparent text-gray-300 hover:border-blue-400/60 hover:bg-white/5",
                  ].join(" ")
                }
              >
                <Icon />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="text-center py-4 text-sm text-gray-400">
        © 2025 MaintainPro
      </div>
    </div>
  );
};

export default Sidebar;
