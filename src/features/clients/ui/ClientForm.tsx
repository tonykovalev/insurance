"use client"

import { useActionState } from "react"

import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Textarea } from "@/shared/ui/textarea"

import { saveClient, type ClientActionState } from "../api/actions"

type ClientFormProps = {
  client?: {
    id: string
    name: string
    email: string
    phone: string | null
    address: string | null
    notes: string | null
  }
}

export function ClientForm({ client }: ClientFormProps) {
  const [state, formAction, pending] = useActionState<ClientActionState, FormData>(
    saveClient,
    undefined
  )

  const values = state?.values

  return (
    <form
      key={JSON.stringify(state) ?? "initial"}
      action={formAction}
      className="flex max-w-lg flex-col gap-4"
    >
      {client && <input type="hidden" name="clientId" value={client.id} />}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Имя</Label>
        <Input id="name" name="name" defaultValue={values?.name ?? client?.name} required />
        {state?.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={values?.email ?? client?.email}
          required
        />
        {state?.errors?.email && (
          <p className="text-sm text-destructive">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Телефон</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={values?.phone ?? client?.phone ?? ""}
        />
        {state?.errors?.phone && (
          <p className="text-sm text-destructive">{state.errors.phone[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">Адрес</Label>
        <Input
          id="address"
          name="address"
          defaultValue={values?.address ?? client?.address ?? ""}
        />
        {state?.errors?.address && (
          <p className="text-sm text-destructive">{state.errors.address[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Заметки</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={values?.notes ?? client?.notes ?? ""}
          rows={4}
        />
        {state?.errors?.notes && (
          <p className="text-sm text-destructive">{state.errors.notes[0]}</p>
        )}
      </div>

      {state?.message && <p className="text-sm text-destructive">{state.message}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Сохраняем..." : client ? "Сохранить" : "Создать"}
      </Button>
    </form>
  )
}
