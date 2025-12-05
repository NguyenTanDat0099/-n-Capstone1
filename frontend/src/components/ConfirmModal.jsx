import React from "react";

export default function ConfirmModal({ open, title, message, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel}></div>
      <div className="bg-white rounded-lg shadow-lg z-10 w-[95%] max-w-md p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 rounded bg-gray-200" onClick={onCancel}>
            Hủy
          </button>
          <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={onConfirm}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
