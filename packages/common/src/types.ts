import { z } from "zod";

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4).max(20),
  name: z.string(),
});

export const SigninSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4).max(20),
});

export const CreateRoomSchema = z.object({
  slug : z.string().min(3).max(20),
});