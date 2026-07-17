import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const createEmployeeSchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["Super Admin", "HR Manager", "Employee"]),
  department: z.string().min(1, "Department is required"),
  designation: z.string().min(1, "Designation is required"),
  salary: z.number().min(0, "Salary cannot be negative"),
  joiningDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : new Date())),
  status: z.enum(["Active", "Inactive", "Suspended"]).default("Active"),
  manager: z.string().nullable().optional(),
  profileImage: z.string().optional(),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().min(10, "Phone must be at least 10 digits").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  role: z.enum(["Super Admin", "HR Manager", "Employee"]).optional(),
  department: z.string().min(1, "Department is required").optional(),
  designation: z.string().min(1, "Designation is required").optional(),
  salary: z.number().min(0, "Salary cannot be negative").optional(),
  joiningDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  status: z.enum(["Active", "Inactive", "Suspended"]).optional(),
  manager: z.string().nullable().optional(),
  profileImage: z.string().optional(),
});

// For employees updating their own profile (limited fields)
export const updateOwnProfileSchema = z.object({
  phone: z.string().min(10, "Phone must be at least 10 digits").optional(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  profileImage: z.string().optional(),
});
