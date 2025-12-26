import { useState } from "react"

export default function RolePermissionsPage() {
    const [selectedUser, setSelectedUser] = useState("USR001")
    const [status, setStatus] = useState("Active")
    const [roles, setRoles] = useState({ administrator: false, editor: true, viewer: true, moderator: false, analyst: false, support: false })

    const users = [
        { id: "USR001", name: "Alice Smith", email: "alice.smith@example.com" },
        { id: "USR002", name: "Bob Johnson", email: "bob.johnson@example.com" },
        { id: "USR003", name: "Charlie Brown", email: "charlie.brown@example.com" },
    ]

    const handleSave = () => {
        const selectedRoles = Object.entries(roles).filter(([_, checked]) => checked).map(([role]) => role).join(", ")
        alert(`Roles updated!\n\nStatus: ${status}\nRoles: ${selectedRoles}`)
    }

    return (
        <div className="flex-1 p-8 overflow-auto">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border p-8">
                <h2 className="text-2xl font-bold mb-8">Role Permissions</h2>

                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
                    <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {users.map((user) => (<option key={user.id} value={user.id}>{user.name} ({user.email})</option>))}
                    </select>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-6">Account Status & Roles</h3>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                                <option>Active</option><option>Inactive</option><option>Pending</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(roles).map(([role, checked]) => (
                                    <label key={role} className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={checked} onChange={() => setRoles({ ...roles, [role]: !checked })} className="w-4 h-4 text-blue-600 rounded" />
                                        <span className="text-sm capitalize">{role}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                        <button onClick={() => setRoles({ administrator: false, editor: true, viewer: true, moderator: false, analyst: false, support: false })} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Reset</button>
                        <button onClick={handleSave} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
