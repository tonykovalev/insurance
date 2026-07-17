import Link from "next/link"

import { LeadStatus, PolicyStatus } from "@/generated/prisma/enums"
import { LEAD_STATUS_LABELS } from "@/features/leads/model/constants"
import { formatDate } from "@/shared/lib/format"
import { prisma } from "@/shared/lib/prisma"
import { requireSession } from "@/shared/lib/session"
import { MonthlyPremiumChart } from "@/widgets/dashboard/ui/MonthlyPremiumChart"
import { PoliciesByCategoryChart } from "@/widgets/dashboard/ui/PoliciesByCategoryChart"

const DAYS_UNTIL_EXPIRY_WARNING = 30
const TREND_MONTHS = 12

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

const LEAD_STATUS_BAR_COLOR: Record<LeadStatus, string> = {
  NEW: "bg-muted-foreground/30",
  IN_PROGRESS: "bg-muted-foreground/60",
  WON: "bg-status-good",
  LOST: "bg-status-critical",
}

export default async function DashboardPage() {
  const session = await requireSession()

  const now = new Date()
  const expiryThreshold = new Date(now.getTime() + DAYS_UNTIL_EXPIRY_WARNING * 24 * 60 * 60 * 1000)

  const trendStart = new Date(now.getFullYear(), now.getMonth() - (TREND_MONTHS - 1), 1)

  const [
    clientsCount,
    activePoliciesCount,
    expiringSoonCount,
    expiringSoonPolicies,
    leadCounts,
    categories,
    activePoliciesByCategory,
    recentPolicies,
  ] = await Promise.all([
    prisma.client.count({ where: { userId: session.userId } }),
    prisma.policy.count({
      where: { status: PolicyStatus.ACTIVE, client: { userId: session.userId } },
    }),
    prisma.policy.count({
      where: {
        status: PolicyStatus.ACTIVE,
        endDate: { gte: now, lte: expiryThreshold },
        client: { userId: session.userId },
      },
    }),
    prisma.policy.findMany({
      where: {
        status: PolicyStatus.ACTIVE,
        endDate: { gte: now, lte: expiryThreshold },
        client: { userId: session.userId },
      },
      orderBy: { endDate: "asc" },
      take: 5,
      include: { client: { select: { id: true, name: true } }, category: true },
    }),
    prisma.lead.groupBy({
      by: ["status"],
      where: { userId: session.userId },
      _count: true,
    }),
    prisma.policyCategory.findMany({ select: { id: true, name: true } }),
    prisma.policy.groupBy({
      by: ["categoryId"],
      where: { status: PolicyStatus.ACTIVE, client: { userId: session.userId } },
      _count: true,
    }),
    prisma.policy.findMany({
      where: { startDate: { gte: trendStart }, client: { userId: session.userId } },
      select: { startDate: true, amount: true },
    }),
  ])

  const leadCountByStatus: Record<LeadStatus, number> = {
    NEW: 0,
    IN_PROGRESS: 0,
    WON: 0,
    LOST: 0,
  }
  for (const row of leadCounts) {
    leadCountByStatus[row.status] = row._count
  }
  const maxLeadCount = Math.max(1, ...Object.values(leadCountByStatus))

  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]))
  const policiesByCategoryData = activePoliciesByCategory
    .map((row) => ({
      category: categoryNameById.get(row.categoryId) ?? "Без категории",
      count: row._count,
    }))
    .sort((a, b) => b.count - a.count)

  const monthlyPremiumBuckets = new Map<string, number>()
  for (let i = TREND_MONTHS - 1; i >= 0; i--) {
    const bucketDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthlyPremiumBuckets.set(monthKey(bucketDate), 0)
  }
  for (const policy of recentPolicies) {
    const key = monthKey(policy.startDate)
    if (monthlyPremiumBuckets.has(key)) {
      monthlyPremiumBuckets.set(key, monthlyPremiumBuckets.get(key)! + policy.amount)
    }
  }
  const monthlyPremiumData = Array.from(monthlyPremiumBuckets.entries()).map(([key, amount]) => {
    const [year, month] = key.split("-").map(Number)
    return {
      month: new Intl.DateTimeFormat("ru-RU", { month: "short", year: "2-digit" }).format(
        new Date(year, month - 1, 1)
      ),
      amount,
    }
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold">Дашборд</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Клиенты</p>
          <p className="mt-1 text-3xl font-semibold">{clientsCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">Активные полисы</p>
          <p className="mt-1 text-3xl font-semibold">{activePoliciesCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            Истекают в ближайшие {DAYS_UNTIL_EXPIRY_WARNING} дней
          </p>
          <p className="mt-1 text-3xl font-semibold">{expiringSoonCount}</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">
            Истекают в ближайшие {DAYS_UNTIL_EXPIRY_WARNING} дней
          </h2>
          {expiringSoonPolicies.length === 0 ? (
            <p className="mt-3 text-muted-foreground">Нет полисов, истекающих в этот период.</p>
          ) : (
            <div className="mt-3 flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
              {expiringSoonPolicies.map((policy) => (
                <Link
                  key={policy.id}
                  href={`/clients/${policy.client.id}/policies/${policy.id}/edit`}
                  className="flex items-center justify-between gap-4 p-3 hover:bg-accent"
                >
                  <div>
                    <p className="font-medium">{policy.client.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {policy.category.name} · {policy.number}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-sm text-muted-foreground">
                    до {formatDate(policy.endDate)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold">Воронка лидов</h2>
          <div className="mt-3 flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
            {Object.values(LeadStatus).map((status) => {
              const count = leadCountByStatus[status]
              const widthPercent = (count / maxLeadCount) * 100

              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{LEAD_STATUS_LABELS[status]}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${LEAD_STATUS_BAR_COLOR[status]}`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Полисы по категориям</h2>
          <div className="mt-3 rounded-lg border border-border bg-card p-4">
            {policiesByCategoryData.length === 0 ? (
              <p className="text-muted-foreground">Нет активных полисов.</p>
            ) : (
              <PoliciesByCategoryChart data={policiesByCategoryData} />
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Сборы по месяцам</h2>
          <div className="mt-3 rounded-lg border border-border bg-card p-4">
            <MonthlyPremiumChart data={monthlyPremiumData} />
          </div>
        </div>
      </div>
    </div>
  )
}
