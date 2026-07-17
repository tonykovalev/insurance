import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export const SESSION_COOKIE = "session"
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

type SessionPayload = {
  userId: string
  expiresAt: number
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error("SESSION_SECRET is not set")
  return secret
}

function sign(data: string): string {
  return createHmac("sha256", getSecret()).update(data).digest("base64url")
}

function encode(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url")
  return `${data}.${sign(data)}`
}

export function verifyToken(token: string | undefined): SessionPayload | null {
  if (!token) return null

  const [data, signature] = token.split(".")
  if (!data || !signature) return null

  const expectedSignature = sign(data)
  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)
  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload
    if (typeof payload.userId !== "string" || payload.expiresAt < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export async function createSession(userId: string): Promise<void> {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  const token = encode({ userId, expiresAt })
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  return verifyToken(cookieStore.get(SESSION_COOKIE)?.value)
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) redirect("/login")
  return session
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}
