import { LeadStatus } from "@/generated/prisma/enums"

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Новый",
  IN_PROGRESS: "В работе",
  WON: "Выигран",
  LOST: "Проигран",
}
