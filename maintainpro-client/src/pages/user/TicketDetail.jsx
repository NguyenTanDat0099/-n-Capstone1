import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API_BASE = "http://localhost:5001";

const toAbsoluteUrl = (url) => {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? url : `/${url}`}`;
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
};

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/tickets/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Không lấy được ticket");
        return res.json();
      })
      .then((data) => {
        let images =
          data.images ||
          data.image_urls ||
          data.imageUrls ||
          data.image_url ||
          data.imageUrl ||
          [];
        if (!Array.isArray(images) && typeof images === "string") {
          images = images
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
        if (!Array.isArray(images)) images = [];

        const normalized = {
          id: data.id,
          subject: data.subject,
          description: data.description,
          deviceName: data.device_name || data.deviceName,
          deviceCategory: data.device_category || data.deviceCategory,
          priority: data.priority,
          status: data.status,
          serviceAddress: data.service_address,
          appointmentTime: data.appointment_time,
          deliveryMethod: data.delivery_method,
          pickupAddress: data.pickup_address,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          images: images.map(toAbsoluteUrl),
        };
        setTicket(normalized);
      })
      .catch((err) => setError(err.message || "Lỗi tải ticket"))
      .finally(() => setLoading(false));
  }, [id]);

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
      <Link to="/tickets" className="text-blue-600 hover:underline block mb-4">
        ← Back to My Tickets
      </Link>

      <div className="bg-white shadow-md rounded-xl p-6 max-w-3xl">
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        {!loading && !error && ticket && (
          <>
            <h1 className="text-3xl font-bold mb-4">Ticket #{ticket.id}</h1>

            <div className="space-y-2">
              <p>
                <strong>Subject:</strong> {ticket.subject || "—"}
              </p>
              <p>
                <strong>Device:</strong> {ticket.deviceName || "—"}
              </p>
              <p className={priorityColor[ticket.priority] || ""}>
                <strong>Priority:</strong> {ticket.priority || "—"}
              </p>
              <p className={statusColor[ticket.status] || ""}>
                <strong>Status:</strong> {ticket.status || "—"}
              </p>
              <p>
                <strong>Created:</strong> {formatDateTime(ticket.createdAt)}
              </p>
              <p>
                <strong>Last Updated:</strong> {formatDateTime(ticket.updatedAt)}
              </p>
            </div>

            {ticket.deviceCategory === "large" && (
              <div className="bg-blue-50 p-4 rounded-lg mt-4 border border-blue-200">
                <h2 className="font-semibold text-blue-700 mb-2">
                  On-site Service Details
                </h2>
                <p>
                  <strong>Address:</strong> {ticket.serviceAddress || "—"}
                </p>
                <p>
                  <strong>Appointment Time:</strong>{" "}
                  {ticket.appointmentTime
                    ? formatDateTime(ticket.appointmentTime)
                    : "—"}
                </p>
              </div>
            )}

            {ticket.deviceCategory === "small" && (
              <div className="bg-green-50 p-4 rounded-lg mt-4 border border-green-200">
                <h2 className="font-semibold text-green-700 mb-2">
                  Delivery Details
                </h2>
                <p>
                  <strong>Delivery Method:</strong>{" "}
                  {ticket.deliveryMethod || "—"}
                </p>
                {ticket.deliveryMethod === "pickup" && (
                  <p>
                    <strong>Pickup Address:</strong>{" "}
                    {ticket.pickupAddress || "—"}
                  </p>
                )}
              </div>
            )}

            <div className="mt-6">
              <h2 className="font-semibold text-lg mb-2">Description</h2>
              <p className="text-gray-700">
                {ticket.description || "No description"}
              </p>
            </div>

            <div className="mt-6">
              <h2 className="font-semibold text-lg mb-2">Images</h2>
              {ticket.images && ticket.images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ticket.images.map((src, idx) => (
                    <img
                      key={idx}
                      src={src}
                      alt={`ticket-${ticket.id}-img-${idx}`}
                      className="w-full h-56 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Ảnh không có</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
