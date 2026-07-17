import { z } from "zod"

export const loginSchema = z.object({
  email: z.email({ error: "Введите корректный email" }).trim(),
  password: z.string().min(1, { error: "Введите пароль" }),
})

export const signupSchema = z.object({
  name: z.string().trim().min(2, { error: "Имя должно быть не короче 2 символов" }),
  email: z.email({ error: "Введите корректный email" }).trim(),
  password: z
    .string()
    .min(8, { error: "Пароль должен быть не короче 8 символов" })
    .regex(/[a-zA-Z]/, { error: "Пароль должен содержать хотя бы одну букву" })
    .regex(/[0-9]/, { error: "Пароль должен содержать хотя бы одну цифру" }),
})
