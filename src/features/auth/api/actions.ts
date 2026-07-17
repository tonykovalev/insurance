"use server"

import { redirect } from "next/navigation"
import { z } from "zod"

import { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/shared/lib/prisma"
import { hashPassword, verifyPassword } from "@/shared/lib/password"
import { createSession, deleteSession } from "@/shared/lib/session"

import { loginSchema, signupSchema } from "../model/schema"

export type AuthActionState =
  | {
      errors?: Partial<Record<"name" | "email" | "password", string[]>>
      message?: string
    }
  | undefined

export async function login(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const validated = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors }
  }

  const { email, password } = validated.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await verifyPassword(password, user.password))) {
    return { message: "Неверный email или пароль" }
  }

  await createSession(user.id)
  redirect("/")
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const validated = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validated.success) {
    return { errors: z.flattenError(validated.error).fieldErrors }
  }

  const { name, email, password } = validated.data

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return { errors: { email: ["Пользователь с таким email уже существует"] } }
  }

  const hashedPassword = await hashPassword(password)

  let userId: string
  try {
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    })
    userId = user.id
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { errors: { email: ["Пользователь с таким email уже существует"] } }
    }
    throw error
  }

  await createSession(userId)
  redirect("/")
}

export async function logout(): Promise<void> {
  await deleteSession()
  redirect("/login")
}
