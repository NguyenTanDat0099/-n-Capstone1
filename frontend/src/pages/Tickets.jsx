import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTicket, setNewTicket] = useState({ code: "", equipment: "", priority: "Medium", status: "Pending", due_date: "", location: "" });
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
            <select className="p-2 border rounded" value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value})}><option>High</option><option>Medium</option><option>Low</option></select>
            <select className="p-2 border rounded" value={newTicket.status} onChange={e => setNewTicket({...newTicket, status: e.target.value})}><option>Pending</option><option>In Progress</option><option>Completed</option></select>
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
              <tr key={t.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/tickets/${t.id}`)}>
                <td className="p-2">{t.code || t.id}</td>
                <td className="p-2">{t.equipment}</td>
                <td className="p-2">{t.priority}</td>
                <td className="p-2">{t.status}</td>
                <td className="p-2">{t.due_date || t.dueDate || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
