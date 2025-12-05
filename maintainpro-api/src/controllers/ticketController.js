import { db } from "../config/db.js";

// CREATE NEW TICKET
export const createTicket = async (req, res) => {
  try {
    const {
      user_id,
      deviceName,
      deviceCategory,
      subject,
      description,
      priority,
      address,
      preferredTime,
      deliveryMethod,
      pickupAddress,
    } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url || null;

    const service_address = address;
    const appointment_time = preferredTime;

    const [result] = await db.query(
      `INSERT INTO tickets 
        (user_id, device_name, device_category, subject, description, priority, service_address, appointment_time, delivery_method, pickup_address, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        deviceName,
        deviceCategory,
        subject,
        description,
        priority,
        service_address,
        appointment_time,
        deliveryMethod,
        pickupAddress,
        imageUrl,
      ]
    );

    res.json({
      message: "Ticket created successfully",
      ticketId: result.insertId,
      image_url: imageUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create ticket" });
  }
};

// GET TICKETS FOR USER
export const getTicketsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get tickets" });
  }
};

// GET ONE TICKET
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM tickets WHERE id = ?", [id]);

    if (rows.length === 0)
      return res.status(404).json({ error: "Ticket not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get ticket" });
  }
};
