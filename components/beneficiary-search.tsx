"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

// Mock beneficiary data
const beneficiaries = [
  {
    id: "1",
    name: "홍길동",
    phone: "010-1234-5678",
    grade: "3등급",
    copayRate: 15,
    monthlyLimit: 200000,
    usedAmount: 100000,
  },
  {
    id: "2",
    name: "김영희",
    phone: "010-2345-6789",
    grade: "2등급",
    copayRate: 10,
    monthlyLimit: 300000,
    usedAmount: 250000,
  },
  {
    id: "3",
    name: "이철수",
    phone: "010-3456-7890",
    grade: "4등급",
    copayRate: 20,
    monthlyLimit: 150000,
    usedAmount: 50000,
  },
]

interface BeneficiarySearchProps {
  onBeneficiarySelect: (beneficiary: (typeof beneficiaries)[0] | null) => void
}

export function BeneficiarySearch({ onBeneficiarySelect }: BeneficiarySearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<(typeof beneficiaries)[0] | null>(null)

  const handleSearch = () => {
    const found = beneficiaries.find((b) => b.name.includes(searchTerm))
    setSelectedBeneficiary(found || null)
    onBeneficiarySelect(found || null)
  }

  const remainingLimit = selectedBeneficiary ? selectedBeneficiary.monthlyLimit - selectedBeneficiary.usedAmount : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>수급자 검색</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="수급자 이름으로 검색..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>검색</Button>
        </div>

        {selectedBeneficiary && (
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <div className="grid gap-3">
              <div className="flex justify-between">
                <Label className="text-muted-foreground">이름</Label>
                <span className="font-medium">{selectedBeneficiary.name}</span>
              </div>
              <div className="flex justify-between">
                <Label className="text-muted-foreground">연락처</Label>
                <span className="font-medium">{selectedBeneficiary.phone}</span>
              </div>
              <div className="flex justify-between">
                <Label className="text-muted-foreground">등급</Label>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedBeneficiary.grade}</span>
              </div>
              <div className="flex justify-between">
                <Label className="text-muted-foreground">본인부담율</Label>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedBeneficiary.copayRate}%</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <Label className="text-muted-foreground">월 한도</Label>
                <span className="font-medium">{selectedBeneficiary.monthlyLimit.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <Label className="text-muted-foreground">사용 금액</Label>
                <span className="font-medium">{selectedBeneficiary.usedAmount.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <Label className="text-muted-foreground">잔여 한도</Label>
                <span className="text-lg font-bold text-teal-600 dark:text-teal-400">{remainingLimit.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
