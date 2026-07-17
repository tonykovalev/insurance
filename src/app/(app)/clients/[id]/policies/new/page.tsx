import { notFound } from "next/navigation"

import { PolicyForm } from "@/features/policies/ui/PolicyForm"
import { prisma } from "@/shared/lib/prisma"
import { requireSession } from "@/shared/lib/session"

type NewPolicyPageProps = {
  params: Promise<{ id: string }>
}

export default async function NewPolicyPage({ params }: NewPolicyPageProps) {
  const { id } = await params
  const session = await requireSession()

  const client = await prisma.client.findFirst({
    where: { id, userId: session.userId },
    select: { id: true, name: true },
  })

  if (!client) {
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
      <h1 className="text-2xl font-semibold">Новый полис — {client.name}</h1>
      <div className="mt-6">
        <PolicyForm clientId={client.id} categories={categories} />
      </div>
    </div>
  )
}
