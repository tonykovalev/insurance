"use server"

import { notFound, redirect } from "next/navigation"
import { z } from "zod"

import { prisma } from "@/shared/lib/prisma"
import { requireSession } from "@/shared/lib/session"

import { leadSchema } from "../model/schema"

export type LeadFormValues = {
  name: string
  phone: string
  email: string
  notes: string
  status: string
  currentInsurer: string
  categoryId: string
  subtypeId: string
  expiresAt: string
}

export type LeadActionState =
  | {
      errors?: Partial<
        Record<
          "name" | "phone" | "email" | "notes" | "status" | "currentInsurer" | "expiresAt",
          string[]
        >
      >
      message?: string
      values?: LeadFormValues
    }
  | undefined

function readRawValues(formData: FormData): LeadFormValues {
  const asString = (key: string) => {
    const value = formData.get(key)
    return typeof value === "string" ? value : ""
  }

  return {
    name: asString("name"),
    phone: asString("phone"),
    email: asString("email"),
    notes: asString("notes"),
    status: asString("status"),
    currentInsurer: asString("currentInsurer"),
    categoryId: asString("categoryId"),
    subtypeId: asString("subtypeId"),
    expiresAt: asString("expiresAt"),
  }
}

export async function saveLead(
  _prevState: LeadActionState,
  formData: FormData
): Promise<LeadActionState> {
  const session = await requireSession()
  const values = readRawValues(formData)

  const validated = leadSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    notes: formData.get("notes"),
    status: formData.get("status"),
    currentInsurer: formData.get("currentInsurer"),
    categoryId: formData.get("categoryId"),
    subtypeId: formData.get("subtypeId"),
    expiresAt: formData.get("expiresAt"),
  })

  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors, values }
  }

  const { currentInsurer, categoryId, subtypeId, expiresAt, ...leadFields } = validated.data

  const filledCount = [currentInsurer, categoryId, expiresAt].filter((value) => value !== null).length
  if (filledCount > 0 && filledCount < 3) {
    return {
      message:
        "Чтобы сохранить текущую страховку, заполните страховщика, категорию и дату окончания вместе — либо оставьте все три поля пустыми",
      values,
    }
  }

  const leadId = formData.get("leadId")
  let currentLeadId: string

  if (typeof leadId === "string" && leadId) {
    const result = await prisma.lead.updateMany({
      where: { id: leadId, userId: session.userId },
      data: leadFields,
    })

    if (result.count === 0) {
      notFound()
    }

    currentLeadId = leadId
  } else {
    const lead = await prisma.lead.create({
      data: { ...leadFields, userId: session.userId },
    })
    currentLeadId = lead.id
  }

  if (filledCount === 3 && categoryId) {
    const existing = await prisma.leadPolicy.findFirst({ where: { leadId: currentLeadId } })

    if (existing) {
      await prisma.leadPolicy.update({
        where: { id: existing.id },
        data: { currentInsurer: currentInsurer!, categoryId, subtypeId, expiresAt: expiresAt! },
      })
    } else {
      await prisma.leadPolicy.create({
        data: {
          leadId: currentLeadId,
          currentInsurer: currentInsurer!,
          categoryId,
          subtypeId,
          expiresAt: expiresAt!,
        },
      })
    }
  }

  redirect(`/leads/${currentLeadId}`)
}

export async function deleteLead(formData: FormData): Promise<void> {
  const session = await requireSession()
  const leadId = formData.get("leadId")

  if (typeof leadId !== "string") {
    notFound()
  }

  await prisma.lead.deleteMany({ where: { id: leadId, userId: session.userId } })
  redirect("/leads")
}

export type ConvertLeadState = { message?: string } | undefined

export async function convertLeadToClient(
  _prevState: ConvertLeadState,
  formData: FormData
): Promise<ConvertLeadState> {
  const session = await requireSession()
  const leadId = formData.get("leadId")

  if (typeof leadId !== "string") {
    notFound()
  }

  const lead = await prisma.lead.findFirst({ where: { id: leadId, userId: session.userId } })

  if (!lead) {
    notFound()
  }

  if (!lead.email) {
    return { message: "Прежде чем конвертировать лида в клиента, укажите его email" }
  }

  const client = await prisma.$transaction(async (tx) => {
    const newClient = await tx.client.create({
      data: {
        name: lead.name,
        email: lead.email!,
        phone: lead.phone,
        notes: lead.notes,
        userId: session.userId,
      },
    })

    await tx.lead.update({ where: { id: lead.id }, data: { status: "WON" } })

    return newClient
  })

  redirect(`/clients/${client.id}`)
}
