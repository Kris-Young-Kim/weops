"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { StatsCards } from "@/components/stats-cards"
import { InventoryTable } from "@/components/inventory-table"
import { RecentOrders } from "@/components/recent-orders"
import { EquipmentMap } from "@/components/equipment-map"

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="border-b bg-card">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">대시보드</h1>
            </div>
          </div>
          <div className="flex flex-col gap-6 p-6">
            <StatsCards />
            <EquipmentMap />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <InventoryTable />
              </div>
              <div>
                <RecentOrders />
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
