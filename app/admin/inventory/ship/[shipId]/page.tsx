"use client"

import { useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Package } from "lucide-react"
import Link from "next/link"

const mockShipInventoryData = {
  "SHIP-001": {
    shipName: "한국호",
    equipments: [
      {
        equipmentName: "주엔진",
        parts: [
          {
            partName: "피스톤 링",
            partCode: "PR-001",
            daily: { inbound: 20, outbound: 8, stock: 45 },
            weekly: { inbound: 60, outbound: 25, stock: 45 },
            monthly: { inbound: 180, outbound: 95, stock: 45 },
            unit: "개",
          },
          {
            partName: "실린더 라이너",
            partCode: "CL-001",
            daily: { inbound: 12, outbound: 4, stock: 28 },
            weekly: { inbound: 36, outbound: 12, stock: 28 },
            monthly: { inbound: 108, outbound: 36, stock: 28 },
            unit: "개",
          },
        ],
      },
      {
        equipmentName: "보조엔진",
        parts: [
          {
            partName: "연료 필터",
            partCode: "FF-001",
            daily: { inbound: 8, outbound: 3, stock: 22 },
            weekly: { inbound: 24, outbound: 9, stock: 22 },
            monthly: { inbound: 72, outbound: 27, stock: 22 },
            unit: "개",
          },
        ],
      },
    ],
  },
  "SHIP-002": {
    shipName: "부산호",
    equipments: [
      {
        equipmentName: "주엔진",
        parts: [
          {
            partName: "터보차저 블레이드",
            partCode: "TB-001",
            daily: { inbound: 8, outbound: 2, stock: 15 },
            weekly: { inbound: 24, outbound: 6, stock: 15 },
            monthly: { inbound: 72, outbound: 18, stock: 15 },
            unit: "개",
          },
        ],
      },
      {
        equipmentName: "보조엔진",
        parts: [
          {
            partName: "연료 필터",
            partCode: "FF-001",
            daily: { inbound: 15, outbound: 3, stock: 32 },
            weekly: { inbound: 45, outbound: 9, stock: 32 },
            monthly: { inbound: 135, outbound: 27, stock: 32 },
            unit: "개",
          },
        ],
      },
    ],
  },
}

export default function ShipInventoryDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const shipId = params.shipId as string
  const initialPeriod = (searchParams.get("period") as "daily" | "weekly" | "monthly") || "daily"

  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly">(initialPeriod)

  const shipData = mockShipInventoryData[shipId as keyof typeof mockShipInventoryData]

  if (!shipData) {
    return (
      <div className="p-6">
        <div className="text-center py-8 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>선박 정보를 찾을 수 없습니다</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/inventory">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              재고 관리로 돌아가기
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{shipData.shipName} 재고 현황</h1>
            <p className="text-gray-600">선택된 기간의 장비별 부품 재고 현황을 확인합니다</p>
          </div>
        </div>
        <Select
          value={selectedPeriod}
          onValueChange={(value: "daily" | "weekly" | "monthly") => setSelectedPeriod(value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">일일</SelectItem>
            <SelectItem value="weekly">주간</SelectItem>
            <SelectItem value="monthly">월간</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {shipData.equipments.map((equipment) => (
          <Card key={equipment.equipmentName}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {equipment.equipmentName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3">부품명</th>
                      <th className="text-left py-3">부품코드</th>
                      <th className="text-center py-3">입고</th>
                      <th className="text-center py-3">출고</th>
                      <th className="text-center py-3">재고</th>
                      <th className="text-center py-3">단위</th>
                    </tr>
                  </thead>
                  <tbody>
                    {equipment.parts.map((part) => {
                      const periodData = part[selectedPeriod]
                      return (
                        <tr key={part.partCode} className="border-b hover:bg-gray-50">
                          <td className="py-3 font-medium">{part.partName}</td>
                          <td className="py-3 text-gray-600">{part.partCode}</td>
                          <td className="py-3 text-center font-bold text-green-600">+{periodData.inbound}</td>
                          <td className="py-3 text-center font-bold text-red-600">-{periodData.outbound}</td>
                          <td className="py-3 text-center font-bold text-blue-600">{periodData.stock}</td>
                          <td className="py-3 text-center">{part.unit}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
