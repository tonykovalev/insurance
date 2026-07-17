import { prisma } from "@/shared/lib/prisma"
import { requireSession } from "@/shared/lib/session"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/shared/ui/sidebar"
import { AppSidebar } from "@/widgets/app-sidebar/ui/AppSidebar"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession()
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.userId },
    select: { name: true, email: true },
  })

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger />
        </header>
        <div className="flex flex-1 flex-col p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
