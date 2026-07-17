import { z } from "zod"

import { optionalText } from "@/shared/lib/zod-helpers"

export const clientSchema = z.object({
  name: z.string().trim().min(2, { error: "Имя должно быть не короче 2 символов" }),
  email: z.email({ error: "Введите корректный email" }).trim(),
  phone: optionalText,
  address: optionalText,
  notes: optionalText,
})
