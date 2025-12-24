"use client"

import { MoreHorizontal, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"

const inventoryData = [
  {
    id: "1",
    productName: "성인용 보행기",
    serialNumber: "WK-2024-001",
    status: "available",
    location: "서울시 강남구",
    lastUpdated: "2024-01-15",
  },
  {
    id: "2",
    productName: "전동 침대",
    serialNumber: "EB-2024-042",
    status: "rented",
    location: "서울시 송파구",
    lastUpdated: "2024-01-14",
  },
  {
    id: "3",
    productName: "휠체어",
    serialNumber: "WC-2024-128",
    status: "maintenance",
    location: "센터 (소독 중)",
    lastUpdated: "2024-01-13",
  },
  {
    id: "4",
    productName: "목욕 리프트",
    serialNumber: "BL-2024-067",
    status: "available",
    location: "경기도 성남시",
    lastUpdated: "2024-01-12",
  },
  {
    id: "5",
    productName: "성인용 보행기",
    serialNumber: "WK-2024-089",
    status: "rented",
    location: "서울시 마포구",
    lastUpdated: "2024-01-11",
  },
]

const statusConfig = {
  available: { 
    label: "대여 가능", 
    variant: "default" as const,
    className: "bg-teal-600 text-white hover:bg-teal-700 border-teal-600",
  },
  rented: { 
    label: "대여 중", 
    variant: "secondary" as const,
    className: "bg-blue-600 text-white hover:bg-blue-700 border-blue-600",
  },
  maintenance: { 
    label: "소독 대기", 
    variant: "outline" as const,
    className: "border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950",
  },
}

export function InventoryTable() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="제품명, 시리얼 넘버로 검색..." className="pl-10" />
        </div>
      </div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>제품명</TableHead>
              <TableHead>시리얼 넘버</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>현재 위치</TableHead>
              <TableHead>마지막 업데이트</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventoryData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.productName}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{item.serialNumber}</TableCell>
                <TableCell>
                  <Badge 
                    variant={statusConfig[item.status].variant}
                    className={statusConfig[item.status].className}
                  >
                    {statusConfig[item.status].label}
                  </Badge>
                </TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell className="text-muted-foreground">{item.lastUpdated}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">액션 메뉴 열기</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>액션</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>상세 보기</DropdownMenuItem>
                      <DropdownMenuItem>상태 변경</DropdownMenuItem>
                      <DropdownMenuItem>위치 변경</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">삭제</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
