export default function DashboardPage({ onNavigate }) {
    return (
        <div className="flex-1 p-8">
            <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="text-gray-600 text-sm mb-2">Total Users</div>
                            <div className="text-3xl font-bold mb-1">2,450</div>
                            <div className="text-xs text-green-600">+18.7% from last month</div>
                        </div>
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <button onClick={() => onNavigate?.("user-management")} className="text-sm text-blue-600 hover:underline">View Details</button>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="text-gray-600 text-sm mb-2">Active Devices</div>
                            <div className="text-3xl font-bold mb-1">985</div>
                            <div className="text-xs text-green-600">+3.2% from last week</div>
                        </div>
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                    </div>
                    <button onClick={() => onNavigate?.("device-management")} className="text-sm text-blue-600 hover:underline">View Details</button>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="text-gray-600 text-sm mb-2">Open Tickets</div>
                            <div className="text-3xl font-bold mb-1">128</div>
                            <div className="text-xs text-red-600">-3.1% from yesterday</div>
                        </div>
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                    </div>
                    <button onClick={() => onNavigate?.("ticket-overview")} className="text-sm text-blue-600 hover:underline">View Details</button>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="text-gray-600 text-sm mb-2">Pending Reports</div>
                            <div className="text-3xl font-bold mb-1">14</div>
                            <div className="text-xs text-red-600">+2 from last 24h</div>
                        </div>
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <button onClick={() => onNavigate?.("reports-summary")} className="text-sm text-blue-600 hover:underline">View Details</button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="col-span-2 bg-white p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Monthly Ticket Status</h3>
                        <button className="text-sm text-blue-600 hover:underline">View Details</button>
                    </div>
                    <div className="h-64 flex items-end justify-center gap-4">
                        <svg className="w-full h-full" viewBox="0 0 600 200">
                            <path d="M 50 150 Q 150 100 250 120 T 550 80" stroke="#3b82f6" strokeWidth="3" fill="none" />
                            <path d="M 50 180 Q 150 140 250 150 T 550 130" stroke="#1e40af" strokeWidth="3" fill="none" />
                        </svg>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => onNavigate?.("user-management")} className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span className="text-sm">Add New User</span>
                        </button>
                        <button onClick={() => onNavigate?.("ticket-overview")} className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span className="text-sm">Create Work Order</span>
                        </button>
                        <button onClick={() => onNavigate?.("reports-summary")} className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-sm">Generate Report</span>
                        </button>
                        <button onClick={() => onNavigate?.("settings")} className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm">Configure Settings</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Recent Activity</h3>
                        <button className="text-sm text-blue-600 hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">John Doe</p>
                                <p className="text-xs text-gray-500">Created new user account</p>
                                <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">Jane Smith</p>
                                <p className="text-xs text-gray-500">Submitted maintenance request</p>
                                <p className="text-xs text-gray-400 mt-1">4 hours ago</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">Device Inventory</h3>
                        <button className="text-sm text-blue-600 hover:underline">View All</button>
                    </div>
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>Server-001</div>
                            <div><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Operational</span></div>
                            <div className="text-xs text-gray-600">Data Center A</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>Workstation-A3</div>
                            <div><span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">Maintenance</span></div>
                            <div className="text-xs text-gray-600">Office 301</div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>Printer-HP400</div>
                            <div><span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Offline</span></div>
                            <div className="text-xs text-gray-600">Office 205</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold">System Resource Usage</h3>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2"><span className="text-sm text-gray-600">CPU</span><span className="text-sm">72%</span></div>
                            <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-green-500 h-3 rounded-full" style={{ width: "72%" }}></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2"><span className="text-sm text-gray-600">RAM</span><span className="text-sm">68%</span></div>
                            <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-green-500 h-3 rounded-full" style={{ width: "68%" }}></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2"><span className="text-sm text-gray-600">Disk</span><span className="text-sm">45%</span></div>
                            <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-green-500 h-3 rounded-full" style={{ width: "45%" }}></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
