import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("Invalid email address")
  .transform((v) => v.toLowerCase());

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(64, "Password too long")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");

const couponSchema = z
  .string()
  .trim()
  .regex(/^QL-[A-F0-9]{8}$/, "Invalid coupon code");

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  coupon: couponSchema.optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
