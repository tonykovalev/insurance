import { z } from "zod"

import { optionalText } from "@/shared/lib/zod-helpers"

export const policySchema = z
  .object({
    number: z.string().trim().min(1, { error: "Введите номер полиса" }),
    categoryId: z.string().trim().min(1, { error: "Выберите категорию" }),
    subtypeId: optionalText,
    status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"], { error: "Выберите статус" }),
    startDate: z.coerce.date({ error: "Укажите корректную дату начала" }),
    endDate: z.coerce.date({ error: "Укажите корректную дату окончания" }),
    amount: z.coerce
      .number({ error: "Укажите сумму" })
      .positive({ error: "Сумма должна быть больше нуля" }),
    notes: optionalText,
  })
  .refine((data) => data.endDate > data.startDate, {
    error: "Дата окончания должна быть позже даты начала",
    path: ["endDate"],
  })
