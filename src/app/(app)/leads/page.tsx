import Link from "next/link"
import { Plus } from "lucide-react"

import type { Prisma } from "@/generated/prisma/client"
import { LeadStatus } from "@/generated/prisma/enums"
import { LEAD_STATUS_LABELS } from "@/features/leads/model/constants"
import { prisma } from "@/shared/lib/prisma"
import { requireSession } from "@/shared/lib/session"
import { parseSort, type SortOrder } from "@/shared/lib/sort"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { SortableTableHead } from "@/shared/ui/sortable-table-head"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

const SORT_KEYS = ["name", "status", "createdAt"] as const
type SortKey = (typeof SORT_KEYS)[number]

function getOrderBy(sort: SortKey, order: SortOrder): Prisma.LeadOrderByWithRelationInput {
  switch (sort) {
    case "name":
      return { name: order }
    case "status":
      return { status: order }
    case "createdAt":
      return { createdAt: order }
  }
}

type LeadsPageProps = {
  searchParams: Promise<{ sort?: string; order?: string; status?: string }>
}

export default async function LeadsPage({ searchParams }: LeadsPageProps) {
  const session = await requireSession()
  const params = await searchParams
  const { sort, order } = parseSort(params, SORT_KEYS, "createdAt", "desc")

  const statusValues = Object.values(LeadStatus)
  const statusFilter = statusValues.includes(params.status as LeadStatus)
    ? (params.status as LeadStatus)
    : null

  const leads = await prisma.lead.findMany({
    where: { userId: session.userId, ...(statusFilter ? { status: statusFilter } : {}) },
    orderBy: getOrderBy(sort, order),
    select: { id: true, name: true, phone: true, email: true, status: true },
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Лиды</h1>
        <Button render={<Link href="/leads/new" />} nativeButton={false}>
          <Plus className="size-4" />
          Добавить лида
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`?${new URLSearchParams({ sort, order }).toString()}`}
          className={cn(
            "rounded-full border px-3 py-1 text-sm",
            statusFilter === null
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          Все
        </Link>
        {statusValues.map((status) => (
          <Link
            key={status}
            href={`?${new URLSearchParams({ status, sort, order }).toString()}`}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              statusFilter === status
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {LEAD_STATUS_LABELS[status]}
          </Link>
        ))}
      </div>

      {leads.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Лидов пока нет.</p>
      ) : (
        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <SortableTableHead
                label="Имя"
                sortKey="name"
                currentSort={sort}
                currentOrder={order}
                extraParams={statusFilter ? { status: statusFilter } : undefined}
              />
              <TableHead>Телефон</TableHead>
              <TableHead>Email</TableHead>
              <SortableTableHead
                label="Статус"
                sortKey="status"
                currentSort={sort}
                currentOrder={order}
                extraParams={statusFilter ? { status: statusFilter } : undefined}
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">
                  <Link href={`/leads/${lead.id}`} className="hover:underline">
                    {lead.name}
                  </Link>
                </TableCell>
                <TableCell>{lead.phone ?? "—"}</TableCell>
                <TableCell>{lead.email ?? "—"}</TableCell>
                <TableCell>{LEAD_STATUS_LABELS[lead.status]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
