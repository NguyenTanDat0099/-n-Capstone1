import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:5001";

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
};

export default function MyDevices() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = 1; // TODO: replace with authenticated user id
    setLoading(true);
    fetch(`${API_BASE}/api/tickets/user/${userId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not load devices");
        return res.json();
      })
      .then((rows) => {
        const normalized = rows.map((row) => ({
          id: row.id,
          deviceName: row.device_name || row.deviceName,
          deviceCategory: row.device_category || row.deviceCategory,
          status: row.status,
          lastUpdated: row.updated_at || row.created_at,
          subject: row.subject,
        }));
        setTickets(normalized);
        setError("");
      })
      .catch((err) => setError(err.message || "Failed to load devices"))
      .finally(() => setLoading(false));
  }, []);

  // Latest ticket per device
  const devices = useMemo(() => {
    const map = new Map();
    tickets.forEach((t) => {
      const key = (t.deviceName || "Unknown device").toLowerCase();
      const existing = map.get(key) || {
        deviceName: t.deviceName || "Unknown device",
        deviceCategory: t.deviceCategory || "N/A",
        lastStatus: t.status || "N/A",
        lastUpdated: t.lastUpdated,
        lastSubject: t.subject,
        ticketId: t.id,
      };

      const isNewer =
        !existing.lastUpdated ||
        new Date(t.lastUpdated || 0) > new Date(existing.lastUpdated || 0);

      if (isNewer) {
        map.set(key, {
          deviceName: t.deviceName || "Unknown device",
          deviceCategory: t.deviceCategory || "N/A",
          lastStatus: t.status || "N/A",
          lastUpdated: t.lastUpdated,
          lastSubject: t.subject,
          ticketId: t.id,
        });
      } else {
        map.set(key, existing);
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0)
    );
  }, [tickets]);

  // Map ticket id to sequential index to match MyTickets numbering
  const ticketIndexMap = useMemo(() => {
    const map = new Map();
    tickets.forEach((t, idx) => map.set(t.id, idx + 1));
    return map;
  }, [tickets]);

  const statusColor = {
    open: "text-blue-600",
    "in progress": "text-orange-500",
    completed: "text-green-600",
    pending: "text-yellow-600",
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Devices</h1>
          <p className="text-gray-500">Device overview and latest tickets</p>
        </div>
        <Link
          to="/tickets"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow"
        >
          View Tickets
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 text-center text-gray-500">
            Loading devices...
          </div>
        )}

        {!loading && error && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 text-center text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && devices.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 text-center text-gray-500">
            No devices yet
          </div>
        )}

        {!loading &&
          !error &&
          devices.map((d, idx) => {
            const statusKey = (d.lastStatus || "").toLowerCase();
            const displayTicketNumber =
              ticketIndexMap.get(d.ticketId) || d.ticketId || idx + 1;
            return (
              <div
                key={d.deviceName + idx}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-gray-500">Device</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {d.deviceName || "Unknown device"}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      statusColor[statusKey] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {d.lastStatus || "N/A"}
                  </span>
                </div>

                <div className="text-sm text-gray-500">
                  Category:{" "}
                  <span className="text-gray-800">{d.deviceCategory || "N/A"}</span>
                </div>

                <div className="text-sm text-gray-500">
                  Last ticket:{" "}
                  {d.lastSubject ? (
                    <span className="text-gray-800 font-medium">
                      #{displayTicketNumber} - {d.lastSubject}
                    </span>
                  ) : (
                    "N/A"
                  )}
                </div>

                <div className="text-sm text-gray-500">
                  Updated:{" "}
                  <span className="text-gray-800">
                    {formatDateTime(d.lastUpdated)}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
