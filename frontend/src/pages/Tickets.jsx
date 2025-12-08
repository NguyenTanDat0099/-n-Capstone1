import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const translateStatus = (status) => {
  const translations = {
    "Pending": "Chờ xử lý",
    "In Progress": "Đang thực hiện",
    "Completed": "Hoàn thành",
    "Cancelled": "Hủy bỏ",
    "Scheduled": "Đã lên lịch",
  };
  return translations[status] || status;
};

const translatePriority = (priority) => {
  const translations = {
    "Critical": "Khẩn cấp",
    "High": "Cao",
    "Medium": "Trung bình",
    "Low": "Thấp",
  };
  return translations[priority] || priority;
};

const getStatusColor = (status) => {
  switch(status) {
    case "In Progress": return "bg-yellow-100 text-yellow-800";
    case "Completed": return "bg-green-100 text-green-800";
    case "Pending": return "bg-gray-100 text-gray-800";
    case "Cancelled": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority) => {
  switch(priority) {
    case "Critical": return "bg-red-100 text-red-800";
    case "High": return "bg-orange-100 text-orange-800";
    case "Medium": return "bg-blue-100 text-blue-800";
    case "Low": return "bg-green-100 text-green-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTicket, setNewTicket] = useState({ code: "", equipment: "", priority: "Medium", status: "Pending", due_date: "", location: "" });
  const [updating, setUpdating] = useState(null);
  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tickets");
      setTickets(res.data || []);
    } catch (err) {
      console.error("Tickets.fetch error:", err.response || err);
      alert("Lỗi khi tải danh sách phiếu");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    fetchTickets();
  }, []);

  const handleCreate = async () => {
    if (!newTicket.code.trim() || !newTicket.equipment.trim()) return alert("Mã và thiết bị là bắt buộc");
    try {
      const res = await axios.post("http://localhost:5000/api/tickets/create", newTicket);
      if (res.data?.id) {
        await fetchTickets();
        setShowNewForm(false);
        setNewTicket({ code: "", equipment: "", priority: "Medium", status: "Pending", due_date: "", location: "" });
        alert("Phiếu đã được tạo");
      } else {
        alert(res.data?.message || "Tạo phiếu: server không trả id");
      }
    } catch (err) {
      console.error("Create ticket error:", err.response || err);
      alert("Lỗi khi tạo phiếu");
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    setUpdating(ticketId);
    try {
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}`, { status: newStatus });
      // Update local state
      setTickets(tickets.map(t => t.id === ticketId ? {...t, status: newStatus} : t));
    } catch (err) {
      console.error("Error updating status:", err);
      alert("❌ Lỗi cập nhật trạng thái: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(null);
    }
  };

  const handlePriorityChange = async (ticketId, newPriority) => {
    setUpdating(ticketId);
    try {
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}`, { priority: newPriority });
      // Update local state
      setTickets(tickets.map(t => t.id === ticketId ? {...t, priority: newPriority} : t));
    } catch (err) {
      console.error("Error updating priority:", err);
      alert("❌ Lỗi cập nhật ưu tiên: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(null);
    }
  };

  return (
    <main className="flex-1 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Danh sách phiếu</h3>
        <div>
          <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={() => setShowNewForm(s => !s)}>{showNewForm ? "Hủy" : "Tạo phiếu"}</button>
        </div>
      </div>

      {showNewForm && (
        <div className="bg-white p-4 mb-4 rounded shadow">
          <div className="grid grid-cols-2 gap-3">
            <input className="p-2 border rounded" placeholder="Mã phiếu" value={newTicket.code} onChange={e => setNewTicket({...newTicket, code: e.target.value})} />
            <input className="p-2 border rounded" placeholder="Thiết bị" value={newTicket.equipment} onChange={e => setNewTicket({...newTicket, equipment: e.target.value})} />
            <select className="p-2 border rounded text-sm" value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value})}>
              <option value="Critical">Khẩn cấp</option>
              <option value="High">Cao</option>
              <option value="Medium">Trung bình</option>
              <option value="Low">Thấp</option>
            </select>
            <select className="p-2 border rounded text-sm" value={newTicket.status} onChange={e => setNewTicket({...newTicket, status: e.target.value})}>
              <option value="Pending">Chờ xử lý</option>
              <option value="In Progress">Đang thực hiện</option>
              <option value="Completed">Hoàn thành</option>
            </select>
            <input type="date" className="p-2 border rounded" value={newTicket.due_date} onChange={e => setNewTicket({...newTicket, due_date: e.target.value})} />
            <input className="p-2 border rounded" placeholder="Vị trí" value={newTicket.location} onChange={e => setNewTicket({...newTicket, location: e.target.value})} />
          </div>
          <div className="mt-3">
            <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={handleCreate}>Tạo</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow overflow-hidden">
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
            {tickets.map(t => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="p-2 cursor-pointer" onClick={() => navigate(`/tickets/${t.id}`)}>{t.code || t.id}</td>
                <td className="p-2 cursor-pointer" onClick={() => navigate(`/tickets/${t.id}`)}>{t.equipment}</td>
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
                </td>
                <td className="p-2 cursor-pointer" onClick={() => navigate(`/tickets/${t.id}`)}>{t.due_date || t.dueDate || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
