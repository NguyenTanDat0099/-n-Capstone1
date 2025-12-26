import { useState, useEffect } from "react"

export default function UserManagementPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [deletingUser, setDeletingUser] = useState(null)
    const [users, setUsers] = useState([])
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", status: "Active" })

    useEffect(() => {
        fetch("/api/users")
            .then(res => res.json())
            .then(data => { if (data.success) setUsers(data.data) })
            .catch(() => {
                setUsers([
                    { id: "USR001", name: "Alice Smith", email: "alice@example.com", phone: "+1 555-1234", status: "Active", createdAt: "2023-01-15" },
                    { id: "USR002", name: "Bob Johnson", email: "bob@example.com", phone: "+1 555-5678", status: "Inactive", createdAt: "2022-11-20" },
                ])
            })
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (editingUser) {
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u))
        } else {
            setUsers([...users, { id: `USR${String(users.length + 1).padStart(3, "0")}`, ...formData, createdAt: new Date().toISOString().split("T")[0] }])
        }
        setIsModalOpen(false)
    }

    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))

    return (
        <div className="flex-1 bg-gray-50 p-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="relative flex-1 max-w-md">
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button onClick={() => { setEditingUser(null); setFormData({ name: "", email: "", phone: "", status: "Active" }); setIsModalOpen(true) }} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        Add New User
                    </button>
                </div>

                <table className="w-full">
                    <thead><tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">User ID</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Full Name</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Phone</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                    </tr></thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm">{user.id}</td>
                                <td className="py-3 px-4 text-sm font-medium">{user.name}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{user.phone}</td>
                                <td className="py-3 px-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>{user.status}</span></td>
                                <td className="py-3 px-4 flex gap-2">
                                    <button onClick={() => { setEditingUser(user); setFormData(user); setIsModalOpen(true) }} className="text-blue-600 hover:text-blue-800 p-1">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button onClick={() => { setDeletingUser(user); setIsDeleteConfirmOpen(true) }} className="text-red-600 hover:text-red-800 p-1">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">{editingUser ? "Edit User" : "Add New User"}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div><label className="block text-sm font-medium mb-1">Full Name</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
                                <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
                                <div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
                                <div><label className="block text-sm font-medium mb-1">Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg"><option>Active</option><option>Inactive</option></select></div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">{editingUser ? "Update" : "Add"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteConfirmOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">Are you sure you want to delete user <strong>{deletingUser?.name}</strong>?</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsDeleteConfirmOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                            <button onClick={() => { setUsers(users.filter(u => u.id !== deletingUser.id)); setIsDeleteConfirmOpen(false) }} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
