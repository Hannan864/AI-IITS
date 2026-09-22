import { db } from "../db";
import { v4 as uuidv4 } from "uuid";

export const ChatController = {
  getMessages: (req: any, res: any) => {
    const { userId } = req.user; // Use req.user.id
    const { contactId } = req.params;
    
    // Get messages between currentUser and contactId
    const messages = db.prepare(`
      SELECT m.*, u.name as senderName, u.role as senderRole 
      FROM chat_messages m
      JOIN users u ON m.senderId = u.id
      WHERE (m.senderId = ? AND m.receiverId = ?)
         OR (m.senderId = ? AND m.receiverId = ?)
      ORDER BY m.timestamp ASC
    `).all(req.user.id, contactId, contactId, req.user.id);
    
    res.json(messages);
  },
  
  sendMessage: (req: any, res: any) => {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;
    
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO chat_messages (id, senderId, receiverId, content, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, senderId, receiverId, content, timestamp);
    
    const newMessage = db.prepare(`
      SELECT m.*, u.name as senderName, u.role as senderRole 
      FROM chat_messages m
      JOIN users u ON m.senderId = u.id
      WHERE m.id = ?
    `).get(id);
    
    res.json(newMessage);
  },

  getContacts: (req: any, res: any) => {
    const userRole = req.user.role;
    let contacts: any[] = [];
    
    if (userRole === "Admin") {
      contacts = db.prepare(`SELECT id, name, role, department FROM users WHERE role = 'Store Manager'`).all();
    } else if (userRole === "Store Manager") {
      // Store managers see Admin and Faculty members
      contacts = db.prepare(`SELECT id, name, role, department FROM users WHERE role = 'Admin' OR role LIKE '%Faculty%'`).all();
    } else if (userRole.includes("Faculty")) {
      // Faculty members see Store Managers
      contacts = db.prepare(`SELECT id, name, role, department FROM users WHERE role = 'Store Manager'`).all();
    }
    
    res.json(contacts);
  }
};
