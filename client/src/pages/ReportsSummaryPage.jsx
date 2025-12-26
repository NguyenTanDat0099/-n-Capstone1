import { useState } from "react"

export default function ReportsSummaryPage() {
    const [reportType, setReportType] = useState("all")

    const reports = [
        { id: "RPT-001", title: "Monthly Device Performance Report", type: "Device", createdBy: "System", createdAt: "2023-11-01", status: "Completed" },
        { id: "RPT-002", title: "User Activity Summary - October", type: "User", createdBy: "Admin User", createdAt: "2023-10-31", status: "Completed" },
        { id: "RPT-003", title: "Ticket Resolution Analysis", type: "Ticket", createdBy: "Jane Smith", createdAt: "2023-10-28", status: "Pending" },
    ]

    const filteredReports = reportType === "all" ? reports : reports.filter((r) => r.type === reportType)

    return (
        <div className="flex-1 p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Reports Summary</h1>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Generate New Report</button>
            </div>

            <div className="bg-white p-6 rounded-lg border">
                <div className="mb-6">
                    <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="px-4 py-2 border rounded-lg">
                        <option value="all">All Reports</option>
                        <option value="Device">Device Reports</option>
                        <option value="User">User Reports</option>
                        <option value="Ticket">Ticket Reports</option>
                    </select>
                </div>

                <table className="w-full">
                    <thead className="border-b"><tr className="text-left">
                        <th className="pb-3 text-sm font-medium text-gray-600">Report ID</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Title</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Type</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Created By</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Created At</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Status</th>
                        <th className="pb-3 text-sm font-medium text-gray-600">Actions</th>
                    </tr></thead>
                    <tbody>
                        {filteredReports.map((report) => (
                            <tr key={report.id} className="border-b last:border-0">
                                <td className="py-4">{report.id}</td>
                                <td className="py-4">{report.title}</td>
                                <td className="py-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{report.type}</span></td>
                                <td className="py-4">{report.createdBy}</td>
                                <td className="py-4">{report.createdAt}</td>
                                <td className="py-4"><span className={`px-2 py-1 rounded text-xs ${report.status === "Completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{report.status}</span></td>
                                <td className="py-4"><button className="text-blue-600 hover:text-blue-800 text-sm">Download</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
