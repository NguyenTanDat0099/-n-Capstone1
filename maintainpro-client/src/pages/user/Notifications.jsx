import React from "react";

export default function Notifications() {
  const notifs = [
    { id: 1, message: "Ticket #1045 has been assigned to Technician Nguyen Van B.", time: "2h ago" },
    { id: 2, message: "Your ticket #1043 is now completed.", time: "5h ago" },
    { id: 3, message: "Device AC LG-A23 is scheduled for maintenance tomorrow.", time: "1d ago" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">Notifications</h1>
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
        {notifs.map((n) => (
          <div key={n.id} className="border-b last:border-0 py-3">
            <p className="text-gray-700">{n.message}</p>
            <p className="text-xs text-gray-400 mt-1">{n.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
