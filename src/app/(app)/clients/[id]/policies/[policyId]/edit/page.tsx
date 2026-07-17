import { notFound } from "next/navigation"

import { PolicyForm } from "@/features/policies/ui/PolicyForm"
import { prisma } from "@/shared/lib/prisma"
import { requireSession } from "@/shared/lib/session"

type EditPolicyPageProps = {
  params: Promise<{ id: string; policyId: string }>
}

export default async function EditPolicyPage({ params }: EditPolicyPageProps) {
  const { id, policyId } = await params
  const session = await requireSession()

  const policy = await prisma.policy.findFirst({
    where: { id: policyId, clientId: id, client: { userId: session.userId } },
    select: {
      id: true,
      number: true,
      status: true,
      startDate: true,
      endDate: true,
      amount: true,
      notes: true,
      categoryId: true,
      subtypeId: true,
    },
  })

  if (!policy) {
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

  return (
    <div>
      <h1 className="text-2xl font-semibold">Редактировать полис</h1>
      <div className="mt-6">
        <PolicyForm clientId={id} categories={categories} policy={policy} />
      </div>
    </div>
  )
}
