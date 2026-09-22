import { z } from "zod";

export const RegistrationSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^A-Za-z0-9]/, "Password must contain a special character"),
  role: z.enum(["Admin", "Store Manager", "Faculty", "Visiting Faculty"]),
  department: z.string().min(1, "Department is required"),
  facultyType: z.enum(["Permanent", "Visiting", "N/A"]),
  contractEndDate: z.string().nullable().optional(),
});

export type RegistrationData = z.infer<typeof RegistrationSchema>;

export const checkPasswordStrength = (password: string) => {
  if (password.length < 6) return { strength: "Weak", color: "bg-rose-500", percent: 25 };
  if (password.length < 10) return { strength: "Medium", color: "bg-amber-500", percent: 50 };
  
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (hasUpper && hasLower && hasNumber && hasSpecial) {
    return { strength: "Strong", color: "bg-emerald-500", percent: 100 };
  }
  
  return { strength: "Medium", color: "bg-amber-500", percent: 75 };
};
