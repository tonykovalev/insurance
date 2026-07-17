"use server"

import { notFound, redirect } from "next/navigation"
import { z } from "zod"

import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/shared/lib/prisma"
import { requireSession } from "@/shared/lib/session"

import { clientSchema } from "../model/schema"

export type ClientFormValues = {
  name: string
  email: string
  phone: string
  address: string
  notes: string
}

export type ClientActionState =
  | {
      errors?: Partial<Record<"name" | "email" | "phone" | "address" | "notes", string[]>>
      message?: string
      values?: ClientFormValues
    }
  | undefined

function readRawValues(formData: FormData): ClientFormValues {
  const asString = (key: string) => {
    const value = formData.get(key)
    return typeof value === "string" ? value : ""
  }

  return {
    name: asString("name"),
    email: asString("email"),
    phone: asString("phone"),
    address: asString("address"),
    notes: asString("notes"),
  }
}

export async function saveClient(
  _prevState: ClientActionState,
  formData: FormData
): Promise<ClientActionState> {
  const session = await requireSession()

  const clientId = formData.get("clientId")
  const values = readRawValues(formData)

  const validated = clientSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    notes: formData.get("notes"),
  })

  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors, values }
  }

  if (typeof clientId === "string" && clientId) {
    const result = await prisma.client.updateMany({
      where: { id: clientId, userId: session.userId },
      data: validated.data,
    })

    if (result.count === 0) {
      notFound()
    }

    redirect(`/clients/${clientId}`)
  }

  let newClientId: string
  try {
    const client = await prisma.client.create({
      data: { ...validated.data, userId: session.userId },
    })
    newClientId = client.id
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("saveClient: unexpected Prisma error on create", error)
      return { message: "Не удалось сохранить клиента, попробуйте ещё раз", values }
    }
    throw error
  }

  redirect(`/clients/${newClientId}`)
}

export async function deleteClient(formData: FormData): Promise<void> {
  const session = await requireSession()
  const clientId = formData.get("clientId")

  if (typeof clientId !== "string") {
    notFound()
  }

  await prisma.client.deleteMany({ where: { id: clientId, userId: session.userId } })
  redirect("/clients")
}
