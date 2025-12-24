"use client"

import { Trash2, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface ShoppingCartProps {
  items: CartItem[]
  copayRate: number
  remainingLimit: number
  onRemoveItem: (id: string) => void
  onSaveOrder: () => void
}

export function ShoppingCart({ items, copayRate, remainingLimit, onRemoveItem, onSaveOrder }: ShoppingCartProps) {
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const copayAmount = Math.floor(totalAmount * (copayRate / 100))
  const limitExceeded = totalAmount > remainingLimit
  const difference = totalAmount - remainingLimit

  return (
    <Card>
      <CardHeader>
        <CardTitle>장바구니</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">장바구니가 비어있습니다</div>
        ) : (
          <>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.price.toLocaleString()}원 × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{(item.price * item.quantity).toLocaleString()}원</span>
                    <Button variant="ghost" size="icon" onClick={() => onRemoveItem(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-3 rounded-lg bg-muted/30 p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">총액</span>
                <span className="font-semibold">{totalAmount.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">본인부담금 ({copayRate}%)</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{copayAmount.toLocaleString()}원</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-medium">실 납부액</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{copayAmount.toLocaleString()}원</span>
              </div>
            </div>

            {limitExceeded && (
              <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="font-semibold">
                  한도 초과! {difference.toLocaleString()}원 초과되었습니다
                </AlertDescription>
              </Alert>
            )}

            <Button className="w-full" disabled={limitExceeded || items.length === 0} onClick={onSaveOrder}>
              {limitExceeded ? "한도 초과로 주문 불가" : "주문 저장"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
