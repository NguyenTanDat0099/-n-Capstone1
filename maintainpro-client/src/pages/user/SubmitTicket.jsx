import React, { useState } from "react";

export default function SubmitTicket() {
  const [deviceType, setDeviceType] = useState("");

  // COMMON FIELDS
  const [deviceName, setDeviceName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");

  // LARGE DEVICE FIELDS
  const [serviceAddress, setServiceAddress] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  // SMALL DEVICE FIELDS
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");

  const [devicePlaceholder, setDevicePlaceholder] = useState(
    "e.g., Samsung Refrigerator, iPhone 14, HP Laptop..."
  );
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastProgress, setToastProgress] = useState(100);

  const handleDeviceTypeChange = (value) => {
    setDeviceType(value);

    if (value === "large") {
      setDevicePlaceholder(
        "e.g., Samsung Refrigerator, Toshiba Washing Machine, Panasonic Air Conditioner..."
      );
    } else if (value === "small") {
      setDevicePlaceholder(
        "e.g., iPhone 14 Pro Max, Asus TUF Gaming F15, iPad Air 5..."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append("user_id", 1);
    payload.append("deviceName", deviceName);
    payload.append("deviceCategory", deviceType);
    payload.append("subject", subject);
    payload.append("description", description);
    payload.append("priority", priority);

    if (deviceType === "large") {
      payload.append("address", serviceAddress);
      payload.append("preferredTime", selectedTime);
    }
    if (deviceType === "small") {
      payload.append("deliveryMethod", deliveryMethod);
      if (deliveryMethod === "pickup") {
        payload.append("pickupAddress", pickupAddress);
      }
    }

    const fileInput = document.getElementById("ticket-images-input");
    if (fileInput && fileInput.files && fileInput.files[0]) {
      payload.append("image", fileInput.files[0]);
    }

    try {
      const res = await fetch("http://localhost:5001/api/tickets", {
        method: "POST",
        body: payload,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to submit ticket");
      }
      // Push notification into localStorage for bell icon (keep 5 latest)
      try {
        const current =
          JSON.parse(localStorage.getItem("mp_notifications") || "[]") || [];
        const newItem = {
          id: Date.now(),
          message: "Tạo ticket thành công! Chúng tôi sẽ liên hệ sớm.",
          timestamp: new Date().toISOString(),
        };
        const next = [newItem, ...current].slice(0, 5);
        localStorage.setItem("mp_notifications", JSON.stringify(next));
        window.dispatchEvent(new Event("mp_notifications_update"));
      } catch (err) {
        console.error("Failed to store notification", err);
      }

      setToastMessage("Tạo ticket thành công! Chúng tôi sẽ liên hệ sớm.");
      setToastVisible(true);
      setToastProgress(100);
      let elapsed = 0;
      const duration = 2500;
      const step = 50;
      const interval = setInterval(() => {
        elapsed += step;
        const next = Math.max(0, 100 - (elapsed / duration) * 100);
        setToastProgress(next);
        if (elapsed >= duration) {
          clearInterval(interval);
          setToastVisible(false);
        }
      }, step);
    } catch (error) {
      console.error("Failed to submit ticket:", error);
      setToastMessage(error.message || "Error submitting ticket");
      setToastVisible(true);
      setToastProgress(100);
      let elapsed = 0;
      const duration = 2500;
      const step = 50;
      const interval = setInterval(() => {
        elapsed += step;
        const next = Math.max(0, 100 - (elapsed / duration) * 100);
        setToastProgress(next);
        if (elapsed >= duration) {
          clearInterval(interval);
          setToastVisible(false);
        }
      }, step);
    }
  };

  return (
    <div className="p-6 relative">
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 bg-gray-900 text-white px-5 py-4 rounded-xl shadow-2xl border border-blue-400/60 transition-opacity duration-300 ${
            toastVisible ? "opacity-100" : "opacity-0"
          } z-30 w-80`}
        >
          <div className="font-semibold mb-1">Thông báo</div>
          <div className="text-sm">{toastMessage}</div>
          <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-300"
              style={{ width: `${toastProgress}%`, transition: "width 50ms linear" }}
            />
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Submit New Ticket
      </h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl bg-white shadow-md rounded-xl p-6 border border-gray-200"
      >
        {/* Device Category */}
        <label className="block font-medium text-gray-700 mb-1">
          Device Category
        </label>
        <select
          className="w-full border px-3 py-2 rounded-lg mb-5"
          value={deviceType}
          onChange={(e) => handleDeviceTypeChange(e.target.value)}
          required
        >
          <option value="">-- Select device type --</option>
          <option value="large">
            Large Appliance (Fridge, Washer, AC, Printer...)
          </option>
          <option value="small">
            Small Electronics (Phone, Laptop, Tablet...)
          </option>
        </select>

        {/* Device Name */}
        <label className="block font-medium text-gray-700 mb-1">
          Device Name
        </label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded-lg mb-5"
          placeholder={devicePlaceholder}
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
          required
        />

        {/* Subject */}
        <label className="block font-medium text-gray-700 mb-1">Subject</label>
        <input
          type="text"
          className="w-full border px-3 py-2 rounded-lg mb-5"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />

        {/* Description */}
        <label className="block font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          rows="4"
          className="w-full border px-3 py-2 rounded-lg mb-5"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>

        {/* IMAGE UPLOAD */}
        <label className="block font-medium text-gray-700 mb-1">
          Upload device images (optional)
        </label>
        <input id="ticket-images-input" type="file" accept="image/*" className="w-full mb-5" />

        {/* LARGE DEVICES */}
        {deviceType === "large" && (
          <div className="mt-5 bg-blue-50 p-4 rounded-xl border border-blue-200">
            <h2 className="font-semibold text-blue-700 mb-3">
              On-site Service Details
            </h2>

            <label className="block font-medium text-gray-700 mb-1">
              Service Address
            </label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded-lg mb-4"
              value={serviceAddress}
              onChange={(e) => setServiceAddress(e.target.value)}
              required
            />

            <label className="block font-medium text-gray-700 mb-1">
              Preferred Appointment Time
            </label>
            <input
              type="datetime-local"
              className="w-full border px-3 py-2 rounded-lg"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
            />
          </div>
        )}

        {/* SMALL DEVICES */}
        {deviceType === "small" && (
          <div className="mt-5 bg-green-50 p-4 rounded-xl border border-green-200">
            <h2 className="font-semibold text-green-700 mb-3">
              Device Delivery Options
            </h2>

            <label className="block font-medium text-gray-700 mb-2">
              How will you submit your device?
            </label>

            <div className="mb-4 space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="delivery"
                  value="bring"
                  checked={deliveryMethod === "bring"}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                />
                Bring to Service Center
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="delivery"
                  value="pickup"
                  checked={deliveryMethod === "pickup"}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                />
                Request Technician Pickup
              </label>
            </div>

            {deliveryMethod === "pickup" && (
              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Pickup Address
                </label>
                <input
                  type="text"
                  className="w-full border px-3 py-2 rounded-lg"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  required
                />
              </div>
            )}
          </div>
        )}

        {/* Priority */}
        <label className="block font-medium text-gray-700 mb-1 mt-6">
          Priority
        </label>
        <select
          className="w-full border px-3 py-2 rounded-lg mb-6"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        {/* SUBMIT */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700"
        >
          Submit Ticket
        </button>
      </form>
    </div>
  );
}
