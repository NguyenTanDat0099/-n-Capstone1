import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Schedules() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem("user_id"));
  const [formData, setFormData] = useState({
    ticket_id: "",
    technician_id: userId || "",
    date: "",
    shift: "Morning",
  });
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  // Setup axios defaults
  axios.defaults.baseURL = "http://localhost:5000";

  // Fetch schedules for current month with userId filter
  const fetchSchedules = async () => {
    try {
      setLoadingSchedules(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const url = `/api/schedules/month/${year}/${month}?userId=${userId}`;
      console.log("Fetching schedules:", url);
      const res = await axios.get(url);
      console.log("Schedules loaded:", res.data);
      setSchedules(res.data || []);
    } catch (err) {
      console.error("Lỗi tải lịch chi tiết:", err.response?.data || err.message);
      alert("Lỗi khi tải lịch trình: " + (err.response?.data?.message || err.message));
    } finally {
      setLoadingSchedules(false);
    }
  };

  // Fetch all tickets
  const fetchTickets = async () => {
    try {
      const res = await axios.get("/api/tickets");
      setTickets(res.data || []);
    } catch (err) {
      console.error("Lỗi tải phiếu:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchSchedules();
    }
  }, [currentMonth, userId]);

  // Create/Update schedule
  const handleSaveSchedule = async () => {
    if (!formData.ticket_id || !formData.date) {
      alert("Vui lòng chọn phiếu và ngày");
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        technician_id: userId || formData.technician_id,
      };

      if (editingSchedule) {
        // Update
        console.log("Updating schedule:", editingSchedule.id, dataToSave);
        await axios.put(`/api/schedules/${editingSchedule.id}`, dataToSave);
        console.log("✅ Cập nhật lịch thành công");
        alert("✅ Cập nhật lịch thành công");
      } else {
        // Create
        console.log("Creating schedule:", dataToSave);
        await axios.post("/api/schedules", dataToSave);
        console.log("✅ Tạo lịch thành công");
        alert("✅ Tạo lịch thành công");
      }
      setShowForm(false);
      setEditingSchedule(null);
      setFormData({ ticket_id: "", technician_id: userId || "", date: "", shift: "Morning" });
      // Refresh schedules immediately
      await fetchSchedules();
    } catch (err) {
      console.error("Lỗi chi tiết:", err.response?.data || err.message);
      alert("❌ Lỗi khi lưu lịch: " + (err.response?.data?.message || err.message));
    }
  };

  // Delete schedule
  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa lịch này?")) return;

    try {
      await axios.delete(`/api/schedules/${id}`);
      console.log("✅ Xóa lịch thành công");
      alert("✅ Xóa lịch thành công");
      // Refresh schedules immediately
      await fetchSchedules();
    } catch (err) {
      console.error("Lỗi:", err);
      alert("❌ Lỗi khi xóa lịch");
    }
  };

  // Open edit form
  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      ticket_id: schedule.ticket_id,
      technician_id: schedule.technician_id || "",
      date: schedule.date,
      shift: schedule.shift,
    });
    setShowForm(true);
  };

  // Open create form
  const handleNewSchedule = () => {
    setEditingSchedule(null);
    setFormData({ ticket_id: "", technician_id: "", date: "", shift: "Morning" });
    setShowForm(true);
  };

  // Render calendar
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay();

    const days = [];
    const weeks = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startDate; i++) {
      days.push(null);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const daySchedules = schedules.filter((s) => s.date === dateStr);
      days.push({ date: dateStr, day, schedules: daySchedules });
    }

    // Split into weeks
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks.map((week, weekIdx) => (
      <div key={weekIdx} className="grid grid-cols-7 gap-1 mb-1">
        {week.map((dayObj, dayIdx) => (
          <div
            key={dayIdx}
            className={`border rounded p-2 min-h-24 ${
              dayObj
                ? "bg-white cursor-pointer hover:bg-gray-50"
                : "bg-gray-100"
            }`}
          >
            {dayObj && (
              <>
                <div className="flex justify-between items-center mb-1">
                  <div className="font-bold text-sm">{dayObj.day}</div>
                  {dayObj.schedules.length > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {dayObj.schedules.length}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {dayObj.schedules.slice(0, 2).map((sch) => {
                    const ticket = tickets.find((t) => t.id === sch.ticket_id);
                    const statusColor = {
                      Pending: "bg-yellow-200",
                      "In Progress": "bg-blue-200",
                      Completed: "bg-green-200",
                      Cancelled: "bg-red-200",
                    }[sch.ticket_status] || "bg-gray-200";

                    return (
                      <div
                        key={sch.id}
                        onClick={() => navigate(`/tickets/${sch.ticket_id}`)}
                        className={`${statusColor} text-xs p-1 rounded cursor-pointer hover:opacity-80 truncate`}
                        title={`${ticket?.code || "N/A"} - ${sch.shift}`}
                      >
                        {ticket?.code || "N/A"}
                      </div>
                    );
                  })}
                  {dayObj.schedules.length > 2 && (
                    <div className="text-xs text-gray-600">
                      +{dayObj.schedules.length - 2} thêm
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleNewSchedule()}
                  className="text-xs text-blue-500 mt-1 hover:underline"
                  title="Thêm lịch"
                >
                  +
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    ));
  };

  const monthName = currentMonth.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">📅 Lịch Trình</h1>

      {/* Month Navigation */}
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded shadow">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ← Tháng trước
        </button>
        <h2 className="text-2xl font-bold">{monthName}</h2>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tháng sau →
        </button>
      </div>

      {/* Create Button */}
      <div className="mb-6">
        <button
          onClick={handleNewSchedule}
          className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-bold"
        >
          ➕ Thêm Lịch Mới
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white p-4 rounded shadow mb-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2 font-bold">
          {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
            <div key={day} className="text-center py-2 text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loadingSchedules ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : (
          renderCalendar()
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">
              {editingSchedule ? "Sửa Lịch" : "Tạo Lịch Mới"}
            </h3>

            <div className="space-y-4">
              {/* Ticket select */}
              <div>
                <label className="block text-sm font-bold mb-2">Chọn Phiếu</label>
                <select
                  value={formData.ticket_id}
                  onChange={(e) => setFormData({ ...formData, ticket_id: parseInt(e.target.value) })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">-- Chọn phiếu --</option>
                  {tickets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.code} - {t.equipment}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-bold mb-2">Ngày</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* Shift */}
              <div>
                <label className="block text-sm font-bold mb-2">Ca</label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Morning">Sáng (6-12)</option>
                  <option value="Afternoon">Chiều (12-18)</option>
                  <option value="Evening">Tối (18-22)</option>
                  <option value="Night">Đêm (22-6)</option>
                </select>
              </div>

              {/* Technician ID */}
              <div>
                <label className="block text-sm font-bold mb-2">ID Kỹ Thuật Viên (tuỳ chọn)</label>
                <input
                  type="number"
                  value={formData.technician_id}
                  onChange={(e) => setFormData({ ...formData, technician_id: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Nhập ID"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveSchedule}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-bold"
              >
                💾 Lưu
              </button>
              {editingSchedule && (
                <button
                  onClick={() => handleDeleteSchedule(editingSchedule.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 font-bold"
                >
                  🗑️ Xóa
                </button>
              )}
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingSchedule(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 font-bold"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
