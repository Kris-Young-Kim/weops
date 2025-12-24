"use client"

import { useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { BeneficiarySearch } from "@/components/beneficiary-search"
import { ProductSearch } from "@/components/product-search"
import { ShoppingCart } from "@/components/shopping-cart"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Beneficiary {
  id: string
  name: string
  phone: string
  grade: string
  copayRate: number
  monthlyLimit: number
  usedAmount: number
}

export default function OrdersPage() {
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const { toast } = useToast()

  const handleAddToCart = (product: { id: string; name: string; price: number }) => {
    if (!selectedBeneficiary) {
      toast({
        title: "수급자를 먼저 선택하세요",
        description: "제품을 추가하기 전에 수급자를 검색하고 선택해주세요.",
        variant: "destructive",
      })
      return
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...product, quantity: 1 }]
    })

    toast({
      title: "장바구니에 추가됨",
      description: `${product.name}이(가) 장바구니에 추가되었습니다.`,
    })
  }

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleSaveOrder = () => {
    toast({
      title: "주문이 저장되었습니다",
      description: "주문이 성공적으로 저장되었습니다.",
    })
    setCartItems([])
  }

  const remainingLimit = selectedBeneficiary ? selectedBeneficiary.monthlyLimit - selectedBeneficiary.usedAmount : 0

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1">
          <div className="border-b bg-card">
            <div className="flex h-16 items-center gap-4 px-6">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">주문 입력</h1>
            </div>
          </div>
          <div className="flex flex-col gap-6 p-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <BeneficiarySearch onBeneficiarySelect={setSelectedBeneficiary} />
                <ProductSearch onAddToCart={handleAddToCart} />
              </div>
              <div>
                <ShoppingCart
                  items={cartItems}
                  copayRate={selectedBeneficiary?.copayRate || 0}
                  remainingLimit={remainingLimit}
                  onRemoveItem={handleRemoveItem}
                  onSaveOrder={handleSaveOrder}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}
