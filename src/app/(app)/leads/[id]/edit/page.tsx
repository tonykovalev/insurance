import { notFound } from "next/navigation"

import { LeadForm } from "@/features/leads/ui/LeadForm"
import { prisma } from "@/shared/lib/prisma"
import { requireSession } from "@/shared/lib/session"

type EditLeadPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditLeadPage({ params }: EditLeadPageProps) {
  const { id } = await params
  const session = await requireSession()

  const lead = await prisma.lead.findFirst({
    where: { id, userId: session.userId },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      notes: true,
      status: true,
      policies: {
        select: { currentInsurer: true, expiresAt: true, categoryId: true, subtypeId: true },
      },
    },
  })

  if (!lead) {
    notFound()
  }

  const categories = await prisma.policyCategory.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      subtypes: { orderBy: { name: "asc" }, select: { id: true, name: true } },
    },
  })

  const { policies, ...leadFields } = lead

  return (
    <div>
      <h1 className="text-2xl font-semibold">Редактировать лида</h1>
      <div className="mt-6">
        <LeadForm categories={categories} lead={{ ...leadFields, currentPolicy: policies[0] }} />
      </div>
    </div>
  )
}
