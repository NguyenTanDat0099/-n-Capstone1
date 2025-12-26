import { useState } from "react"

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        siteName: "MaintainPro",
        siteEmail: "admin@maintainpro.com",
        enableNotifications: true,
        enableEmailAlerts: true,
        autoBackup: true,
        backupFrequency: "daily",
        timezone: "UTC",
    })

    const handleSave = () => alert("Settings saved successfully!")

    return (
        <div className="flex-1 p-8">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border">
                    <h2 className="text-lg font-semibold mb-4">General Settings</h2>
                    <div className="space-y-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label><input type="text" value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Site Email</label><input type="email" value={settings.siteEmail} onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })} className="w-full px-4 py-2 border rounded-lg" /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                            <select value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                                <option value="UTC">UTC</option><option value="America/New_York">Eastern Time</option><option value="America/Los_Angeles">Pacific Time</option><option value="Asia/Tokyo">Tokyo</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                    <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div><p className="font-medium">Enable Notifications</p><p className="text-sm text-gray-500">Receive in-app notifications</p></div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settings.enableNotifications} onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div><p className="font-medium">Email Alerts</p><p className="text-sm text-gray-500">Receive email notifications</p></div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settings.enableEmailAlerts} onChange={(e) => setSettings({ ...settings, enableEmailAlerts: e.target.checked })} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border">
                    <h2 className="text-lg font-semibold mb-4">Backup Settings</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div><p className="font-medium">Automatic Backup</p><p className="text-sm text-gray-500">Enable automatic database backups</p></div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={settings.autoBackup} onChange={(e) => setSettings({ ...settings, autoBackup: e.target.checked })} className="sr-only peer" />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                        {settings.autoBackup && (
                            <div><label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                                <select value={settings.backupFrequency} onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                                    <option value="hourly">Hourly</option><option value="daily">Daily</option><option value="weekly">Weekly</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
                    <button className="px-6 py-2 border rounded-lg hover:bg-gray-50">Reset to Default</button>
                </div>
            </div>
        </div>
    )
}
