"use client"

import { useActionState, useState } from "react"

import { LeadStatus } from "@/generated/prisma/enums"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Textarea } from "@/shared/ui/textarea"

import { saveLead, type LeadActionState } from "../api/actions"
import { LEAD_STATUS_LABELS } from "../model/constants"

type Category = {
  id: string
  name: string
  subtypes: { id: string; name: string }[]
}

type LeadFormProps = {
  categories: Category[]
  lead?: {
    id: string
    name: string
    phone: string | null
    email: string | null
    notes: string | null
    status: LeadStatus
    currentPolicy?: {
      currentInsurer: string
      expiresAt: Date
      categoryId: string
      subtypeId: string | null
    } | null
  }
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function LeadForm({ categories, lead }: LeadFormProps) {
  const [state, formAction, pending] = useActionState<LeadActionState, FormData>(
    saveLead,
    undefined
  )
  const values = state?.values

  const [categoryId, setCategoryId] = useState(
    values?.categoryId || lead?.currentPolicy?.categoryId || ""
  )

  const subtypes = categories.find((category) => category.id === categoryId)?.subtypes ?? []

  return (
    <form
      key={JSON.stringify(state) ?? "initial"}
      action={formAction}
      className="flex max-w-lg flex-col gap-4"
    >
      {lead && <input type="hidden" name="leadId" value={lead.id} />}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Имя</Label>
        <Input id="name" name="name" defaultValue={values?.name ?? lead?.name} required />
        {state?.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Телефон</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={values?.phone ?? lead?.phone ?? ""}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={values?.email ?? lead?.email ?? ""}
        />
        {state?.errors?.email && (
          <p className="text-sm text-destructive">{state.errors.email[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Статус</Label>
        <Select
          name="status"
          defaultValue={values?.status || lead?.status || LeadStatus.NEW}
          items={LEAD_STATUS_LABELS}
        >
          <SelectTrigger id="status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Заметки</Label>
        <Textarea id="notes" name="notes" defaultValue={values?.notes ?? lead?.notes ?? ""} rows={3} />
      </div>

      <div className="mt-2 border-t border-border pt-4">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Текущая страховка (необязательно)
        </h2>

        <div className="mt-3 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="currentInsurer">Текущий страховщик</Label>
            <Input
              id="currentInsurer"
              name="currentInsurer"
              defaultValue={values?.currentInsurer ?? lead?.currentPolicy?.currentInsurer ?? ""}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="categoryId">Категория</Label>
            <Select
              name="categoryId"
              value={categoryId}
              onValueChange={(value) => setCategoryId(value ?? "")}
              items={categories.map((category) => ({ value: category.id, label: category.name }))}
            >
              <SelectTrigger id="categoryId" className="w-full">
                <SelectValue placeholder="Не указана" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {subtypes.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="subtypeId">Подтип</Label>
              <Select
                key={categoryId}
                name="subtypeId"
                defaultValue={values?.subtypeId || lead?.currentPolicy?.subtypeId || undefined}
                items={subtypes.map((subtype) => ({ value: subtype.id, label: subtype.name }))}
              >
                <SelectTrigger id="subtypeId" className="w-full">
                  <SelectValue placeholder="Не указан" />
                </SelectTrigger>
                <SelectContent>
                  {subtypes.map((subtype) => (
                    <SelectItem key={subtype.id} value={subtype.id}>
                      {subtype.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expiresAt">Дата окончания текущего полиса</Label>
            <Input
              id="expiresAt"
              name="expiresAt"
              type="date"
              defaultValue={
                values?.expiresAt ||
                (lead?.currentPolicy?.expiresAt
                  ? toDateInputValue(lead.currentPolicy.expiresAt)
                  : undefined)
              }
            />
            {state?.errors?.expiresAt && (
              <p className="text-sm text-destructive">{state.errors.expiresAt[0]}</p>
            )}
          </div>
        </div>
      </div>

      {state?.message && <p className="text-sm text-destructive">{state.message}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Сохраняем..." : lead ? "Сохранить" : "Создать"}
      </Button>
    </form>
  )
}
