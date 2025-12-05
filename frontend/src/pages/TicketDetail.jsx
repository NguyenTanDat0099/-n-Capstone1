import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import { io } from "socket.io-client";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [notes, setNotes] = useState("");
  const [logs, setLogs] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const socketRef = useRef(null);

  const fetch = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tickets/${id}`);
      setTicket(res.data);
      setNotes(res.data?.notes || "");

      // fetch logs in parallel
      try {
        const logsRes = await axios.get(`http://localhost:5000/api/tickets/${id}/logs`);
        setLogs(logsRes.data || []);
      } catch (logErr) {
        console.error("TicketDetail.fetch logs", logErr.response || logErr);
        setLogs([]);
      }

      // fetch comments
      try {
        const commentsRes = await axios.get(`http://localhost:5000/api/tickets/${id}/comments`);
        setComments(commentsRes.data || []);
      } catch (cErr) {
        console.error("TicketDetail.fetch comments", cErr.response || cErr);
        setComments([]);
      }
    } catch (err) {
      console.error("TicketDetail.fetch", err.response || err);
      alert("Lỗi khi tải chi tiết phiếu");
      navigate("/tickets");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          setCurrentUserRole(user.role || null);
        }
      } catch {
        setCurrentUserRole(null);
      }
    }
    fetch();
    // eslint-disable-next-line
  }, [id]);

  // setup socket.io for realtime comments
  useEffect(() => {
    if (!id || typeof id === "string" && id.startsWith("local-")) return;

    const socket = io("http://localhost:5000", {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-ticket", id);
    });

    socket.on("comment:new", (comment) => {
      if (!comment || !comment.ticket_id) return;
      if (String(comment.ticket_id) !== String(id)) return;
      setComments(prev => [...prev, comment]);
    });

    socket.on("comment:error", (err) => {
      console.error("socket comment error", err);
    });

    return () => {
      try {
        socket.emit("leave-ticket", id);
      } catch {
        // ignore
      }
      socket.disconnect();
    };
  }, [id]);

  const handleUpdate = async () => {
    if (!ticket) return;
    try {
      await axios.put(`http://localhost:5000/api/tickets/${id}`, { ...ticket, notes });
      alert("Đã cập nhật");
      fetch();
    } catch (err) {
      console.error("Update error", err.response || err);
      alert("Lỗi khi cập nhật");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Xác nhận xóa phiếu?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/tickets/${id}`);
      alert("Đã xóa");
      navigate("/tickets");
    } catch (err) {
      console.error("Delete error", err.response || err);
      alert("Lỗi khi xóa");
    }
  };

  const saveNote = async () => {
    if (!ticket) return;
    try {
      await axios.post(`http://localhost:5000/api/tickets/${id}/notes`, { notes });
      alert("Ghi chú đã lưu");
      fetch();
    } catch (err) {
      console.error("Save note error", err.response || err);
      alert("Lỗi khi lưu ghi chú");
    }
  };

  const handleExportPdf = () => {
    if (!ticket) return;

    const doc = new jsPDF();
    const lineHeight = 7;
    let y = 15;

    doc.setFontSize(16);
    doc.text(`Ticket Detail: ${ticket.code || ticket.id}`, 10, y);
    y += lineHeight + 3;

    doc.setFontSize(11);
    const addLine = (label, value) => {
      doc.text(`${label}: ${value || ""}`, 10, y);
      y += lineHeight;
      if (y > 280) {
        doc.addPage();
        y = 15;
      }
    };

    addLine("Thiết bị", ticket.equipment);
    addLine("Ưu tiên", ticket.priority);
    addLine("Trạng thái", ticket.status);
    addLine("Ngày hạn", ticket.due_date);
    addLine("Vị trí", ticket.location);
    addLine("Kỹ thuật viên", ticket.assigned_to);

    y += 2;
    doc.text("Ghi chú:", 10, y);
    y += lineHeight;
    const noteText = notes || ticket.notes || "";
    const noteLines = doc.splitTextToSize(noteText, 180);
    noteLines.forEach((ln) => {
      doc.text(ln, 10, y);
      y += lineHeight;
      if (y > 280) {
        doc.addPage();
        y = 15;
      }
    });

    if (logs && logs.length) {
      y += lineHeight;
      doc.setFontSize(12);
      doc.text("Activity Log:", 10, y);
      y += lineHeight;
      doc.setFontSize(10);
      logs.forEach((log) => {
        const timeStr = log.created_at ? new Date(log.created_at).toLocaleString() : "";
        const statusStr = log.status ? `Status: ${log.status}` : "";
        const header = `${timeStr} ${statusStr}`.trim();
        doc.text(header, 10, y);
        y += lineHeight;
        if (log.notes) {
          const logLines = doc.splitTextToSize(log.notes, 180);
          logLines.forEach((ln) => {
            doc.text(`- ${ln}`, 12, y);
            y += lineHeight;
            if (y > 280) {
              doc.addPage();
              y = 15;
            }
          });
        }
        y += 2;
        if (y > 280) {
          doc.addPage();
          y = 15;
        }
      });
    }

    doc.save(`ticket_${ticket.code || ticket.id}.pdf`);
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    if (!socketRef.current || !socketRef.current.connected) {
      alert("Không thể gửi bình luận (mất kết nối realtime). Thử lại sau.");
      return;
    }
    const userStr = localStorage.getItem("user");
    let userName = "Technician";
    try {
      if (userStr) {
        const u = JSON.parse(userStr);
        userName = u.fullname || u.email || userName;
      }
    } catch {
      // ignore
    }

    socketRef.current.emit("comment:add", {
      ticketId: id,
      userName,
      message: newComment.trim(),
    });
    setNewComment("");
  };

  if (!ticket) return <div className="p-6">Đang tải...</div>;

  return (
    <main className="flex-1 p-6">
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left: ticket fields */}
        <div className="md:col-span-2 bg-white p-6 rounded shadow">
          <h3 className="text-xl font-semibold mb-3">Chi tiết: {ticket.code || ticket.id}</h3>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600">Thiết bị</label>
              <input className="w-full p-2 border rounded" value={ticket.equipment || ""} onChange={e => setTicket({...ticket, equipment: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600">Ưu tiên</label>
                <input className="w-full p-2 border rounded" value={ticket.priority || ""} onChange={e => setTicket({...ticket, priority: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Trạng thái</label>
                <input className="w-full p-2 border rounded" value={ticket.status || ""} onChange={e => setTicket({...ticket, status: e.target.value})} />
              </div>
            </div>

            {currentUserRole === "admin" && (
              <div>
                <label className="block text-sm text-gray-600">Assign Technician</label>
                <select
                  className="w-full p-2 border rounded text-sm"
                  value={ticket.assigned_to || ""}
                  onChange={(e) => setTicket({ ...ticket, assigned_to: e.target.value })}
                >
                  <option value="">-- Chọn kỹ thuật viên --</option>
                  <option value="Tech User">Tech User</option>
                  <option value="Kỹ thuật viên 1">Kỹ thuật viên 1</option>
                  <option value="Kỹ thuật viên 2">Kỹ thuật viên 2</option>
                  <option value="Kỹ thuật viên 3">Kỹ thuật viên 3</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-600">Ngày hạn</label>
              <input type="date" className="p-2 border rounded" value={ticket.due_date || ""} onChange={e => setTicket({...ticket, due_date: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Vị trí</label>
              <input className="w-full p-2 border rounded" value={ticket.location || ""} onChange={e => setTicket({...ticket, location: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm text-gray-600">Ghi chú</label>
              <textarea className="w-full p-2 border rounded" rows="4" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleUpdate}>Lưu thay đổi</button>
              <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={saveNote}>Lưu ghi chú</button>
              <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleDelete}>Xóa phiếu</button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded" onClick={handleExportPdf}>Export PDF</button>
              <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => navigate("/tickets")}>Quay lại</button>
            </div>
          </div>
        </div>

        {/* Right: Activity log + Comments */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded shadow max-h-[260px] overflow-y-auto">
            <h4 className="text-sm font-semibold mb-3">Activity Log</h4>
            {logs.length === 0 ? (
              <div className="text-xs text-gray-500">Chưa có lịch sử thay đổi.</div>
            ) : (
              <ul className="space-y-2 text-xs">
                {logs.map((log) => (
                  <li key={log.id} className="border rounded p-2 bg-gray-50">
                    <div className="text-[11px] text-gray-500 mb-1">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : ""}
                    </div>
                    {log.status && (
                      <div>
                        <span className="font-semibold">Trạng thái:</span> {log.status}
                      </div>
                    )}
                    {log.notes && (
                      <div className="mt-1">
                        <span className="font-semibold">Ghi chú:</span>{" "}
                        <span className="whitespace-pre-wrap">{log.notes}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white p-6 rounded shadow max-h-[260px] flex flex-col">
            <h4 className="text-sm font-semibold mb-3">Comments (Realtime)</h4>
            {(!id || (typeof id === "string" && id.startsWith("local-"))) ? (
              <div className="text-xs text-gray-500">Bình luận realtime chỉ áp dụng cho phiếu đã lưu trên server.</div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto space-y-2 text-xs mb-2">
                  {comments.length === 0 ? (
                    <div className="text-gray-500">Chưa có bình luận nào.</div>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="border rounded p-2 bg-gray-50">
                        <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                          <span>{c.user_name || "User"}</span>
                          <span>{c.created_at ? new Date(c.created_at).toLocaleString() : ""}</span>
                        </div>
                        <div className="whitespace-pre-wrap">{c.message}</div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2 mt-1">
                  <input
                    className="flex-1 border rounded px-2 py-1 text-xs"
                    placeholder="Nhập bình luận..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <button
                    type="button"
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
                    onClick={handleSendComment}
                  >
                    Gửi
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
