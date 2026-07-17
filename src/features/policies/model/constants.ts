import { PolicyStatus } from "@/generated/prisma/enums"

export const POLICY_STATUS_LABELS: Record<PolicyStatus, string> = {
  ACTIVE: "Активен",
  EXPIRED: "Истёк",
  CANCELLED: "Отменён",
}
