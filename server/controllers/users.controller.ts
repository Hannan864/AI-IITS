import { db } from "../db";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export const UsersController = {
  listUsers: (req: any, res: any) => {
    try {
      const list = db.prepare("SELECT id, name, email, role, department, facultyType, contractEndDate, createdAt FROM users ORDER BY createdAt DESC").all();
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: "Lacks connection to database users index file", details: err.message });
    }
  },

  createUser: (req: any, res: any) => {
    try {
      const { name, email, role, department, facultyType, contractEndDate, password } = req.body;
      if (!name || !email || !role) {
        return res.status(400).json({ error: "Name, email and role are required." });
      }
      const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email.toLowerCase());
      if (existing) {
        return res.status(400).json({ error: "User with this email already exists." });
      }

      const salt = bcrypt.genSaltSync(10);
      const passHash = bcrypt.hashSync(password || "password123", salt);
      const id = `usr-${uuidv4().slice(0, 8)}`;
      const createdAt = new Date().toISOString();

      db.prepare(`
        INSERT INTO users (id, name, email, password, role, department, facultyType, contractEndDate, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, name, email.toLowerCase(), passHash, role, department || "Administration", facultyType || "Permanent", contractEndDate || null, createdAt);

      const newUser = db.prepare("SELECT id, name, email, role, department, facultyType, contractEndDate, createdAt FROM users WHERE id = ?").get(id);
      res.status(201).json({ user: newUser });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to create user" });
    }
  },

  updateUser: (req: any, res: any) => {
    try {
      const { id } = req.params;
      const { name, email, role, department, facultyType, contractEndDate } = req.body;
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      db.prepare(`
        UPDATE users
        SET name = COALESCE(?, name),
            email = COALESCE(?, email),
            role = COALESCE(?, role),
            department = COALESCE(?, department),
            facultyType = COALESCE(?, facultyType),
            contractEndDate = ?
        WHERE id = ?
      `).run(name, email ? email.toLowerCase() : null, role, department, facultyType, contractEndDate, id);

      const updated = db.prepare("SELECT id, name, email, role, department, facultyType, contractEndDate, createdAt FROM users WHERE id = ?").get(id);
      res.json({ user: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to update user" });
    }
  },

  deleteUser: (req: any, res: any) => {
    try {
      const { id } = req.params;
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (req.user && req.user.id === id) {
        return res.status(400).json({ error: "Cannot delete your own active admin account" });
      }

      db.prepare("DELETE FROM issuances WHERE userId = ?").run(id);
      db.prepare("DELETE FROM notifications WHERE userId = ?").run(id);
      db.prepare("DELETE FROM ndc_requests WHERE userId = ?").run(id);
      db.prepare("DELETE FROM chat_messages WHERE senderId = ? OR receiverId = ?").run(id, id);
      db.prepare("DELETE FROM users WHERE id = ?").run(id);
      res.json({ success: true, message: `User ${user.name} removed successfully` });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to delete user" });
    }
  }
};

