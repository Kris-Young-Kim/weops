import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const recentOrders = [
  {
    id: "ORD-2024-156",
    beneficiary: "김영희",
    product: "전동 침대",
    date: "2024-01-15",
    amount: "180,000원",
    status: "completed",
  },
  {
    id: "ORD-2024-157",
    beneficiary: "이철수",
    product: "성인용 보행기",
    date: "2024-01-15",
    amount: "45,000원",
    status: "pending",
  },
  {
    id: "ORD-2024-158",
    beneficiary: "박민수",
    product: "휠체어",
    date: "2024-01-14",
    amount: "120,000원",
    status: "completed",
  },
  {
    id: "ORD-2024-159",
    beneficiary: "정수진",
    product: "목욕 리프트",
    date: "2024-01-14",
    amount: "250,000원",
    status: "pending",
  },
]

type OrderStatus = "completed" | "pending";

const statusLabels: Record<OrderStatus, { 
  label: string;
  className: string;
}> = {
  completed: { 
    label: "완료",
    className: "bg-teal-600 text-white hover:bg-teal-700",
  },
  pending: { 
    label: "처리 중",
    className: "bg-blue-600 text-white hover:bg-blue-700",
  },
}

export function RecentOrders() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 주문 내역</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div className="space-y-1">
                <p className="text-sm font-medium">{order.beneficiary}</p>
                <p className="text-xs text-muted-foreground">{order.product}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm font-medium">{order.amount}</p>
                <div className="flex items-center gap-2 justify-end">
                  <p className="text-xs text-muted-foreground">{order.date}</p>
                  <Badge 
                    variant={order.status === "completed" ? "default" : "secondary"} 
                    className={cn("text-xs", statusLabels[order.status as OrderStatus].className)}
                  >
                    {statusLabels[order.status as OrderStatus].label}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
