export default {
  create: `
    CREATE TABLE IF NOT EXISTS tickets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      device_name VARCHAR(200),
      device_category VARCHAR(50),
      subject VARCHAR(255),
      description TEXT,
      priority VARCHAR(10),
      status VARCHAR(50) DEFAULT 'Open',
      service_address VARCHAR(255),
      appointment_time DATETIME,
      delivery_method VARCHAR(50),
      pickup_address VARCHAR(255),
      image_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `
};
