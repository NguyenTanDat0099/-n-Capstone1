import { useState, useEffect } from "react"

export default function DeviceManagementPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingDevice, setEditingDevice] = useState(null)
    const [devices, setDevices] = useState([])
    const [formData, setFormData] = useState({ name: "", model: "", serialNumber: "", installDate: "", warrantyEnd: "", customer: "" })

    useEffect(() => {
        fetch("/api/devices")
            .then(res => res.json())
            .then(data => { if (data.success) setDevices(data.data) })
            .catch(() => {
                setDevices([
                    { id: "DEV001", name: "Sensor Hub Alpha", model: "SH-2000", serialNumber: "SN-A1B2C3", installDate: "2023-01-15", warrantyEnd: "2025-01-15", customer: "Tech Inc." },
                    { id: "DEV002", name: "Smart Gateway X", model: "SG-500", serialNumber: "SN-E5F6G7", installDate: "2023-03-20", warrantyEnd: "2025-03-20", customer: "Global Logistics" },
                ])
            })
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (editingDevice) {
            setDevices(devices.map(d => d.id === editingDevice.id ? { ...d, ...formData } : d))
        } else {
            setDevices([...devices, { id: `DEV${String(devices.length + 1).padStart(3, "0")}`, ...formData }])
        }
        setIsModalOpen(false)
    }

    return (
        <div className="flex-1 p-8">
            <div className="bg-white rounded-lg border">
                <div className="p-6 flex items-center justify-between border-b">
                    <h2 className="text-xl font-semibold">Device List</h2>
                    <div className="flex gap-3">
                        <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <input type="text" placeholder="Search devices..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border rounded-lg w-64" />
                        </div>
                        <button onClick={() => { setEditingDevice(null); setFormData({ name: "", model: "", serialNumber: "", installDate: "", warrantyEnd: "", customer: "" }); setIsModalOpen(true) }} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">+ Add Device</button>
                    </div>
                </div>

                <table className="w-full">
                    <thead className="bg-gray-50 border-b"><tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Device Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr></thead>
                    <tbody className="divide-y">
                        {devices.map((device) => (
                            <tr key={device.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm">{device.id}</td>
                                <td className="px-6 py-4 text-sm">{device.name}</td>
                                <td className="px-6 py-4 text-sm">{device.model}</td>
                                <td className="px-6 py-4 text-sm">{device.serialNumber}</td>
                                <td className="px-6 py-4 text-sm">{device.customer}</td>
                                <td className="px-6 py-4 flex gap-3">
                                    <button onClick={() => { setEditingDevice(device); setFormData(device); setIsModalOpen(true) }} className="text-blue-600 hover:text-blue-800">Edit</button>
                                    <button onClick={() => setDevices(devices.filter(d => d.id !== device.id))} className="text-red-600 hover:text-red-800">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                        <h3 className="text-xl font-bold mb-4">{editingDevice ? "Edit Device" : "Add New Device"}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium mb-1">Device Name</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
                                <div><label className="block text-sm font-medium mb-1">Model</label><input type="text" required value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
                                <div className="col-span-2"><label className="block text-sm font-medium mb-1">Serial Number</label><input type="text" required value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
                                <div><label className="block text-sm font-medium mb-1">Install Date</label><input type="date" required value={formData.installDate} onChange={(e) => setFormData({ ...formData, installDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
                                <div><label className="block text-sm font-medium mb-1">Warranty End</label><input type="date" required value={formData.warrantyEnd} onChange={(e) => setFormData({ ...formData, warrantyEnd: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
                                <div className="col-span-2"><label className="block text-sm font-medium mb-1">Customer</label><input type="text" required value={formData.customer} onChange={(e) => setFormData({ ...formData, customer: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">{editingDevice ? "Update" : "Add"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
