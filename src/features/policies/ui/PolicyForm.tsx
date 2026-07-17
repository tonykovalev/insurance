"use client"

import { useActionState, useState } from "react"

import { PolicyStatus } from "@/generated/prisma/enums"
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

import { savePolicy, type PolicyActionState } from "../api/actions"
import { POLICY_STATUS_LABELS } from "../model/constants"

type Category = {
  id: string
  name: string
  subtypes: { id: string; name: string }[]
}

type PolicyFormProps = {
  clientId: string
  categories: Category[]
  policy?: {
    id: string
    number: string
    status: PolicyStatus
    startDate: Date
    endDate: Date
    amount: number
    notes: string | null
    categoryId: string
    subtypeId: string | null
  }
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function PolicyForm({ clientId, categories, policy }: PolicyFormProps) {
  const [state, formAction, pending] = useActionState<PolicyActionState, FormData>(
    savePolicy,
    undefined
  )

  const values = state?.values

  const [categoryId, setCategoryId] = useState(values?.categoryId || policy?.categoryId || "")

  const subtypes = categories.find((category) => category.id === categoryId)?.subtypes ?? []

  return (
    <form
      key={JSON.stringify(state) ?? "initial"}
      action={formAction}
      className="flex max-w-lg flex-col gap-4"
    >
      <input type="hidden" name="clientId" value={clientId} />
      {policy && <input type="hidden" name="policyId" value={policy.id} />}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="number">Номер полиса</Label>
        <Input id="number" name="number" defaultValue={values?.number ?? policy?.number} required />
        {state?.errors?.number && (
          <p className="text-sm text-destructive">{state.errors.number[0]}</p>
        )}
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
            <SelectValue placeholder="Выберите категорию" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.categoryId && (
          <p className="text-sm text-destructive">{state.errors.categoryId[0]}</p>
        )}
      </div>

      {subtypes.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="subtypeId">Подтип</Label>
          <Select
            key={categoryId}
            name="subtypeId"
            defaultValue={values?.subtypeId || policy?.subtypeId || undefined}
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
        <Label htmlFor="status">Статус</Label>
        <Select
          name="status"
          defaultValue={values?.status || policy?.status || PolicyStatus.ACTIVE}
          items={POLICY_STATUS_LABELS}
        >
          <SelectTrigger id="status" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(POLICY_STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startDate">Дата начала</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={
              values?.startDate || (policy ? toDateInputValue(policy.startDate) : undefined)
            }
            required
          />
          {state?.errors?.startDate && (
            <p className="text-sm text-destructive">{state.errors.startDate[0]}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="endDate">Дата окончания</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={values?.endDate || (policy ? toDateInputValue(policy.endDate) : undefined)}
            required
          />
          {state?.errors?.endDate && (
            <p className="text-sm text-destructive">{state.errors.endDate[0]}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="amount">Сумма, ₽</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          defaultValue={values?.amount || policy?.amount}
          required
        />
        {state?.errors?.amount && (
          <p className="text-sm text-destructive">{state.errors.amount[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Заметки</Label>
        <Textarea id="notes" name="notes" defaultValue={values?.notes ?? policy?.notes ?? ""} rows={3} />
      </div>

      {state?.message && <p className="text-sm text-destructive">{state.message}</p>}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Сохраняем..." : policy ? "Сохранить" : "Создать"}
      </Button>
    </form>
  )
}
