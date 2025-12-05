import React from "react";
export default function Settings() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Settings</h1>

      <form className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 max-w-xl">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Full Name</label>
          <input type="text" defaultValue="Nguyen Tan Dat" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Email</label>
          <input type="email" defaultValue="user@maintainpro.com" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400" />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Change Password</label>
          <input type="password" placeholder="Enter new password" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400" />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
          Save Changes
        </button>
      </form>
    </div>
  );
}
