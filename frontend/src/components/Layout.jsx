import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ticketsCount, setTicketsCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    // load tickets count for badge (non-blocking)
    axios.get("http://localhost:5000/api/tickets").then(r => {
      setTicketsCount((r.data || []).length);
    }).catch(() => {});
  }, []);

  const navItems = [
    { key: "dashboard", label: "Bảng điều khiển", route: "/dashboard", icon: "📊" },
    { key: "tickets", label: "Phiếu công việc", route: "/tickets", icon: "📄" },
    { key: "schedules", label: "Lịch trình", route: "/schedules", icon: "📅" },
    { key: "ticketDetail", label: "Chi tiết phiếu", route: "/tickets", icon: "📌" }, // detail depends on selection
    { key: "settings", label: "Cài đặt", route: "/settings", icon: "⚙️" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-72 bg-white border-r p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-2xl">🔧</div>
          <div>
            <h1 className="text-lg font-bold text-blue-600">MaintainPro</h1>
            <p className="text-xs text-gray-500">Kỹ thuật viên</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            let active = false;
            if (item.key === "dashboard") {
              active = location.pathname === "/dashboard";
            } else if (item.key === "tickets") {
              // chỉ active trên trang danh sách phiếu
              active = location.pathname === "/tickets";
            } else if (item.key === "ticketDetail") {
              // chỉ active khi đang xem chi tiết /tickets/:id
              active = location.pathname.startsWith("/tickets/");
            } else {
              active = location.pathname === item.route;
            }
            return (
              <div key={item.key} className="relative">
                <div className={`absolute left-0 top-0 h-full w-1 rounded-r transition-all ${active ? "bg-blue-500 opacity-100" : "bg-transparent opacity-0"}`}></div>

                <button
                  onClick={() => navigate(item.route)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm text-left transition transform duration-150 ease-in-out ${active ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-700 hover:bg-gray-50 hover:translate-x-1 hover:scale-[1.02]"}`}
                >
                  <span className={`flex-none ${active ? "text-blue-600" : "text-gray-500"}`}>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.key === "tickets" && ticketsCount > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{ticketsCount}</span>
                  )}
                </button>
              </div>
            );
          })}
        </nav>

        <div className="mt-6">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("guest");
              navigate("/login");
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition"
          >
            <span>🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 bg-[#f5f6fa]">
        {/* Outlet sẽ render các pages (Dashboard / Tickets / TicketDetail / ...) */}
        <Outlet />
      </main>
    </div>
  );
}
