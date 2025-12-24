"use client"

import { Home, Package, ShoppingCart, Users, MapPin, Settings, BarChart3 } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/brand"

const items = [
  {
    title: "대시보드",
    url: "/",
    icon: Home,
  },
  {
    title: "재고 관리",
    url: "/inventory",
    icon: Package,
  },
  {
    title: "주문 입력",
    url: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "수급자 관리",
    url: "/beneficiaries",
    icon: Users,
  },
  {
    title: "위치 추적",
    url: "/tracking",
    icon: MapPin,
  },
  {
    title: "통계",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "설정",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-4">
        <Logo size="md" showText={true} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-base font-semibold px-2 py-4">복지용구 관리</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
