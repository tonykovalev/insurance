import { LeadForm } from "@/features/leads/ui/LeadForm"
import { prisma } from "@/shared/lib/prisma"

export default async function NewLeadPage() {
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
      <h1 className="text-2xl font-semibold">Новый лид</h1>
      <div className="mt-6">
        <LeadForm categories={categories} />
      </div>
    </div>
  )
}
