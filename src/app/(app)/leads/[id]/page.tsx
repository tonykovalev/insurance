import Link from "next/link"
import { notFound } from "next/navigation"
import { Pencil } from "lucide-react"

import { LEAD_STATUS_LABELS } from "@/features/leads/model/constants"
import { ConvertLeadButton } from "@/features/leads/ui/ConvertLeadButton"
import { DeleteLeadButton } from "@/features/leads/ui/DeleteLeadButton"
import { formatDate } from "@/shared/lib/format"
import { prisma } from "@/shared/lib/prisma"
import { requireSession } from "@/shared/lib/session"
import { Button } from "@/shared/ui/button"

type LeadPageProps = {
  params: Promise<{ id: string }>
}

export default async function LeadPage({ params }: LeadPageProps) {
  const { id } = await params
  const session = await requireSession()

  const lead = await prisma.lead.findFirst({
    where: { id, userId: session.userId },
    include: { policies: { include: { category: true, subtype: true } } },
  })

  if (!lead) {
    notFound()
  }

  const currentPolicy = lead.policies[0]

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{lead.name}</h1>
        <div className="flex gap-2">
          <Button
            render={<Link href={`/leads/${lead.id}/edit`} />}
            nativeButton={false}
            variant="outline"
          >
            <Pencil className="size-4" />
            Редактировать
          </Button>
          <ConvertLeadButton leadId={lead.id} leadName={lead.name} />
          <DeleteLeadButton leadId={lead.id} leadName={lead.name} />
        </div>
      </div>

      <dl className="mt-6 grid max-w-lg grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Статус</dt>
        <dd>{LEAD_STATUS_LABELS[lead.status]}</dd>
        <dt className="text-muted-foreground">Телефон</dt>
        <dd>{lead.phone ?? "—"}</dd>
        <dt className="text-muted-foreground">Email</dt>
        <dd>{lead.email ?? "—"}</dd>
        {lead.notes && (
          <>
            <dt className="text-muted-foreground">Заметки</dt>
            <dd className="whitespace-pre-wrap">{lead.notes}</dd>
          </>
        )}
      </dl>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">Текущая страховка</h2>
        {!currentPolicy ? (
          <p className="mt-2 text-muted-foreground">Нет данных о текущем страховщике.</p>
        ) : (
          <dl className="mt-4 grid max-w-lg grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Страховщик</dt>
            <dd>{currentPolicy.currentInsurer}</dd>
            <dt className="text-muted-foreground">Категория</dt>
            <dd>
              {currentPolicy.category.name}
              {currentPolicy.subtype && (
                <span className="text-muted-foreground"> / {currentPolicy.subtype.name}</span>
              )}
            </dd>
            <dt className="text-muted-foreground">Истекает</dt>
            <dd>{formatDate(currentPolicy.expiresAt)}</dd>
          </dl>
        )}
      </div>
    </div>
  )
}
