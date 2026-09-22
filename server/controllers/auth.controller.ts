import { AuthService } from "../services/auth.service";
import { logForensicEvent } from "../utils";

export const AuthController = {
  login: (req: any, res: any) => {
    const { email, password } = req.body;
    try {
      const user = AuthService.findUserByEmail(email);
      if (!user || !AuthService.comparePasswords(password, user.password)) {
        logForensicEvent("Public", "Security", "Login Attempt Failed", "auth", "WARNING", `Failed login for <${email}>`);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = AuthService.generateToken(user);
      logForensicEvent(user.name, user.department, "Login Success", "auth", "INFO", `User <${email}> logged in.`);
      
      res.json({ token, user });
    } catch (err: any) {
      res.status(500).json({ error: "System error", details: err.message });
    }
  },

  register: (req: any, res: any) => {
    try {
      if (AuthService.findUserByEmail(req.body.email)) {
        return res.status(400).json({ error: "User already exists" });
      }
      const newUser = AuthService.createUser(req.body);
      const token = AuthService.generateToken({ ...req.body, id: newUser.id });
      res.status(201).json({ token, user: { ...req.body, ...newUser } });
    } catch (err: any) {
      res.status(500).json({ error: "Registration failed", details: err.message });
    }
  },

  me: (req: any, res: any) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const user = AuthService.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User session expired or user not found" });
      }
      res.json({ user });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to verify session" });
    }
  },

  updatePassword: (req: any, res: any) => {
    try {
      const { email, newPassword } = req.body;
      if (!email || !newPassword) {
        return res.status(400).json({ error: "Email and new password are required" });
      }
      // If user is authenticated, ensure they can only update their own password unless admin
      if (req.user && req.user.email !== email && req.user.role !== "Admin") {
        return res.status(403).json({ error: "Unauthorized to change password for another account" });
      }
      AuthService.updatePassword(email, newPassword);
      logForensicEvent(req.user?.email || email, "Security", "Password Updated", "auth", "INFO", `Password updated for <${email}>`);
      res.json({ success: true, message: "Password updated successfully" });
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update password", details: err.message });
    }
  }
};
