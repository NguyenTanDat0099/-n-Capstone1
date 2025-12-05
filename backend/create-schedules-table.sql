-- Tạo bảng schedules để quản lý lịch trình kỹ thuật viên
CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  technician_id INT,
  date DATE NOT NULL,
  shift ENUM('Morning', 'Afternoon', 'Evening', 'Night') DEFAULT 'Morning',
  status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  INDEX idx_date (date),
  INDEX idx_ticket (ticket_id),
  INDEX idx_technician (technician_id)
);
