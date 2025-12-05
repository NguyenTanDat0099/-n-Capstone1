import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../config/db.js";

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  
  const hash = bcrypt.hashSync(password, 10);

  await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
    name,
    email,
    hash,
  ]);

  res.json({ message: "Registered successfully" });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await db.query("SELECT * FROM users WHERE email=?", [email]);
  if (rows.length === 0) return res.status(400).json({ error: "User not found" });

  const user = rows[0];

  if (!bcrypt.compareSync(password, user.password))
    return res.status(400).json({ error: "Wrong password" });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

  res.json({
    message: "Login OK",
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
};
