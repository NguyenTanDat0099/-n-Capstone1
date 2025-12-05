import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:5001";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
};

export default function UserDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = 1; // TODO: replace with authenticated user id
    setLoading(true);
    fetch(`${API_BASE}/api/tickets/user/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load tickets");
        return res.json();
      })
      .then((rows) => {
        const normalized = rows.map((row) => ({
          id: row.id,
          subject: row.subject,
          deviceName: row.device_name || row.deviceName,
          priority: row.priority,
          status: row.status,
          lastUpdated: row.updated_at || row.created_at,
        }));
        setTickets(normalized);
        setError("");
      })
      .catch((err) => setError(err.message || "Failed to load tickets"))
      .finally(() => setLoading(false));
  }, []);

  const summary = useMemo(() => {
    const completed = tickets.filter(
      (t) => (t.status || "").toLowerCase() === "completed"
    ).length;
    const pending = tickets.filter(
      (t) => (t.status || "").toLowerCase() !== "completed"
    ).length;
    const active = tickets.length;
    return { active, completed, pending };
  }, [tickets]);

  const recentTickets = useMemo(() => {
    return tickets
      .slice()
      .sort(
        (a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0)
      )
      .slice(0, 5);
  }, [tickets]);

  const statusColor = {
    open: "text-blue-600",
    "in progress": "text-orange-500",
    completed: "text-green-600",
    pending: "text-yellow-600",
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Dashboard</h1>
        <Link
          to="/tickets"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow"
        >
          View All Tickets
        </Link>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-gray-500 text-sm">Active Tickets</h2>
          <p className="text-3xl font-semibold text-blue-600 mt-2">
            {summary.active || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-gray-500 text-sm">Completed</h2>
          <p className="text-3xl font-semibold text-green-600 mt-2">
            {summary.completed || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
          <h2 className="text-gray-500 text-sm">Pending</h2>
          <p className="text-3xl font-semibold text-yellow-500 mt-2">
            {summary.pending || 0}
          </p>
        </div>
      </div>

      {/* Recent tickets preview */}
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Recent Tickets
        </h2>
        <table className="w-full bg-white border border-gray-200 rounded-xl shadow-sm">
          <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
            <tr>
              <th className="py-3 px-4 text-left">Ticket ID</th>
              <th className="py-3 px-4 text-left">Subject</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Last Updated</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {loading && (
              <tr>
                <td colSpan={4} className="py-3 px-4 text-center text-gray-500">
                  Loading tickets...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan={4} className="py-3 px-4 text-center text-red-600">
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && recentTickets.length === 0 && (
              <tr>
                <td colSpan={4} className="py-3 px-4 text-center text-gray-500">
                  No tickets yet
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              recentTickets.map((ticket, idx) => {
                const statusKey = (ticket.status || "").toLowerCase();
                return (
                  <tr key={ticket.id || idx} className="hover:bg-gray-50">
                    <td className="py-3 px-4">#{ticket.id || idx + 1}</td>
                    <td className="py-3 px-4">
                      {ticket.subject || ticket.deviceName || "N/A"}
                    </td>
                    <td
                      className={`py-3 px-4 ${
                        statusColor[statusKey] || "text-gray-700"
                      }`}
                    >
                      {ticket.status || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      {formatDateTime(ticket.lastUpdated)}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
