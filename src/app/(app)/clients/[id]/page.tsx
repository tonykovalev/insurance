import Link from "next/link"
import { notFound } from "next/navigation"
import { Pencil, Plus } from "lucide-react"

import { DeleteClientButton } from "@/features/clients/ui/DeleteClientButton"
import { POLICY_STATUS_LABELS } from "@/features/policies/model/constants"
import { DeletePolicyButton } from "@/features/policies/ui/DeletePolicyButton"
import { formatCurrency, formatDate } from "@/shared/lib/format"
import { prisma } from "@/shared/lib/prisma"
import { requireSession } from "@/shared/lib/session"
import { Button } from "@/shared/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table"

type ClientPageProps = {
  params: Promise<{ id: string }>
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { id } = await params
  const session = await requireSession()

  const client = await prisma.client.findFirst({
    where: { id, userId: session.userId },
    include: {
      policies: {
        orderBy: { startDate: "desc" },
        include: { category: true, subtype: true },
      },
    },
  })

  if (!client) {
    notFound()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{client.name}</h1>
        <div className="flex gap-2">
          <Button
            render={<Link href={`/clients/${client.id}/edit`} />}
            nativeButton={false}
            variant="outline"
          >
            <Pencil className="size-4" />
            Редактировать
          </Button>
          <DeleteClientButton clientId={client.id} clientName={client.name} />
        </div>
      </div>

      <dl className="mt-6 grid max-w-lg grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Email</dt>
        <dd>{client.email}</dd>
        <dt className="text-muted-foreground">Телефон</dt>
        <dd>{client.phone ?? "—"}</dd>
        <dt className="text-muted-foreground">Адрес</dt>
        <dd>{client.address ?? "—"}</dd>
        {client.notes && (
          <>
            <dt className="text-muted-foreground">Заметки</dt>
            <dd className="whitespace-pre-wrap">{client.notes}</dd>
          </>
        )}
      </dl>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Полисы</h2>
          <Button
            render={<Link href={`/clients/${client.id}/policies/new`} />}
            nativeButton={false}
            size="sm"
          >
            <Plus className="size-4" />
            Добавить полис
          </Button>
        </div>

        {client.policies.length === 0 ? (
          <p className="mt-2 text-muted-foreground">У клиента пока нет полисов.</p>
        ) : (
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Номер</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Период</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {client.policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{policy.number}</TableCell>
                  <TableCell>
                    {policy.category.name}
                    {policy.subtype && (
                      <span className="text-muted-foreground"> / {policy.subtype.name}</span>
                    )}
                  </TableCell>
                  <TableCell>{POLICY_STATUS_LABELS[policy.status]}</TableCell>
                  <TableCell>
                    {formatDate(policy.startDate)} — {formatDate(policy.endDate)}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(policy.amount)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        render={
                          <Link href={`/clients/${client.id}/policies/${policy.id}/edit`} />
                        }
                        nativeButton={false}
                        variant="ghost"
                        size="icon-sm"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <DeletePolicyButton
                        policyId={policy.id}
                        clientId={client.id}
                        policyNumber={policy.number}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
