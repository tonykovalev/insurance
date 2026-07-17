"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, LayoutDashboard, LogOut, UserRoundPlus, Users } from "lucide-react"

import { logout } from "@/features/auth/api/actions"
import { Button } from "@/shared/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/shared/ui/sidebar"

const NAV_ITEMS = [
  { title: "Дашборд", url: "/", icon: LayoutDashboard },
  { title: "Клиенты", url: "/clients", icon: Users },
  { title: "Лиды", url: "/leads", icon: UserRoundPlus },
  { title: "Полисы", url: "/policies", icon: FileText },
]

type AppSidebarProps = {
  user: { name: string; email: string }
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-1.5 text-sm font-semibold">Страховой Агент</div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={item.url === "/" ? pathname === "/" : pathname.startsWith(item.url)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex flex-col gap-0.5 px-2 py-1.5">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="ghost" size="sm" className="w-full justify-start gap-2">
            <LogOut className="size-4" />
            Выйти
          </Button>
        </form>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
