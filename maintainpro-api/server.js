import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./src/config/db.js";
import User from "./src/models/User.js";
import Ticket from "./src/models/Ticket.js";

import authRoutes from "./src/routes/authRoutes.js";
import ticketRoutes from "./src/routes/ticketRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// TẠO BẢNG NẾU CHƯA CÓ
await db.query(User.create);
await db.query(Ticket.create);

app.get("/", (req, res) => res.send("MaintainPro API Running"));

app.use("/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);

app.listen(process.env.PORT, () => {
  console.log("API running on port " + process.env.PORT);
});
