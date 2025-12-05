import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function MyTickets() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [deviceFilter, setDeviceFilter] = useState("All");
  const [tickets, setTickets] = useState([]);

  const formatDateTime = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
  };

  useEffect(() => {
    const userId = 1;
    fetch(`http://localhost:5001/api/tickets/user/${userId}`)
      .then((res) => res.json())
      .then((rows) => {
        const normalized = rows.map((row) => ({
          id: row.id,
          deviceName: row.device_name || row.deviceName,
          deviceCategory: row.device_category || row.deviceCategory,
          subject: row.subject,
          description: row.description,
          priority: row.priority,
          status: row.status,
          serviceAddress: row.service_address,
          appointmentTime: row.appointment_time,
          deliveryMethod: row.delivery_method,
          pickupAddress: row.pickup_address,
          lastUpdated: row.updated_at || row.created_at,
        }));
        setTickets(normalized);
      })
      .catch((err) => console.error(err));
  }, []);

  const filtered = tickets.filter((t) => {
    return (
      (statusFilter === "All" || t.status === statusFilter) &&
      (priorityFilter === "All" || t.priority === priorityFilter) &&
      (deviceFilter === "All" || t.deviceCategory === deviceFilter)
    );
  });

  const priorityColor = {
    High: "text-red-500",
    Medium: "text-yellow-500",
    Low: "text-green-600",
  };

  const statusColor = {
    Open: "text-blue-600",
    "In Progress": "text-orange-500",
    Completed: "text-green-600",
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Tickets</h1>

      <div className="flex gap-4 mb-6">
        <select
          className="border px-3 py-2 rounded-lg"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">Status: All</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          className="border px-3 py-2 rounded-lg"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="All">Priority: All</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          className="border px-3 py-2 rounded-lg"
          value={deviceFilter}
          onChange={(e) => setDeviceFilter(e.target.value)}
        >
          <option value="All">Device: All</option>
          <option value="large">Large Appliance</option>
          <option value="small">Small Electronics</option>
        </select>
      </div>

      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3">Ticket ID</th>
              <th className="px-4 py-3">Device</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last Updated</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((t, idx) => {
              const displayId = idx + 1; // sequential number in current view
              return (
              <tr key={t.id} className="border-t">
                {/* Ticket ID */}
                <td className="px-4 py-3">
                  <div className="font-semibold">#{displayId}</div>
                </td>

                {/* Device */}
                <td className="px-4 py-3">
                  <div className="font-medium">{t.deviceName || "—"}</div>
                </td>

                {/* Priority */}
                <td
                  className={`px-4 py-3 font-medium ${
                    priorityColor[t.priority] || ""
                  }`}
                >
                  {t.priority || "—"}
                </td>

                {/* Status */}
                <td
                  className={`px-4 py-3 font-medium ${
                    statusColor[t.status] || ""
                  }`}
                >
                  {t.status || "—"}
                </td>

                {/* Last Updated */}
                <td className="px-4 py-3">{formatDateTime(t.lastUpdated)}</td>

                {/* Action */}
                <td className="px-4 py-3 text-blue-600">
                  <Link to={`/tickets/${t.id}`} className="hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}
