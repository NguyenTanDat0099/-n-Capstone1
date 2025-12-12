import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import NotificationBell from "../components/NotificationBell";

// Set API base once
axios.defaults.baseURL = "http://localhost:5000";

export default function Dashboard() {
  const navigate = useNavigate();

  // Theme and user state
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [userId, setUserId] = useState(localStorage.getItem("user_id"));

  // NEW: list of technicians
  const technicians = [
    { id: 1, name: "Tech User" },
    { id: 2, name: "Kỹ thuật viên 1" },
    { id: 3, name: "Kỹ thuật viên 2" },
    { id: 4, name: "Kỹ thuật viên 3" },
  ];

  // data
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // filters for ticket list (advanced search)
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterDueDate, setFilterDueDate] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // UI / form
  const [notes, setNotes] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTicket, setNewTicket] = useState({
    code: "",
    equipment: "",
    priority: "Medium",
    status: "Pending",
    due_date: "",
    location: "",
    notes: "",
    assigned_to: "", // NEW
    description: "", // NEW
  });

  // attachment upload state
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState("");
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // calendar
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0,10));
  const [calendarView, setCalendarView] = useState("month"); // "month" | "week"

  // drag state for calendar reschedule
  const [draggingTicketId, setDraggingTicketId] = useState(null);

  // confirm modal
  const [confirmModal, setConfirmModal] = useState({ open: false, title: "", message: "", onConfirm: null });
  const openConfirm = (title, message, onConfirm) => setConfirmModal({ open: true, title, message, onConfirm });
  const closeConfirm = () => setConfirmModal({ open: false, title: "", message: "", onConfirm: null });

  // helpers: iso date
  const toISODate = (d) => {
    if (!d) return "";
    const date = new Date(d);
    if (isNaN(date)) return d;
    return date.toISOString().slice(0, 10);
  };

  // fetch tickets
  const fetchTickets = async () => {
    try {
      const res = await axios.get("/api/tickets");
      setTickets(res.data || []);
      // keep selection if exists
      if (selectedTicket) {
        const found = (res.data || []).find(t => String(t.id) === String(selectedTicket.id));
        if (found) {
          setSelectedTicket(found);
          setNotes(found.notes || "");
        } else {
          setSelectedTicket(null);
          setNotes("");
        }
      } else if (res.data && res.data.length > 0) {
        setSelectedTicket(res.data[0]);
        setNotes(res.data[0].notes || "");
      }
    } catch (err) {
      console.error("fetchTickets error", err.response || err);
      alert("Không thể tải phiếu từ server. Hãy kiểm tra backend.");
    }
  };

  useEffect(() => {
    // set auth header if token exists
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calendar building
  const buildMonthDays = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const total = new Date(year, month + 1, 0).getDate();
    return Array.from({length: total}, (_, i) => new Date(year, month, i+1));
  };

  const buildWeekDays = (anchorIso) => {
    const base = new Date(anchorIso || new Date().toISOString().slice(0,10));
    if (isNaN(base)) return [];
    const day = base.getDay(); // 0=Sun .. 6=Sat
    const diffToMonday = (day + 6) % 7; // 0 nếu Mon
    const monday = new Date(base);
    monday.setDate(base.getDate() - diffToMonday);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const days = useMemo(() => {
    if (calendarView === "week") {
      return buildWeekDays(selectedDate);
    }
    return buildMonthDays(calendarMonth);
  }, [calendarView, calendarMonth, selectedDate]);

  // tasks per day
  const tasksForSelectedDate = tickets.filter(t => toISODate(t.due_date || t.dueDate || t.due) === selectedDate);

  // helper: check overdue (due_date < today)
  const isOverdue = (ticket) => {
    const iso = toISODate(ticket.due_date || ticket.dueDate || ticket.due);
    if (!iso) return false;
    const today = new Date().toISOString().slice(0, 10);
    return iso < today;
  };

  // Helper: translate status to Vietnamese
  const translateStatus = (status) => {
    const map = {
      "Pending": "Chờ xử lý",
      "In Progress": "Đang thực hiện",
      "Completed": "Hoàn thành",
      "On Hold": "Tạm dừng",
      "Cancelled": "Đã hủy",
    };
    return map[status] || status;
  };

  // Helper: translate priority to Vietnamese
  const translatePriority = (priority) => {
    const map = {
      "Critical": "Khẩn cấp",
      "High": "Cao",
      "Medium": "Trung bình",
      "Low": "Thấp",
    };
    return map[priority] || priority;
  };

  // Helper: get status color
  const getStatusColor = (status) => {
    switch(status) {
      case "In Progress": return "bg-yellow-100 text-yellow-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Pending": return "bg-gray-100 text-gray-800";
      case "Cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Helper: get priority color
  const getPriorityColor = (priority) => {
    switch(priority) {
      case "Critical": return "bg-red-100 text-red-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Medium": return "bg-blue-100 text-blue-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Convert Vietnamese to English (for backend)
  const statusViToEn = (viStatus) => {
    const map = {
      "Chờ xử lý": "Pending",
      "Đang thực hiện": "In Progress",
      "Hoàn thành": "Completed",
      "Tạm dừng": "On Hold",
      "Đã hủy": "Cancelled",
      "Hủy bỏ": "Cancelled",
    };
    return map[viStatus] || viStatus;
  };

  const priorityViToEn = (viPriority) => {
    const map = {
      "Khẩn cấp": "Critical",
      "Cao": "High",
      "Trung bình": "Medium",
      "Thấp": "Low",
    };
    return map[viPriority] || viPriority;
  };

  // state for updating tickets inline
  const [updating, setUpdating] = useState(null);

  // status statistics
  const statusStats = useMemo(() => {
    const pending = tickets.filter(t => t.status === "Pending").length;
    const inProgress = tickets.filter(t => t.status === "In Progress").length;
    const completed = tickets.filter(t => t.status === "Completed").length;
    return { pending, inProgress, completed };
  }, [tickets]);

  // Handle inline status update
  const handleStatusChange = async (ticketId, newStatus) => {
    setUpdating(ticketId);
    try {
      const enStatus = statusViToEn(newStatus);
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}`, { status: enStatus });
      // Update local state
      setTickets(tickets.map(t => t.id === ticketId ? {...t, status: enStatus} : t));
    } catch (err) {
      console.error("Error updating status:", err);
      alert("❌ Lỗi cập nhật trạng thái: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(null);
    }
  };

  // Handle inline priority update
  const handlePriorityChange = async (ticketId, newPriority) => {
    setUpdating(ticketId);
    try {
      const enPriority = priorityViToEn(newPriority);
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}`, { priority: enPriority });
      // Update local state
      setTickets(tickets.map(t => t.id === ticketId ? {...t, priority: enPriority} : t));
    } catch (err) {
      console.error("Error updating priority:", err);
      alert("❌ Lỗi cập nhật ưu tiên: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(null);
    }
  };

  // filtered tickets for list view (search + filters)
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const code = (t.code || t.id || "").toString().toLowerCase();
      const equipment = (t.equipment || "").toString().toLowerCase();
      const search = filterSearch.trim().toLowerCase();

      if (search && !code.includes(search) && !equipment.includes(search)) {
        return false;
      }

      if (filterStatus !== "all" && (t.status || "") !== filterStatus) {
        return false;
      }

      if (filterPriority !== "all" && (t.priority || "") !== filterPriority) {
        return false;
      }

      if (filterDueDate) {
        const ticketDate = toISODate(t.due_date || t.dueDate || t.due);
        if (ticketDate !== filterDueDate) return false;
      }

      return true;
    });
  }, [tickets, filterSearch, filterStatus, filterPriority, filterDueDate, toISODate]);

  // reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterSearch, filterStatus, filterPriority, filterDueDate]);

  // pagination over filtered tickets
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, currentPage, pageSize]);

  // ===== SINGLE handleSelectTicket definition (define ONCE here) =====
  const handleSelectTicket = (ticket) => {
    if (!ticket) {
      setSelectedTicket(null);
      setNotes("");
      return;
    }
    setSelectedTicket(ticket);
    setNotes(ticket.notes || "");
    // set preview from ticket attachment_url if exists
    if (ticket.attachment_url) {
      setAttachmentPreview(`http://localhost:5000${ticket.attachment_url}`);
    } else {
      setAttachmentPreview("");
    }
    setAttachmentFile(null);
  };

  // create
  const handleCreateTicket = async () => {
    if (!newTicket.code.trim() || !newTicket.equipment.trim()) return alert("Mã và Thiết bị là bắt buộc");
    try {
      const res = await axios.post("/api/tickets/create", newTicket);
      if (res.data?.id) {
        await fetchTickets();
        setShowNewForm(false);
        setNewTicket({ code: "", equipment: "", priority: "Medium", status: "Pending", due_date: "", location: "", notes: "" });
        if (newTicket.due_date) setSelectedDate(newTicket.due_date);
        return alert("Đã tạo phiếu");
      }
      alert("Tạo thất bại");
    } catch (err) {
      console.error("create error", err.response || err);
      alert(err.response?.data?.message || "Lỗi tạo phiếu");
    }
  };

  // update
  const handleUpdateTicket = async () => {
    if (!selectedTicket || !selectedTicket.id) return alert("Chưa chọn phiếu");
    const ticketId = selectedTicket.id;
    const payload = {
      ...selectedTicket,
      status: statusViToEn(selectedTicket.status),
      priority: priorityViToEn(selectedTicket.priority),
      notes
    };
    try {
      await axios.put(`/api/tickets/${ticketId}`, payload);
      await fetchTickets();
      if (payload.due_date) setSelectedDate(payload.due_date);
      return alert("✅ Cập nhật thành công");
    } catch (err) {
      console.error("update error", err.response || err);
      alert("❌ " + (err.response?.data?.message || "Lỗi cập nhật"));
    }
  };

  // attachment upload handlers
  const handleAttachmentChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setAttachmentFile(file);
    try {
      const url = URL.createObjectURL(file);
      setAttachmentPreview(url);
    } catch {
      // ignore preview errors
      setAttachmentPreview("");
    }
  };

  const handleUploadAttachment = async () => {
    if (!selectedTicket || !selectedTicket.id) return alert("Chưa chọn phiếu");
    if (!attachmentFile) return alert("Chưa chọn file để upload");

    const ticketId = selectedTicket.id;
    const formData = new FormData();
    formData.append("file", attachmentFile);

    setUploadingAttachment(true);
    try {
      const res = await axios.post(`/api/tickets/${ticketId}/attachment`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const fileUrl = res.data?.url ? `http://localhost:5000${res.data.url}` : "";
      if (fileUrl) {
        setAttachmentPreview(fileUrl);
      }
      await fetchTickets();
      alert("Tải file đính kèm thành công");
    } catch (err) {
      console.error("upload attachment error", err.response || err);
      alert(err.response?.data?.message || "Lỗi upload file đính kèm");
    } finally {
      setUploadingAttachment(false);
    }
  };

  // delete ticket
  const doDeleteTicket = async (ticketId) => {
    closeConfirm();
    if (!ticketId) return;
    try {
      await axios.delete(`/api/tickets/${ticketId}`);
      await fetchTickets();
      setSelectedTicket(null);
      return alert("Đã xóa");
    } catch (err) {
      console.error("delete error", err.response || err);
      alert(err.response?.data?.message || "Lỗi xóa");
    }
  };

  const deleteTicketById = (ticketId) => {
    openConfirm("Xóa phiếu", "Bạn có chắc chắn muốn xóa phiếu này? Hành động không thể hoàn tác.", () => doDeleteTicket(ticketId));
  };

  // notes save/delete
  const handleSaveNote = async () => {
    if (!selectedTicket || !selectedTicket.id) return alert("Chưa chọn phiếu");
    const ticketId = selectedTicket.id;
    try {
      await axios.post(`/api/tickets/${ticketId}/notes`, { notes });
      await fetchTickets();
      return alert("Ghi chú đã lưu");
    } catch (err) {
      console.error("save note", err.response || err);
      alert(err.response?.data?.message || "Lỗi lưu ghi chú");
    }
  };

  // delete note
  const doDeleteNote = async (ticketId) => {
    closeConfirm();
    if (!ticketId) return;
    try {
      await axios.delete(`/api/tickets/${ticketId}/notes`);
      await fetchTickets();
      setNotes("");
      return alert("Ghi chú đã xóa");
    } catch (err) {
      console.error("delete note", err.response || err);
      alert(err.response?.data?.message || "Lỗi xóa ghi chú");
    }
  };
  const handleDeleteNote = () => {
    if (!selectedTicket || !selectedTicket.id) return alert("Chưa chọn phiếu");
    openConfirm("Xóa ghi chú", "Bạn có chắc chắn muốn xóa ghi chú?", () => doDeleteNote(selectedTicket.id));
  };

  // select date/day click
  const handleSelectDate = (date) => {
    const iso = toISODate(date);
    setSelectedDate(iso);
    const dayTasks = tickets.filter(t => toISODate(t.due_date || t.dueDate || t.due) === iso);
    if (dayTasks.length) handleSelectTicket(dayTasks[0]);
    else {
      setSelectedTicket(null);
      setNotes("");
    }
  };

  // drag handlers for calendar reschedule
  const handleDragStart = (e, ticket) => {
    setDraggingTicketId(ticket.id);
    try {
      e.dataTransfer.setData("text/plain", String(ticket.id));
    } catch {
      // ignore if not supported
    }
  };

  const handleDragEnd = () => {
    setDraggingTicketId(null);
  };

  const handleDropOnDate = async (e, date) => {
    e.preventDefault();
    const iso = toISODate(date);
    if (!iso) return;

    let ticketId = draggingTicketId;
    try {
      const dataId = e.dataTransfer.getData("text/plain");
      if (dataId) ticketId = dataId;
    } catch {
      // ignore
    }
    if (!ticketId) return;

    const ticket = tickets.find(t => String(t.id) === String(ticketId));
    if (!ticket) return;

    try {
      await axios.put(`/api/tickets/${ticketId}`, { ...ticket, due_date: iso });
      await fetchTickets();
      setSelectedDate(iso);
    } catch (err) {
      console.error("Reschedule error", err.response || err);
      alert(err.response?.data?.message || "Lỗi khi đổi ngày hạn");
    }
  };

  // NEW: AI Chat state
  const [aiMessages, setAiMessages] = useState([
    { role: "ai", text: "Xin chào! Tôi là trợ lý bảo trì. Hỏi tôi bất cứ điều gì về sửa chữa thiết bị." }
  ]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const aiMessagesEndRef = React.useRef(null);

  // scroll to bottom when new message
  React.useEffect(() => {
    aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  // NEW: Ask AI function
  const askAI = async (e) => {
    e?.preventDefault?.();
    if (!aiInput.trim()) return;

    const userMsg = aiInput;
    setAiInput("");

    // add user message to UI
    setAiMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setAiLoading(true);

    try {
      // prepare context from selected ticket if available
      let ticketContext = "";
      if (selectedTicket) {
        ticketContext = `Phiếu công việc: ${selectedTicket.code}\nThiết bị: ${selectedTicket.equipment}\nMô tả: ${selectedTicket.description || "N/A"}\nTrạng thái: ${selectedTicket.status}`;
      }

      const res = await axios.post("/api/assistant/ask", {
        question: userMsg,
        ticketContext: ticketContext || undefined,
      });

      const aiAnswer = res.data?.answer || "Không nhận được phản hồi từ AI";
      setAiMessages(prev => [...prev, { role: "ai", text: aiAnswer }]);
    } catch (err) {
      console.error("askAI error", err);
      const errorMsg = err.response?.data?.message || "Lỗi kết nối với AI";
      setAiMessages(prev => [...prev, { role: "ai", text: `❌ ${errorMsg}` }]);
    } finally {
      setAiLoading(false);
    }
  };

  // render
  return (
    <div className="min-h-screen w-full">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">🔧 MaintainPro — Bảng điều khiển Kỹ thuật viên</h1>
          <div className="flex items-center gap-2">
            <NotificationBell userId={userId} darkMode={darkMode} />
            <img src="https://i.pravatar.cc/40" alt="avatar" className="rounded-full w-10 h-10" />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left: Tickets list and calendar */}
          <div className="col-span-7">
            <div className="bg-white rounded-lg shadow p-5 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Phiếu công việc được giao</h3>
                <div className="flex gap-2">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={() => setShowNewForm(s => !s)}>{showNewForm ? "Hủy" : "Tạo phiếu"}</button>
                </div>
              </div>

              {showNewForm && (
                <div className="bg-gray-50 p-4 rounded mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input className="p-2 border rounded" placeholder="Mã phiếu" value={newTicket.code} onChange={e => setNewTicket({...newTicket, code: e.target.value})} />
                    <input className="p-2 border rounded" placeholder="Thiết bị" value={newTicket.equipment} onChange={e => setNewTicket({...newTicket, equipment: e.target.value})} />
                    <select className="p-2 border rounded" value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value})}><option value="High">Cao</option><option value="Medium">Trung bình</option><option value="Low">Thấp</option><option value="Critical">Khẩn cấp</option></select>
                    <select className="p-2 border rounded" value={newTicket.status} onChange={e => setNewTicket({...newTicket, status: e.target.value})}><option value="Pending">Chờ xử lý</option><option value="In Progress">Đang xử lý</option><option value="Completed">Hoàn thành</option><option value="On Hold">Tạm dừng</option><option value="Cancelled">Đã hủy</option></select>
                    <input type="date" className="p-2 border rounded" value={newTicket.due_date} onChange={e => setNewTicket({...newTicket, due_date: e.target.value})} />
                    <input className="p-2 border rounded" placeholder="Vị trí" value={newTicket.location} onChange={e => setNewTicket({...newTicket, location: e.target.value})} />
                    {/* NEW: assign technician + description */}
                    <select className="p-2 border rounded" value={newTicket.assigned_to} onChange={e => setNewTicket({...newTicket, assigned_to: e.target.value})}><option value="">-- Chọn KTV --</option>{technicians.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}</select>
                    <input className="p-2 border rounded" placeholder="Mô tả công việc" value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleCreateTicket}>Tạo</button>
                  </div>
                </div>
              )}

              {/* Status summary cards */}
              <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2">
                  <div>
                    <div className="text-xs uppercase text-yellow-700 font-semibold">PENDING</div>
                    <div className="text-lg font-bold text-yellow-900">{statusStats.pending}</div>
                  </div>
                  <span className="text-xl">⏳</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                  <div>
                    <div className="text-xs uppercase text-blue-700 font-semibold">IN PROGRESS</div>
                    <div className="text-lg font-bold text-blue-900">{statusStats.inProgress}</div>
                  </div>
                  <span className="text-xl">🔧</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                  <div>
                    <div className="text-xs uppercase text-green-700 font-semibold">COMPLETED</div>
                    <div className="text-lg font-bold text-green-900">{statusStats.completed}</div>
                  </div>
                  <span className="text-xl">✅</span>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                <input
                  className="p-2 border rounded"
                  placeholder="Tìm theo mã / thiết bị..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                />
                <select
                  className="p-2 border rounded"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="Pending">Chờ xử lý</option>
                  <option value="In Progress">Đang thực hiện</option>
                  <option value="Completed">Hoàn thành</option>
                </select>
                <select
                  className="p-2 border rounded"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="all">Tất cả ưu tiên</option>
                  <option value="High">Cao</option>
                  <option value="Medium">Trung bình</option>
                  <option value="Low">Thấp</option>
                </select>
                <input
                  type="date"
                  className="p-2 border rounded"
                  value={filterDueDate}
                  onChange={(e) => setFilterDueDate(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Mã</th>
                      <th className="p-2 text-left">Thiết bị</th>
                      <th className="p-2 text-left">Ưu tiên</th>
                      <th className="p-2 text-left">Trạng thái</th>
                      <th className="p-2 text-left">Ngày hạn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTickets.map(t => {
                      const overdue = isOverdue(t);
                      const isSelected = selectedTicket?.id === t.id;
                      const rowBase = overdue ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50";
                      const rowSelected = isSelected ? "ring-1 ring-blue-400" : "";
                      return (
                      <tr
                        key={t.id}
                        className={`border-t cursor-pointer ${rowBase} ${rowSelected}`}
                        onClick={() => handleSelectTicket(t)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, t)}
                        onDragEnd={handleDragEnd}
                      >
                        <td className="p-2">{t.code || t.id}</td>
                        <td className="p-2">{t.equipment}</td>
                        <td className="p-2">
                          <select 
                            className={`text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer ${getPriorityColor(t.priority)}`}
                            value={t.priority} 
                            onChange={(e) => handlePriorityChange(t.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            disabled={updating === t.id}
                          >
                            <option value="Critical">Khẩn cấp</option>
                            <option value="High">Cao</option>
                            <option value="Medium">Trung bình</option>
                            <option value="Low">Thấp</option>
                          </select>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <select 
                              className={`text-xs font-medium px-2 py-1 rounded border-0 cursor-pointer ${getStatusColor(t.status)}`}
                              value={t.status} 
                              onChange={(e) => handleStatusChange(t.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              disabled={updating === t.id}
                            >
                              <option value="Pending">Chờ xử lý</option>
                              <option value="In Progress">Đang thực hiện</option>
                              <option value="Completed">Hoàn thành</option>
                              <option value="Cancelled">Hủy bỏ</option>
                            </select>
                            {overdue && (
                              <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                                Quá hạn
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-2">{toISODate(t.due_date || t.dueDate || t.due)}</td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                <div>
                  Trang <span className="font-semibold">{currentPage}</span> / <span className="font-semibold">{totalPages}</span>
                  {" · "}
                  Tổng <span className="font-semibold">{filteredTickets.length}</span> phiếu
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 rounded border bg-white disabled:opacity-40"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>
                  <button
                    className="px-3 py-1 rounded border bg-white disabled:opacity-40"
                    disabled={currentPage === totalPages || filteredTickets.length === 0}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="bg-white rounded-lg shadow p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold">Lịch {calendarView === "week" ? "tuần" : "tháng"}</h4>
                  <div className="flex rounded-full border bg-gray-50 text-xs overflow-hidden">
                    <button
                      type="button"
                      className={`px-3 py-1 ${calendarView === "week" ? "bg-white text-blue-600 font-semibold" : "text-gray-600"}`}
                      onClick={() => setCalendarView("week")}
                    >
                      Week
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1 ${calendarView === "month" ? "bg-white text-blue-600 font-semibold" : "text-gray-600"}`}
                      onClick={() => setCalendarView("month")}
                    >
                      Month
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() => {
                      if (calendarView === "month") {
                        setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth()-1, 1));
                      } else {
                        const d = new Date(selectedDate);
                        d.setDate(d.getDate() - 7);
                        setSelectedDate(toISODate(d));
                      }
                    }}
                    className="px-2"
                  >
                    ‹
                  </button>
                  <div>
                    {calendarView === "month"
                      ? calendarMonth.toLocaleString(undefined,{month:'long', year:'numeric'})
                      : (() => {
                          const weekDays = days;
                          if (!weekDays.length) return "";
                          const start = weekDays[0];
                          const end = weekDays[weekDays.length - 1];
                          return `${start.toLocaleDateString(undefined, { day: "numeric", month: "short" })} - ${end.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`;
                        })()
                    }
                  </div>
                  <button
                    onClick={() => {
                      if (calendarView === "month") {
                        setCalendarMonth(m => new Date(m.getFullYear(), m.getMonth()+1, 1));
                      } else {
                        const d = new Date(selectedDate);
                        d.setDate(d.getDate() + 7);
                        setSelectedDate(toISODate(d));
                      }
                    }}
                    className="px-2"
                  >
                    ›
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-sm">
                {days.map(d => {
                  const iso = toISODate(d);
                  const hasTask = tickets.some(t => toISODate(t.due_date || t.dueDate || t.due) === iso);
                  const active = selectedDate === iso;
                  return (
                    <button
                      key={iso}
                      onClick={() => handleSelectDate(d)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropOnDate(e, d)}
                      className={`p-2 rounded border ${active ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 hover:bg-gray-200 border-transparent"}`}
                    >
                      <div>{d.getDate()}</div>
                      {hasTask && <div className="mx-auto mt-1 w-2 h-2 rounded-full bg-blue-700"></div>}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-[11px] text-gray-400 text-center">
                Kéo một phiếu từ bảng và thả vào ngày trong lịch để đổi <span className="font-semibold">ngày hạn</span>.
              </p>
            </div>
          </div>

          {/* Right: Ticket detail + AI */}
          <div className="col-span-5 space-y-6">
            <div className="bg-white rounded-lg shadow p-5">
              <h3 className="font-semibold mb-3">Chi tiết phiếu</h3>
              {!selectedTicket ? (
                <div className="text-sm text-gray-500">Chọn một phiếu để xem chi tiết</div>
              ) : (
                <>
                  <div className="space-y-3">
                    <input className="w-full p-2 border rounded" value={selectedTicket.equipment || ""} onChange={e => setSelectedTicket({...selectedTicket, equipment: e.target.value})} placeholder="Thiết bị" />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <input className="p-2 border rounded" value={selectedTicket.priority || ""} onChange={e => setSelectedTicket({...selectedTicket, priority: e.target.value})} placeholder="Độ ưu tiên" />
                      <input className="p-2 border rounded" value={selectedTicket.status || ""} onChange={e => setSelectedTicket({...selectedTicket, status: e.target.value})} placeholder="Trạng thái" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <input type="date" className="p-2 border rounded" value={selectedTicket.due_date || ""} onChange={e => setSelectedTicket({...selectedTicket, due_date: e.target.value})} />
                      <input className="p-2 border rounded" value={selectedTicket.location || ""} onChange={e => setSelectedTicket({...selectedTicket, location: e.target.value})} placeholder="Vị trí" />
                    </div>

                    {/* NEW: assigned technician + work description */}
                    <select className="w-full p-2 border rounded" value={selectedTicket.assigned_to || ""} onChange={e => setSelectedTicket({...selectedTicket, assigned_to: e.target.value})}>
                      <option value="">-- Chọn KTV --</option>
                      {technicians.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                    </select>

                    <textarea className="w-full p-2 border rounded" rows="2" value={selectedTicket.description || ""} onChange={e => setSelectedTicket({...selectedTicket, description: e.target.value})} placeholder="Mô tả công việc cần làm..."></textarea>

                    {/* Attachment upload */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleAttachmentChange}
                          className="block w-full text-xs text-gray-700 file:mr-2 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <button
                          type="button"
                          onClick={handleUploadAttachment}
                          disabled={uploadingAttachment || !attachmentFile}
                          className="whitespace-nowrap rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          {uploadingAttachment ? "Đang tải..." : "Upload file"}
                        </button>
                      </div>

                      {attachmentPreview && (
                        <div className="mt-1">
                          <div className="text-xs text-gray-500 mb-1">File đính kèm:</div>
                          {attachmentPreview.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <img
                              src={attachmentPreview}
                              alt="Attachment preview"
                              className="max-h-40 rounded border object-contain"
                            />
                          ) : (
                            <a
                              href={attachmentPreview}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-600 underline"
                            >
                              Mở file đính kèm
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <textarea className="w-full p-2 border rounded" rows="3" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ghi chú kết quả..."></textarea>

                    <div className="flex gap-2">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleUpdateTicket}>Cập nhật</button>
                      <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={() => deleteTicketById(selectedTicket.id)}>Xóa phiếu</button>
                      <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleSaveNote}>Lưu ghi chú</button>
                      <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => openConfirm("Xóa ghi chú", "Bạn có muốn xóa ghi chú này?", () => doDeleteNote(selectedTicket.id))}>Xóa ghi chú</button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* NEW: AI Assistant Chat */}
            <div className="bg-white rounded-lg shadow p-5 flex flex-col h-96">
              <h3 className="font-semibold mb-3">🤖 Trợ lý AI Bảo trì</h3>
              
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto space-y-2 mb-3 bg-gray-50 p-3 rounded">
                {aiMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                      msg.role === "user" 
                        ? "bg-blue-500 text-white" 
                        : "bg-gray-200 text-gray-800"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-300 px-3 py-2 rounded-lg text-sm">
                      <span className="animate-pulse">Đang xử lý...</span>
                    </div>
                  </div>
                )}
                <div ref={aiMessagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={askAI} className="flex gap-2">
                <input
                  className="flex-1 border p-2 rounded text-sm"
                  placeholder="Hỏi về bảo trì..."
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  disabled={aiLoading}
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-2 rounded disabled:opacity-50"
                  disabled={aiLoading}
                >
                  ➤
                </button>
              </form>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">© 2025 MaintainPro. Bảo lưu mọi quyền.</p>
      </div>

      <ConfirmModal open={confirmModal.open} title={confirmModal.title} message={confirmModal.message} onCancel={closeConfirm} onConfirm={() => { if (typeof confirmModal.onConfirm === "function") confirmModal.onConfirm(); }} />
    </div>
  );
}
