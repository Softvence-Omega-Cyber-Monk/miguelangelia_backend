import { email, z } from "zod";

const createUserValidaton = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6),
});

export const user_validations = {
  createUserValidaton,
};
