import { useState, useEffect } from "react"

export default function TicketOverviewPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTicket, setEditingTicket] = useState(null)
    const [tickets, setTickets] = useState([])
    const [formData, setFormData] = useState({ title: "", deviceName: "", priority: "Medium", status: "Open", assignedTo: "" })

    useEffect(() => {
        fetch("/api/tickets")
            .then(res => res.json())
            .then(data => { if (data.success) setTickets(data.data) })
            .catch(() => {
                setTickets([
                    { id: "TKT001", title: "Network Connectivity Issue", deviceName: "Router-B", priority: "High", status: "Open", assignedTo: "Alice Johnson", createdAt: "2023-10-26" },
                    { id: "TKT002", title: "Software Installation", deviceName: "Laptop-1", priority: "Medium", status: "In Progress", assignedTo: "Bob Williams", createdAt: "2023-10-25" },
                ])
            })
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (editingTicket) {
            setTickets(tickets.map(t => t.id === editingTicket.id ? { ...t, ...formData } : t))
        } else {
            setTickets([...tickets, { id: `TKT${String(tickets.length + 1).padStart(3, "0")}`, ...formData, createdAt: new Date().toISOString().split("T")[0] }])
        }
        setIsModalOpen(false)
    }

    return (
        <div className="flex-1 p-8">
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg border"><div className="text-gray-600 text-sm mb-2">Total Tickets</div><div className="text-3xl font-bold">{tickets.length}</div></div>
                <div className="bg-white p-6 rounded-lg border"><div className="text-gray-600 text-sm mb-2">Open</div><div className="text-3xl font-bold">{tickets.filter(t => t.status === "Open").length}</div></div>
                <div className="bg-white p-6 rounded-lg border"><div className="text-gray-600 text-sm mb-2">In Progress</div><div className="text-3xl font-bold">{tickets.filter(t => t.status === "In Progress").length}</div></div>
                <div className="bg-white p-6 rounded-lg border"><div className="text-gray-600 text-sm mb-2">Resolved</div><div className="text-3xl font-bold">{tickets.filter(t => t.status === "Resolved").length}</div></div>
            </div>

            <div className="bg-white rounded-lg border">
                <div className="p-6 flex items-center justify-between border-b">
                    <input type="text" placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-4 py-2 border rounded-lg w-64" />
                    <button onClick={() => { setEditingTicket(null); setFormData({ title: "", deviceName: "", priority: "Medium", status: "Open", assignedTo: "" }); setIsModalOpen(true) }} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">+ Create Ticket</button>
                </div>

                <table className="w-full">
                    <thead className="bg-gray-50 border-b"><tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y">
                        {tickets.map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm">{ticket.id}</td>
                                <td className="px-6 py-4 text-sm">{ticket.title}</td>
                                <td className="px-6 py-4 text-sm">{ticket.deviceName}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded ${ticket.priority === "High" ? "bg-red-100 text-red-700" : ticket.priority === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"}`}>{ticket.priority}</span></td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded ${ticket.status === "Open" ? "bg-blue-100 text-blue-700" : ticket.status === "In Progress" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>{ticket.status}</span></td>
                                <td className="px-6 py-4 text-sm">{ticket.assignedTo}</td>
                                <td className="px-6 py-4"><button onClick={() => { setEditingTicket(ticket); setFormData(ticket); setIsModalOpen(true) }} className="text-blue-600 hover:underline">Edit</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <h3 className="text-xl font-bold mb-4">{editingTicket ? "Edit Ticket" : "Create Ticket"}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
                                <div><label className="block text-sm font-medium mb-1">Device Name</label><input type="text" required value={formData.deviceName} onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium mb-1">Priority</label><select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-2 border rounded-lg"><option>Low</option><option>Medium</option><option>High</option></select></div>
                                    <div><label className="block text-sm font-medium mb-1">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg"><option>Open</option><option>In Progress</option><option>Resolved</option></select></div>
                                </div>
                                <div><label className="block text-sm font-medium mb-1">Assigned To</label><input type="text" required value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">{editingTicket ? "Update" : "Create"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
