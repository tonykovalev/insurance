import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { prisma } from "@/shared/lib/prisma"
import { SESSION_COOKIE, verifyToken } from "@/shared/lib/session"

const PUBLIC_ROUTES = ["/login", "/signup"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

  const session = verifyToken(request.cookies.get(SESSION_COOKIE)?.value)

  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (session) {
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true } })

    if (!user) {
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete(SESSION_COOKIE)
      return response
    }

    if (isPublicRoute) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.(?:png|svg|ico)$).*)"],
}
