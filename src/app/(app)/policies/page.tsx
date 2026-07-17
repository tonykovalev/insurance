import Link from "next/link"

import type { Prisma } from "@/generated/prisma/client"
import { POLICY_STATUS_LABELS } from "@/features/policies/model/constants"
import { formatCurrency, formatDate } from "@/shared/lib/format"
import { prisma } from "@/shared/lib/prisma"
import { requireSession } from "@/shared/lib/session"
import { parseSort, type SortOrder } from "@/shared/lib/sort"
import { SortableTableHead } from "@/shared/ui/sortable-table-head"
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

const SORT_KEYS = ["client", "number", "category", "status", "startDate", "amount"] as const
type SortKey = (typeof SORT_KEYS)[number]

function getOrderBy(sort: SortKey, order: SortOrder): Prisma.PolicyOrderByWithRelationInput {
  switch (sort) {
    case "client":
      return { client: { name: order } }
    case "category":
      return { category: { name: order } }
    case "number":
      return { number: order }
    case "status":
      return { status: order }
    case "startDate":
      return { startDate: order }
    case "amount":
      return { amount: order }
  }
}

type PoliciesPageProps = {
  searchParams: Promise<{ sort?: string; order?: string }>
}

export default async function PoliciesPage({ searchParams }: PoliciesPageProps) {
  const session = await requireSession()
  const { sort, order } = parseSort(await searchParams, SORT_KEYS, "startDate", "desc")

  const policies = await prisma.policy.findMany({
    where: { client: { userId: session.userId } },
    orderBy: getOrderBy(sort, order),
    include: {
      client: { select: { id: true, name: true } },
      category: true,
      subtype: true,
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold">Полисы</h1>

      {policies.length === 0 ? (
        <p className="mt-6 text-muted-foreground">
          Полисов пока нет — добавьте их со страницы клиента.
        </p>
      ) : (
        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <SortableTableHead label="Клиент" sortKey="client" currentSort={sort} currentOrder={order} />
              <SortableTableHead label="Номер" sortKey="number" currentSort={sort} currentOrder={order} />
              <SortableTableHead
                label="Категория"
                sortKey="category"
                currentSort={sort}
                currentOrder={order}
              />
              <SortableTableHead label="Статус" sortKey="status" currentSort={sort} currentOrder={order} />
              <SortableTableHead
                label="Начало"
                sortKey="startDate"
                currentSort={sort}
                currentOrder={order}
              />
              <SortableTableHead
                label="Сумма"
                sortKey="amount"
                currentSort={sort}
                currentOrder={order}
                className="text-right"
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {policies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell className="font-medium">
                  <Link href={`/clients/${policy.client.id}`} className="hover:underline">
                    {policy.client.name}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/clients/${policy.client.id}/policies/${policy.id}/edit`}
                    className="hover:underline"
                  >
                    {policy.number}
                  </Link>
                </TableCell>
                <TableCell>
                  {policy.category.name}
                  {policy.subtype && (
                    <span className="text-muted-foreground"> / {policy.subtype.name}</span>
                  )}
                </TableCell>
                <TableCell>{POLICY_STATUS_LABELS[policy.status]}</TableCell>
                <TableCell>{formatDate(policy.startDate)}</TableCell>
                <TableCell className="text-right">{formatCurrency(policy.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
