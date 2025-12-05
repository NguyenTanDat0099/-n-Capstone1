import React, { useEffect, useState, useRef } from "react";
import { FaBell } from "react-icons/fa";

const Topbar = () => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  const loadNotifications = () => {
    try {
      const stored =
        JSON.parse(localStorage.getItem("mp_notifications") || "[]") || [];
      setNotifications(stored);
    } catch (err) {
      console.error("Failed to read notifications", err);
    }
  };

  useEffect(() => {
    loadNotifications();
    const handler = () => loadNotifications();
    window.addEventListener("mp_notifications_update", handler);
    window.addEventListener("storage", handler);
    const clickAway = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", clickAway);
    return () => {
      window.removeEventListener("mp_notifications_update", handler);
      window.removeEventListener("storage", handler);
      document.removeEventListener("mousedown", clickAway);
    };
  }, []);

  const formatTime = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    return d.toLocaleString();
  };

  const unreadCount = notifications.length;

  const clearNotifications = () => {
    localStorage.setItem("mp_notifications", "[]");
    setNotifications([]);
    window.dispatchEvent(new Event("mp_notifications_update"));
  };

  return (
    <div className="flex justify-end items-center gap-4 mb-6 pr-6 relative">
      <button
        className="relative text-gray-600 hover:text-gray-900 transition-transform duration-150 active:scale-95 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <FaBell size={20} />
        <span className="absolute -top-1 -right-2 bg-gradient-to-r from-pink-500 to-orange-500 text-[11px] leading-none text-white rounded-full px-1.5 py-0.5 shadow-sm min-w-[20px] text-center">
          {unreadCount}
        </span>
      </button>
      <div
        ref={panelRef}
        className={`absolute right-0 top-10 w-80 bg-white shadow-2xl rounded-xl border border-gray-100 z-20 transform transition-all duration-200 origin-top-right ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl flex items-center justify-between">
          <span className="font-semibold">Thông báo</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
            {unreadCount} mới
          </span>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 && (
            <div className="px-4 py-5 text-sm text-gray-500 text-center">
              Không có thông báo
            </div>
          )}
          {notifications.map((n) => (
            <div
              key={n.id}
              className="px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm text-gray-800">{n.message}</div>
              <div className="text-[11px] text-gray-500">{formatTime(n.timestamp)}</div>
            </div>
          ))}
        </div>
        <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500">
          <span>Giữ lại 5 thông báo gần nhất</span>
          <button
            onClick={clearNotifications}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Xóa tất cả
          </button>
        </div>
      </div>
      <img
        src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
        alt="User Avatar"
        className="w-8 h-8 rounded-full border border-gray-300"
      />
    </div>
  );
};

export default Topbar;
