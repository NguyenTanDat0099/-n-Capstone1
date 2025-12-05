require("dotenv").config();
const db = require("./db");

// Dữ liệu mẫu
const equipments = [
  "Máy điều hòa",
  "Máy giặt",
  "Tủ lạnh",
  "Lò vi sóng",
  "Máy rửa bát",
  "Máy hút mùi",
  "Nồi cơm điện",
  "Máy quạt",
  "Bóng đèn",
  "Ổ cắm điện",
  "Máy pump nước",
  "Bộ khóa",
  "Cửa kính",
  "Cửa gỗ",
  "Mái hiên",
];

const locations = [
  "Phòng khách",
  "Phòng ngủ",
  "Bếp",
  "Phòng tắm",
  "Sân vườn",
  "Tầng 1",
  "Tầng 2",
  "Hầm",
  "Garage",
  "Phòng kho",
  "Sảnh chính",
  "Phòng họp",
  "Văn phòng",
  "Nhà xưởng",
  "Khu vệ sinh",
];

const statuses = ["Pending", "In Progress", "Completed", "On Hold"];
const priorities = ["Low", "Medium", "High", "Critical"];
const descriptions = [
  "Bảo dưỡng định kỳ",
  "Sửa chữa khẩn cấp",
  "Thay thế linh kiện",
  "Kiểm tra kỹ thuật",
  "Vệ sinh sạch sẽ",
  "Nâng cấp hệ thống",
  "Cải tạo hiện đại hóa",
  "Khắc phục sự cố",
  "Kiểm định an toàn",
  "Bảo hành dịch vụ",
];

function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
    .toISOString()
    .slice(0, 10);
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedTickets() {
  console.log("🌱 Bắt đầu seed 1000 phiếu...");

  const startDate = new Date("2025-01-01");
  const endDate = new Date("2025-12-31");
  
  let insertedCount = 0;
  const batchSize = 50;
  const totalBatches = Math.ceil(1000 / batchSize);

  for (let batch = 0; batch < totalBatches; batch++) {
    const promises = [];
    const currentBatchSize = Math.min(batchSize, 1000 - batch * batchSize);

    for (let i = 0; i < currentBatchSize; i++) {
      const ticketNum = batch * batchSize + i + 1;
      const code = `TK${String(ticketNum).padStart(6, "0")}`;
      const equipment = getRandomItem(equipments);
      const location = getRandomItem(locations);
      const status = getRandomItem(statuses);
      const priority = getRandomItem(priorities);
      const dueDate = randomDate(startDate, endDate);
      const description = getRandomItem(descriptions);
      const assignedTo = Math.floor(Math.random() * 4) + 1; // 1-4
      const createdAt = new Date(
        startDate.getTime() +
          Math.random() * (endDate.getTime() - startDate.getTime())
      )
        .toISOString();

      promises.push(
        new Promise((resolve, reject) => {
          const sql = `
            INSERT INTO tickets 
            (code, equipment, location, status, priority, due_date) 
            VALUES (?, ?, ?, ?, ?, ?)
          `;
          
          db.query(
            sql,
            [
              code,
              equipment,
              location,
              status,
              priority,
              dueDate,
            ],
            (err) => {
              if (err) {
                console.error(`❌ Lỗi insert phiếu ${code}:`, err.message);
                reject(err);
              } else {
                insertedCount++;
                if (insertedCount % 100 === 0) {
                  console.log(`✅ Đã insert ${insertedCount}/1000 phiếu...`);
                }
                resolve();
              }
            }
          );
        })
      );
    }

    try {
      await Promise.all(promises);
      console.log(
        `✅ Batch ${batch + 1}/${totalBatches} hoàn tất (${insertedCount}/1000)`
      );
    } catch (err) {
      console.error(`❌ Lỗi trong batch ${batch + 1}:`, err.message);
    }
  }

  console.log(`\n✅ Hoàn tất! Đã insert ${insertedCount}/1000 phiếu`);
  console.log("📊 Dữ liệu đã được thêm vào database");
  process.exit(0);
}

seedTickets().catch((err) => {
  console.error("❌ Lỗi seed:", err);
  process.exit(1);
});
