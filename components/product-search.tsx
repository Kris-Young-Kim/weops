"use client"

import { useState } from "react"
import { Search, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const products = [
  { id: "1", name: "성인용 보행기", price: 45000, category: "이동 보조" },
  { id: "2", name: "전동 침대", price: 180000, category: "침상 관련" },
  { id: "3", name: "휠체어", price: 120000, category: "이동 보조" },
  { id: "4", name: "목욕 리프트", price: 250000, category: "욕실 용품" },
  { id: "5", name: "욕실 의자", price: 35000, category: "욕실 용품" },
]

interface ProductSearchProps {
  onAddToCart: (product: (typeof products)[0]) => void
}

export function ProductSearch({ onAddToCart }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = products.filter((p) => p.name.includes(searchTerm))

  return (
    <Card>
      <CardHeader>
        <CardTitle>제품 검색</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="제품명으로 검색..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="max-h-[400px] space-y-2 overflow-y-auto">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-lg border bg-card p-3 hover:bg-accent transition-colors"
            >
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.category}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{product.price.toLocaleString()}원</span>
                <Button size="sm" onClick={() => onAddToCart(product)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
