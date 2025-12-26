import { useState } from "react"

export default function ProfilePage({ onNavigate }) {
    const [fullName, setFullName] = useState("Jane Doe")
    const [email, setEmail] = useState("jane.doe@example.com")
    const [phone, setPhone] = useState("+1 (555) 123-4567")
    const [status, setStatus] = useState("Active")
    const [roles, setRoles] = useState({ administrator: false, editor: true, moderator: false, viewer: true, analyst: false, support: false })

    const handleSaveChanges = () => {
        alert("Profile updated successfully!")
        if (onNavigate) onNavigate("dashboard")
    }

    return (
        <div className="flex-1 p-8">
            <div className="max-w-3xl bg-white rounded-lg border p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center relative">
                        <span className="text-2xl font-bold text-gray-600">JD</span>
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div><h2 className="text-xl font-semibold">Jane Doe</h2></div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium mb-1">Full Name</label><input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2 border rounded-lg" /></div>
                            <div><label className="block text-sm font-medium mb-1">Email Address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg" /></div>
                            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Phone Number</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 border rounded-lg" /></div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Account Status & Roles</h3>
                        <div className="mb-4"><label className="block text-sm font-medium mb-1">Status</label><select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-2 border rounded-lg"><option>Active</option><option>Inactive</option><option>Suspended</option></select></div>
                        <div><label className="block text-sm font-medium mb-2">Roles</label>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(roles).map(([role, checked]) => (
                                    <label key={role} className="flex items-center gap-2"><input type="checkbox" checked={checked} onChange={(e) => setRoles({ ...roles, [role]: e.target.checked })} className="w-4 h-4" /><span className="text-sm capitalize">{role}</span></label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                        <p className="text-sm text-gray-600 mb-4">To enhance security, you can initiate a password reset.</p>
                        <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Reset Password</button>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                        <button onClick={() => onNavigate && onNavigate("dashboard")} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                        <button onClick={handleSaveChanges} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
