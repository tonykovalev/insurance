import Link from "next/link"
import { Pencil, Plus } from "lucide-react"

import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/shared/lib/prisma"
import { requireSession } from "@/shared/lib/session"
import { parseSort, type SortOrder } from "@/shared/lib/sort"
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

const SORT_KEYS = ["name", "email", "phone", "policies"] as const
type SortKey = (typeof SORT_KEYS)[number]

function getOrderBy(sort: SortKey, order: SortOrder): Prisma.ClientOrderByWithRelationInput {
  switch (sort) {
    case "policies":
      return { policies: { _count: order } }
    case "name":
      return { name: order }
    case "email":
      return { email: order }
    case "phone":
      return { phone: order }
  }
}

type ClientsPageProps = {
  searchParams: Promise<{ sort?: string; order?: string }>
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const session = await requireSession()
  const { sort, order } = parseSort(await searchParams, SORT_KEYS, "name", "asc")

  const clients = await prisma.client.findMany({
    where: { userId: session.userId },
    orderBy: getOrderBy(sort, order),
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      _count: { select: { policies: true } },
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Клиенты</h1>
        <Button render={<Link href="/clients/new" />} nativeButton={false}>
          <Plus className="size-4" />
          Добавить клиента
        </Button>
      </div>

      {clients.length === 0 ? (
        <p className="mt-6 text-muted-foreground">
          Пока нет ни одного клиента — добавьте первого.
        </p>
      ) : (
        <Table className="mt-6">
          <TableHeader>
            <TableRow>
              <SortableTableHead label="Имя" sortKey="name" currentSort={sort} currentOrder={order} />
              <SortableTableHead label="Email" sortKey="email" currentSort={sort} currentOrder={order} />
              <SortableTableHead
                label="Телефон"
                sortKey="phone"
                currentSort={sort}
                currentOrder={order}
              />
              <SortableTableHead
                label="Полисов"
                sortKey="policies"
                currentSort={sort}
                currentOrder={order}
              />
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">
                  <Link href={`/clients/${client.id}`} className="hover:underline">
                    {client.name}
                  </Link>
                </TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone ?? "—"}</TableCell>
                <TableCell>{client._count.policies}</TableCell>
                <TableCell className="text-right">
                  <Button
                    render={<Link href={`/clients/${client.id}/edit`} />}
                    nativeButton={false}
                    variant="ghost"
                    size="icon-sm"
                  >
                    <Pencil className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
