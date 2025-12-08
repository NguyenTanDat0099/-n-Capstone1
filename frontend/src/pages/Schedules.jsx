import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Schedules() {
  const [schedules, setSchedules] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDaySchedules, setSelectedDaySchedules] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem("user_id"));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    ticketId: "",
    technicianId: userId || "",
    startDate: "",
    endDate: "",
    note: "",
  });

  axios.defaults.baseURL = "http://localhost:5000";

  // Fetch schedules for current month
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const res = await axios.get(`/api/schedules/month/${year}/${month}?userId=${userId}`);
      console.log("📅 Schedules loaded:", res.data);
      setSchedules(res.data || []);
    } catch (err) {
      console.error("Lỗi tải lịch:", err);
    } finally {
      setLoading(false);
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

  // Save schedule (create or update)
  const handleSaveSchedule = async () => {
    if (!formData.ticketId || !formData.startDate || !formData.endDate) {
      alert("⚠️ Vui lòng chọn phiếu, ngày bắt đầu và ngày kết thúc");
      return;
    }

    if (formData.startDate > formData.endDate) {
      alert("⚠️ Ngày bắt đầu phải trước ngày kết thúc");
      return;
    }

    try {
      setSaving(true);
      const ticketIdNum = parseInt(formData.ticketId, 10);
      const technicianIdNum = userId ? parseInt(userId, 10) : (formData.technicianId ? parseInt(formData.technicianId, 10) : null);
      
      if (isNaN(ticketIdNum)) {
        alert("❌ Phiếu không hợp lệ");
        setSaving(false);
        return;
      }
      
      const dataToSave = {
        ticket_id: ticketIdNum,
        technician_id: technicianIdNum,
        startDate: formData.startDate,
        endDate: formData.endDate,
        note: formData.note || "",
      };

      if (editingSchedule) {
        // Update existing schedule
        console.log("[Schedules] Updating schedule:", editingSchedule.id, dataToSave);
        await axios.put(`/api/schedules/update/${editingSchedule.id}`, dataToSave);
        alert("✅ Cập nhật lịch thành công");
      } else {
        // Create new schedule
        console.log("[Schedules] Creating new schedule:", dataToSave);
        await axios.post("/api/schedules/new", dataToSave);
        alert("✅ Tạo lịch thành công");
      }

      // Reset form and refresh schedules
      resetForm();
      await fetchSchedules();
    } catch (err) {
      console.error("Lỗi lưu lịch:", err.response?.data || err.message);
      alert("❌ " + (err.response?.data?.message || err.message || "Lỗi khi lưu lịch"));
    } finally {
      setSaving(false);
    }
  };

  // Delete schedule
  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("🗑️ Bạn chắc chắn muốn xóa lịch này?")) return;

    try {
      await axios.delete(`/api/schedules/${id}`);
      alert("✅ Xóa lịch thành công");
      await fetchSchedules();
      setShowDayModal(false);
    } catch (err) {
      console.error("Lỗi xóa lịch:", err);
      alert("❌ Lỗi khi xóa lịch");
    }
  };

  // Translate status to Vietnamese
  const translateStatus = (status) => {
    const translations = {
      "Pending": "Chờ xử lý",
      "In Progress": "Đang thực hiện",
      "Completed": "Hoàn thành",
      "Cancelled": "Hủy bỏ",
      "Scheduled": "Đã lên lịch",
      "On Hold": "Tạm dừng",
    };
    return translations[status] || status;
  };

  // Translate priority to Vietnamese
  const translatePriority = (priority) => {
    const translations = {
      "Critical": "Khẩn cấp",
      "High": "Cao",
      "Medium": "Trung bình",
      "Low": "Thấp",
    };
    return translations[priority] || priority;
  };

  // Reset form
  const resetForm = () => {
    setShowForm(false);
    setEditingSchedule(null);
    setFormData({
      ticketId: "",
      technicianId: userId || "",
      startDate: "",
      endDate: "",
      note: "",
    });
  };

  // Open edit form
  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      ticketId: schedule.ticket_id,
      technicianId: schedule.technician_id || "",
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      note: schedule.note || "",
    });
    setShowForm(true);
  };

  // Handle day click - show modal with schedules for that day
  const handleDayClick = (dateStr, daySchedules) => {
    setSelectedDate(dateStr);
    setSelectedDaySchedules(daySchedules);
    setShowDayModal(true);
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
      
      // Get schedules that span this date
      const daySchedules = schedules.filter((s) => {
        return dateStr >= s.startDate && dateStr <= s.endDate;
      });

      days.push({ date: dateStr, day, schedules: daySchedules });
    }

    // Split into weeks
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks.map((week, weekIdx) => (
      <div key={weekIdx} className="grid grid-cols-7 gap-2 mb-2">
        {week.map((dayObj, dayIdx) => (
          <div
            key={dayIdx}
            className={`min-h-28 rounded-lg border-2 p-3 transition-all ${
              dayObj
                ? dayObj.schedules.length > 0
                  ? "bg-blue-50 border-blue-400 cursor-pointer hover:shadow-lg hover:bg-blue-100"
                  : "bg-white border-gray-200 cursor-pointer hover:border-gray-300"
                : "bg-gray-100 border-gray-200"
            }`}
            onClick={() => dayObj && handleDayClick(dayObj.date, dayObj.schedules)}
          >
            {dayObj && (
              <>
                {/* Day number */}
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-lg">{dayObj.day}</span>
                  {dayObj.schedules.length > 0 && (
                    <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {dayObj.schedules.length}
                    </span>
                  )}
                </div>

                {/* Schedule items */}
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {dayObj.schedules.slice(0, 3).map((sch) => {
                    const ticket = tickets.find((t) => t.id === sch.ticket_id);
                    const statusColor = {
                      Pending: "bg-yellow-300 text-yellow-900",
                      "In Progress": "bg-blue-300 text-blue-900",
                      Completed: "bg-green-300 text-green-900",
                      Cancelled: "bg-red-300 text-red-900",
                    }[sch.status] || "bg-gray-300 text-gray-900";

                    return (
                      <div
                        key={sch.id}
                        className={`${statusColor} text-xs p-1.5 rounded font-semibold truncate shadow-sm`}
                        title={ticket?.code || "N/A"}
                      >
                        {ticket?.code || "N/A"}
                      </div>
                    );
                  })}
                  {dayObj.schedules.length > 3 && (
                    <div className="text-xs text-gray-600 px-1 font-semibold">
                      +{dayObj.schedules.length - 3} thêm
                    </div>
                  )}
                </div>
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
    <div className="p-6 min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">📅 Lịch Trình Kỹ Thuật Viên</h1>
          <p className="text-gray-600">Quản lý lịch làm việc hàng tháng</p>
        </div>

        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-md">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold transition-all"
          >
            ← Tháng trước
          </button>
          <h2 className="text-3xl font-bold">{monthName}</h2>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold transition-all"
          >
            Tháng sau →
          </button>
        </div>

        {/* Create Button */}
        <div className="mb-6">
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:shadow-lg font-bold text-lg transition-all transform hover:-translate-y-0.5"
          >
            ➕ Thêm Lịch Mới
          </button>
        </div>

        {/* Calendar */}
        <div className="bg-white p-8 rounded-lg shadow-lg">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-4 font-bold">
            {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
              <div key={day} className="text-center py-3 text-sm bg-blue-100 rounded-lg text-blue-900">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {loading ? (
            <div className="text-center py-12 text-gray-600">⏳ Đang tải lịch...</div>
          ) : (
            renderCalendar()
          )}
        </div>
      </div>

      {/* Form Modal - Create/Edit Schedule */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold mb-6">
              {editingSchedule ? "✏️ Sửa Lịch" : "➕ Tạo Lịch Mới"}
            </h3>

            <div className="space-y-4">
              {/* Ticket select */}
              <div>
                <label className="block text-sm font-bold mb-2">Chọn Phiếu</label>
                <select
                  value={formData.ticketId}
                  onChange={(e) => setFormData({ ...formData, ticketId: e.target.value })}
                  className="w-full border-2 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Chọn phiếu --</option>
                  {tickets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.code} - {t.equipment}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-bold mb-2">📅 Ngày Bắt Đầu</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border-2 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-bold mb-2">📅 Ngày Kết Thúc</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full border-2 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-bold mb-2">📝 Ghi Chú</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full border-2 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  rows="3"
                  placeholder="Thêm ghi chú (tuỳ chọn)..."
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleSaveSchedule}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "⏳ Đang lưu..." : "💾 Lưu Lịch"}
              </button>
              {editingSchedule && (
                <button
                  onClick={() => handleDeleteSchedule(editingSchedule.id)}
                  disabled={saving}
                  className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🗑️ Xóa
                </button>
              )}
              <button
                onClick={resetForm}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ❌ Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Day Modal - Show schedules for selected day */}
      {showDayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">
                📋 Lịch ngày {new Date(selectedDate + "T00:00:00").toLocaleDateString("vi-VN")}
              </h3>
              <button
                onClick={() => setShowDayModal(false)}
                className="text-2xl font-bold text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {selectedDaySchedules.length > 0 ? (
              <div className="space-y-4">
                {selectedDaySchedules.map((sch) => {
                  const ticket = tickets.find((t) => t.id === sch.ticket_id);
                  const statusColor = {
                    Pending: "bg-yellow-100 border-yellow-400 text-yellow-900",
                    "In Progress": "bg-blue-100 border-blue-400 text-blue-900",
                    Completed: "bg-green-100 border-green-400 text-green-900",
                    Cancelled: "bg-red-100 border-red-400 text-red-900",
                  }[sch.status] || "bg-gray-100 border-gray-400 text-gray-900";

                  return (
                    <div key={sch.id} className={`border-2 rounded-lg p-4 ${statusColor}`}>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs font-semibold opacity-75">Mã Phiếu</p>
                          <p className="text-lg font-bold">{ticket?.code || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold opacity-75">Trạng Thái</p>
                          <p className="text-lg font-bold">{translateStatus(sch.status)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold opacity-75">Thiết Bị</p>
                          <p className="text-sm">{ticket?.equipment || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold opacity-75">Ưu Tiên</p>
                          <p className="text-sm">{translatePriority(ticket?.priority) || "N/A"}</p>
                        </div>
                      </div>

                      {sch.note && (
                        <div className="mb-3 p-2 bg-white bg-opacity-50 rounded text-sm">
                          <strong>Ghi chú:</strong> {sch.note}
                        </div>
                      )}

                      <div className="mb-3 text-xs opacity-75">
                        📅 {sch.startDate} → {sch.endDate}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            handleEditSchedule(sch);
                            setShowDayModal(false);
                          }}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded font-bold hover:bg-blue-600 transition-all"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(sch.id)}
                          className="px-3 py-2 bg-red-500 text-white rounded font-bold hover:bg-red-600 transition-all"
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                <p className="text-lg">📭 Không có lịch nào trong ngày này</p>
                <button
                  onClick={() => {
                    setShowForm(true);
                    setShowDayModal(false);
                    setFormData({
                      ...formData,
                      startDate: selectedDate,
                      endDate: selectedDate,
                    });
                  }}
                  className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold transition-all"
                >
                  ➕ Tạo lịch mới
                </button>
              </div>
            )}

            <button
              onClick={() => setShowDayModal(false)}
              className="w-full mt-6 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-bold transition-all"
            >
              ✕ Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
