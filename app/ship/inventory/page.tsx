"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingUp, BarChart3, Package, Settings, FileText, Warehouse, History } from "lucide-react"

// Mock data for ship inventory
const mockShipInventoryData = {
  shipId: "SHIP-001",
  shipName: "한국호",
  equipment: [
    {
      equipmentId: "ENG-001",
      equipmentName: "주엔진",
      parts: [
        {
          partId: "PART-001",
          partName: "피스톤 링",
          partCode: "PR-001",
          currentStock: 5,
          minStock: 10,
          unit: "개",
          status: "부족",
          lastUpdated: "2024-01-15",
          supplier: "현대중공업",
          location: "창고 A-1",
        },
        {
          partId: "PART-002",
          partName: "실린더 라이너",
          partCode: "CL-001",
          currentStock: 15,
          minStock: 8,
          unit: "개",
          status: "정상",
          lastUpdated: "2024-01-14",
          supplier: "두산엔진",
          location: "창고 A-2",
        },
      ],
    },
    {
      equipmentId: "ENG-002",
      equipmentName: "보조엔진",
      parts: [
        {
          partId: "PART-003",
          partName: "연료 필터",
          partCode: "FF-001",
          currentStock: 2,
          minStock: 5,
          unit: "개",
          status: "부족",
          lastUpdated: "2024-01-13",
          supplier: "만엔진",
          location: "창고 B-1",
        },
      ],
    },
    {
      equipmentId: "NAV-001",
      equipmentName: "GPS 시스템",
      parts: [
        {
          partId: "PART-004",
          partName: "GPS 안테나",
          partCode: "GPS-ANT-001",
          currentStock: 3,
          minStock: 2,
          unit: "개",
          status: "정상",
          lastUpdated: "2024-01-12",
          supplier: "후루노",
          location: "창고 C-1",
        },
      ],
    },
  ],
}

export default function ShipInventoryPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [inventoryData, setInventoryData] = useState(mockShipInventoryData)

  useEffect(() => {
    try {
      const user = requireAuth("ship")
      setUserInfo(user)
    } catch (error) {
      // Redirect handled by requireAuth
    }
  }, [])

  if (!userInfo) return null

  const shortageCount = inventoryData.equipment.reduce(
    (total, equip) => total + equip.parts.filter((part) => part.status === "부족").length,
    0,
  )

  const getShortagePartsByEquipment = () => {
    return inventoryData.equipment
      .map((equipment) => ({
        ...equipment,
        shortageParts: equipment.parts.filter((part) => part.status === "부족"),
      }))
      .filter((equipment) => equipment.shortageParts.length > 0)
  }

  const handleShortageClick = () => {
    router.push("/ship/inventory/shortage")
  }

  const shortageEquipment = getShortagePartsByEquipment()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">재고 관리</h2>
            <nav className="space-y-2">
              <button
                onClick={() => router.push("/ship/dashboard")}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors hover:bg-gray-50"
              >
                <BarChart3 className="w-4 h-4" />
                메인으로 돌아가기
              </button>
              <button
                onClick={() => router.push("/ship/inventory")}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors bg-blue-50 text-blue-700 border border-blue-200"
              >
                <Package className="w-4 h-4" />
                재고관리 대시보드
              </button>
              <button
                onClick={() => router.push("/ship/inventory/status")}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
              >
                <BarChart3 className="w-4 h-4" />
                재고현황
              </button>
              <button
                onClick={() => router.push("/ship/inventory/receiving")}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
              >
                <TrendingUp className="w-4 h-4" />
                부품입고
              </button>
              <button
                onClick={() => router.push("/ship/inventory/transactions")}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
              >
                <History className="w-4 h-4" />
                입출고 내역
              </button>
              <button
                onClick={() => router.push("/ship/inventory/initial-stock")}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
              >
                <FileText className="w-4 h-4" />
                기초재고 등록
              </button>
              <button
                onClick={() => router.push("/ship/inventory/adjustment")}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
              >
                <Settings className="w-4 h-4" />
                재고 조정
              </button>
              <button
                onClick={() => router.push("/ship/inventory/loss")}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
              >
                <AlertTriangle className="w-4 h-4" />
                손망실 처리
              </button>
              <button
                onClick={() => router.push("/ship/inventory/warehouse")}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
              >
                <Warehouse className="w-4 h-4" />
                창고관리
              </button>
            </nav>
          </div>
        </div>

        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">재고 관리 대시보드</h1>
                <p className="text-gray-600">{inventoryData.shipName}의 부품 재고를 관리합니다</p>
              </div>
            </div>

            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  부족 부품 현황
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-red-700">총 부족 부품 수</span>
                    <Badge variant="destructive" className="text-lg px-3 py-1">
                      {shortageCount}개
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">장비별 부족 부품</h4>
                    {shortageEquipment.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {shortageEquipment.map((equipment) => (
                          <Card key={equipment.equipmentId} className="border border-red-200">
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-medium text-gray-900">{equipment.equipmentName}</h5>
                                  <Badge variant="destructive" className="text-xs">
                                    {equipment.shortageParts.length}개 부족
                                  </Badge>
                                </div>
                                <div className="space-y-1">
                                  {equipment.shortageParts.map((part) => (
                                    <div key={part.partId} className="flex justify-between items-center text-sm">
                                      <span className="text-gray-700">{part.partName}</span>
                                      <span className="text-red-600 font-medium">
                                        {part.currentStock}/{part.minStock} {part.unit}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>부족한 부품이 없습니다</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push("/ship/inventory/status")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">재고 현황</h3>
                      <p className="text-sm text-gray-600">모든 부품의 재고 상태를 확인합니다</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push("/ship/inventory/receiving")}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">부품 입고</h3>
                      <p className="text-sm text-gray-600">새로운 부품을 입고 등록합니다</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
