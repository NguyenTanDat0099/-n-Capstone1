# Implementation: Vietnamese UI + English Backend

## Mục tiêu
- Frontend hiển thị giao diện bằng tiếng Việt
- Backend lưu trữ giá trị tiếng Anh (Pending, In Progress, Completed, Critical, High, Medium, Low)
- Chuyển đổi tự động khi gửi/nhận dữ liệu

## Các thay đổi thực hiện

### 1. Dashboard.jsx
✅ Thêm 2 conversion functions:
- `statusViToEn(viStatus)`: Chuyển đổi trạng thái tiếng Việt → tiếng Anh
  - "Chờ xử lý" → "Pending"
  - "Đang thực hiện" → "In Progress"
  - "Hoàn thành" → "Completed"
  - "Tạm dừng" → "On Hold"
  - "Đã hủy"/"Hủy bỏ" → "Cancelled"

- `priorityViToEn(viPriority)`: Chuyển đổi ưu tiên tiếng Việt → tiếng Anh
  - "Khẩn cấp" → "Critical"
  - "Cao" → "High"
  - "Trung bình" → "Medium"
  - "Thấp" → "Low"

✅ Cập nhật 3 handlers:
- `handleStatusChange()`: Gọi statusViToEn() trước khi axios.put
- `handlePriorityChange()`: Gọi priorityViToEn() trước khi axios.put
- `handleUpdateTicket()`: Chuyển cả status và priority sang tiếng Anh trong payload

### 2. Tickets.jsx
✅ Thêm 2 conversion functions (giống Dashboard.jsx)
✅ Cập nhật 2 handlers:
- `handleStatusChange()`: Gọi statusViToEn() trước axios.put
- `handlePriorityChange()`: Gọi priorityViToEn() trước axios.put

### 3. Còn lại (không cần thay đổi)
- TicketDetail.jsx: Chỉ xem chi tiết, dùng translateStatus/Priority để hiển thị
- Schedules.jsx: Chỉ xem lịch, không có inline update
- Backend: Giữ nguyên, chỉ xử lý giá trị tiếng Anh

## Quy trình hoạt động

### Khi cập nhật phiếu:
1. User chọn giá trị tiếng Việt trong dropdown/input
2. Frontend capture event: `handleStatusChange(ticketId, "Chờ xử lý")`
3. Gọi conversion: `enStatus = statusViToEn("Chờ xử lý")` → "Pending"
4. axios.put(`/api/tickets/${ticketId}`, { status: "Pending" })
5. Backend lưu "Pending" vào database

### Khi hiển thị phiếu:
1. Backend trả về: `{ status: "Pending", priority: "Critical" }`
2. Frontend cập nhật state: `setTickets([...])` với giá trị tiếng Anh
3. Trong JSX render, dùng `translateStatus("Pending")` → "Chờ xử lý"
4. User thấy giao diện tiếng Việt

## Testing

Tất cả conversion functions đã được test:
```
✅ 'Chờ xử lý' → 'Pending'
✅ 'Đang thực hiện' → 'In Progress'
✅ 'Hoàn thành' → 'Completed'
✅ 'Tạm dừng' → 'On Hold'
✅ 'Đã hủy' → 'Cancelled'
✅ 'Khẩn cấp' → 'Critical'
✅ 'Cao' → 'High'
✅ 'Trung bình' → 'Medium'
✅ 'Thấp' → 'Low'
```

## Lợi ích
1. ✅ UI tiếng Việt hoàn toàn (không có tiếng Anh)
2. ✅ Backend dùng giá trị chuẩn tiếng Anh
3. ✅ Dễ bảo trì: chỉ cần update mapping khi thay đổi translation
4. ✅ Dễ mở rộng: có thể hỗ trợ ngôn ngữ khác bằng cách thêm conversion functions mới
5. ✅ Tính nhất quán: tất cả phiếu đều lưu giá trị tiếng Anh, tránh lỗi do user nhập tay

## Next Steps
- ✅ Build & test frontend
- ✅ Verify conversion functions
- ⏳ Start dev server & manual test giao diện
- ⏳ Commit & push to GitHub
