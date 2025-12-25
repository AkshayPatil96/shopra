import { z } from "zod";

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(3, "Name must be at least 3 characters long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain uppercase, lowercase, number, and special character"
    ),
  userType: z.enum(["user", "seller"]),
})

export const RegisterSellerSchema = RegisterSchema.extend({
  phone: z.string().min(10, "Phone number must be at least 10 digits long"),
  country: z.string("Select your country"),
});

export const VerifyUserSchema = z.object({
  email: z.email(),
  name: z.string().min(3, "Name must be at least 3 characters long"),
  otp: z.string().length(6, "OTP must be 6 characters long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

export const VerifySellerSchema = VerifyUserSchema.extend({
  phone: z.string().min(10, "Phone number must be at least 10 digits long"),
  country: z.string("Select your country"),
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional(),
});

export const ForgotPasswordSchema = z.object({
  email: z.email(),
});

export const VerifyForgotPasswordSchema = z.object({
  email: z.email(),
  otp: z.string().length(6, "OTP must be 6 characters long"),
});

export const ResetPasswordSchema = z.object({
  email: z.email(),
  token: z.string(),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type RegisterDTO = z.infer<typeof RegisterSchema>;
export type RegisterSellerDTO = z.infer<typeof RegisterSellerSchema>;
export type VerifyUserDTO = z.infer<typeof VerifyUserSchema>;
export type VerifySellerDTO = z.infer<typeof VerifySellerSchema>;
export type LoginDTO = z.infer<typeof LoginSchema>;
export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordSchema>;
export type VerifyForgotPasswordDTO = z.infer<typeof VerifyForgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;

