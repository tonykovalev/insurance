import { ClientForm } from "@/features/clients/ui/ClientForm"

export default function NewClientPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">Новый клиент</h1>
      <div className="mt-6">
        <ClientForm />
      </div>
    </div>
  )
}
