import { notFound } from "next/navigation"

import { ClientForm } from "@/features/clients/ui/ClientForm"
import { prisma } from "@/shared/lib/prisma"
import { requireSession } from "@/shared/lib/session"

type EditClientPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditClientPage({ params }: EditClientPageProps) {
  const { id } = await params
  const session = await requireSession()

  const client = await prisma.client.findFirst({
    where: { id, userId: session.userId },
    select: { id: true, name: true, email: true, phone: true, address: true, notes: true },
  })

  if (!client) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Редактировать клиента</h1>
      <div className="mt-6">
        <ClientForm client={client} />
      </div>
    </div>
  )
}
