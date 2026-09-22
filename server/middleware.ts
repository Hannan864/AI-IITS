import { z } from "zod";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "iiui-super-secure-hardened-jwt-secret-key-2026";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Security restriction: Too many login requests. Try again shortly." },
  standardHeaders: true,
  legacyHeaders: false
});

export function validateBody(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const fieldError = err.issues[0];
        return res.status(400).json({ 
          field: fieldError.path[0], 
          error: fieldError.message 
        });
      }
      res.status(400).json({ error: "API input validation failed", details: err.message });
    }
  };
}

export function verifyToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).json({ error: "Access Denied: Session token not delivered in headers." });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access Denied: Malformed token header structure." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {id: string, role: string, email: string, department: string};
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ error: "Access Denied: Security session expired or compromised." });
  }
}
