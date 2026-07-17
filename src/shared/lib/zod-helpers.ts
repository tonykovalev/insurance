import { z } from "zod"

export const optionalText = z
  .string()
  .trim()
  .nullish()
  .transform((value) => (value ? value : null))

export const optionalEmail = z
  .preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : (value ?? undefined)),
    z.email({ error: "Введите корректный email" }).optional()
  )
  .transform((value) => value ?? null)

export const optionalDate = z
  .preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : (value ?? undefined)),
    z.coerce.date({ error: "Некорректная дата" }).optional()
  )
  .transform((value) => value ?? null)
