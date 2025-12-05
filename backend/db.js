const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "emms"
});

db.connect((err) => {
  if (err) {
    console.log("MySQL connection error:", err);
    return;
  }
  console.log("MySQL Connected to e-MMS Database");
});

module.exports = db;
