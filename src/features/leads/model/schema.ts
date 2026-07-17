import { z } from "zod"

import { optionalDate, optionalEmail, optionalText } from "@/shared/lib/zod-helpers"

export const leadSchema = z.object({
  name: z.string().trim().min(2, { error: "Имя должно быть не короче 2 символов" }),
  phone: optionalText,
  email: optionalEmail,
  notes: optionalText,
  status: z.enum(["NEW", "IN_PROGRESS", "WON", "LOST"], { error: "Выберите статус" }),
  currentInsurer: optionalText,
  categoryId: optionalText,
  subtypeId: optionalText,
  expiresAt: optionalDate,
})
