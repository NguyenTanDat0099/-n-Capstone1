import express from "express";
import {
  createTicket,
  getTicketsByUser,
  getTicketById,
} from "../controllers/ticketController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// Upload middleware applied once with error handling to always return JSON
router.post("/", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Upload failed" });
    }
    return createTicket(req, res, next);
  });
});
router.get("/user/:userId", getTicketsByUser);
router.get("/:id", getTicketById);

export default router;
