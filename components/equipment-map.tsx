"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock equipment location data
const equipmentLocations = [
  { id: "1", name: "전동 침대", lat: 37.5665, lng: 126.978, status: "rented", beneficiary: "김영희" },
  { id: "2", name: "성인용 보행기", lat: 37.5145, lng: 127.0567, status: "rented", beneficiary: "이철수" },
  { id: "3", name: "휠체어", lat: 37.5512, lng: 126.9882, status: "rented", beneficiary: "박민수" },
  { id: "4", name: "목욕 리프트", lat: 37.5642, lng: 126.9758, status: "rented", beneficiary: "정수진" },
  { id: "5", name: "성인용 보행기", lat: 37.5326, lng: 127.0245, status: "rented", beneficiary: "홍길동" },
]

export function EquipmentMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedEquipment, setSelectedEquipment] = useState<(typeof equipmentLocations)[0] | null>(null)

  useEffect(() => {
    // Initialize the map
    if (mapRef.current && typeof window !== "undefined") {
      // In a real implementation, you would initialize Google Maps here
      // For now, we'll simulate with a placeholder
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>대여 장비 위치 추적</span>
          <Badge variant="secondary">{equipmentLocations.length}대 대여 중</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Map Container */}
          <div
            ref={mapRef}
            className="relative h-[400px] w-full overflow-hidden rounded-lg border bg-muted"
            style={{
              backgroundImage:
                "url(/placeholder.svg?height=400&width=800&query=google+maps+style+interface+with+seoul+city+view)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Simulated map markers */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-8 p-8">
                {equipmentLocations.slice(0, 6).map((equipment, index) => (
                  <button
                    key={equipment.id}
                    onClick={() => setSelectedEquipment(equipment)}
                    className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg transition-all hover:scale-110 hover:shadow-xl"
                    style={{
                      gridColumn: (index % 3) + 1,
                      gridRow: Math.floor(index / 3) + 1,
                    }}
                  >
                    <div className="h-3 w-3 rounded-full bg-white"></div>
                    <div className="absolute -top-12 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-card px-3 py-1.5 text-xs font-medium shadow-lg group-hover:block">
                      {equipment.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Info overlay when equipment is selected */}
            {selectedEquipment && (
              <div className="absolute bottom-4 left-4 right-4 rounded-lg border bg-card p-4 shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold">{selectedEquipment.name}</p>
                    <p className="text-sm text-muted-foreground">수급자: {selectedEquipment.beneficiary}</p>
                    <Badge variant="secondary" className="mt-1">
                      대여 중
                    </Badge>
                  </div>
                  <button
                    onClick={() => setSelectedEquipment(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Equipment list */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">대여 중인 장비 목록</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {equipmentLocations.map((equipment) => (
                <button
                  key={equipment.id}
                  onClick={() => setSelectedEquipment(equipment)}
                  className="flex items-center justify-between rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent"
                >
                  <div>
                    <p className="text-sm font-medium">{equipment.name}</p>
                    <p className="text-xs text-muted-foreground">{equipment.beneficiary}</p>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
