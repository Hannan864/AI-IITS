import { db } from "../db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "iiui-super-secure-hardened-jwt-secret-key-2026";

export const AuthService = {
  findUserByEmail: (email: string) => db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as any,
  findUserById: (id: string) => db.prepare("SELECT id, name, email, role, department, facultyType, contractEndDate, createdAt FROM users WHERE id = ?").get(id) as any,
  
  comparePasswords: (password: string, hash: string) => bcrypt.compareSync(password, hash),
  
  generateToken: (user: any) => jwt.sign(
    { id: user.id, email: user.email, role: user.role, department: user.department },
    JWT_SECRET,
    { expiresIn: "30d" }
  ),
  
  createUser: (userData: any) => {
    const salt = bcrypt.genSaltSync(10);
    const passHash = bcrypt.hashSync(userData.password, salt);
    const newUserId = `usr-${Date.now()}`;
    const insert = db.prepare(`
      INSERT INTO users (id, name, email, password, role, department, facultyType, contractEndDate, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const createdAt = new Date().toISOString();
    insert.run(
      newUserId,
      userData.name,
      userData.email.toLowerCase(),
      passHash,
      userData.role || "Faculty",
      userData.department || "Computer Science",
      userData.facultyType || "Permanent",
      userData.contractEndDate || null,
      createdAt
    );
    return { id: newUserId, createdAt };
  },
  
  updatePassword: (email: string, newPassword: string) => {
      const salt = bcrypt.genSaltSync(10);
      const passHash = bcrypt.hashSync(newPassword, salt);
      return db.prepare("UPDATE users SET password = ? WHERE email = ?").run(passHash, email.toLowerCase());
  }
};
