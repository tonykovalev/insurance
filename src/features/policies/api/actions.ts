"use server"

import { notFound, redirect } from "next/navigation"
import { z } from "zod"

import { prisma } from "@/shared/lib/prisma"
import { requireSession } from "@/shared/lib/session"

import { policySchema } from "../model/schema"

export type PolicyFormValues = {
  number: string
  categoryId: string
  subtypeId: string
  status: string
  startDate: string
  endDate: string
  amount: string
  notes: string
}

export type PolicyActionState =
  | {
      errors?: Partial<
        Record<
          | "number"
          | "categoryId"
          | "subtypeId"
          | "status"
          | "startDate"
          | "endDate"
          | "amount"
          | "notes",
          string[]
        >
      >
      message?: string
      values?: PolicyFormValues
    }
  | undefined

function readRawValues(formData: FormData): PolicyFormValues {
  const asString = (key: string) => {
    const value = formData.get(key)
    return typeof value === "string" ? value : ""
  }

  return {
    number: asString("number"),
    categoryId: asString("categoryId"),
    subtypeId: asString("subtypeId"),
    status: asString("status"),
    startDate: asString("startDate"),
    endDate: asString("endDate"),
    amount: asString("amount"),
    notes: asString("notes"),
  }
}

export async function savePolicy(
  _prevState: PolicyActionState,
  formData: FormData
): Promise<PolicyActionState> {
  const session = await requireSession()

  const clientId = formData.get("clientId")
  if (typeof clientId !== "string") {
    notFound()
  }

  const values = readRawValues(formData)

  const validated = policySchema.safeParse({
    number: formData.get("number"),
    categoryId: formData.get("categoryId"),
    subtypeId: formData.get("subtypeId"),
    status: formData.get("status"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    amount: formData.get("amount"),
    notes: formData.get("notes"),
  })

  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors, values }
  }

  const policyId = formData.get("policyId")

  if (typeof policyId === "string" && policyId) {
    const result = await prisma.policy.updateMany({
      where: { id: policyId, client: { userId: session.userId } },
      data: validated.data,
    })

    if (result.count === 0) {
      notFound()
    }
  } else {
    const client = await prisma.client.findFirst({
      where: { id: clientId, userId: session.userId },
    })

    if (!client) {
      notFound()
    }

    await prisma.policy.create({
      data: { ...validated.data, clientId },
    })
  }

  redirect(`/clients/${clientId}`)
}

export async function deletePolicy(formData: FormData): Promise<void> {
  const session = await requireSession()
  const policyId = formData.get("policyId")
  const clientId = formData.get("clientId")

  if (typeof policyId !== "string" || typeof clientId !== "string") {
    notFound()
  }

  await prisma.policy.deleteMany({
    where: { id: policyId, client: { userId: session.userId } },
  })

  redirect(`/clients/${clientId}`)
}
