"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Package, BarChart3, AlertTriangle, History } from "lucide-react"

const mockInventoryData = {
  daily: [
    {
      date: "2024-01-20",
      shipName: "한국호",
      equipmentName: "주엔진",
      partName: "피스톤 링",
      partCode: "PR-001",
      inbound: 20,
      outbound: 8,
      loss: 2, // Added loss field to mock data
      stock: 45,
      unit: "개",
    },
    {
      date: "2024-01-20",
      shipName: "부산호",
      equipmentName: "보조엔진",
      partName: "연료 필터",
      partCode: "FF-001",
      inbound: 15,
      outbound: 3,
      loss: 1, // Added loss field to mock data
      stock: 32,
      unit: "개",
    },
    {
      date: "2024-01-19",
      shipName: "한국호",
      equipmentName: "주엔진",
      partName: "실린더 라이너",
      partCode: "CL-001",
      inbound: 12,
      outbound: 4,
      loss: 0, // Added loss field to mock data
      stock: 28,
      unit: "개",
    },
  ],
  weekly: [
    {
      week: "2024-W03",
      shipName: "한국호",
      equipmentName: "주엔진",
      partName: "피스톤 링",
      partCode: "PR-001",
      inbound: 60,
      outbound: 25,
      loss: 5, // Added loss field to mock data
      stock: 45,
      unit: "개",
    },
    {
      week: "2024-W03",
      shipName: "부산호",
      equipmentName: "보조엔진",
      partName: "연료 필터",
      partCode: "FF-001",
      inbound: 45,
      outbound: 18,
      loss: 2, // Added loss field to mock data
      stock: 32,
      unit: "개",
    },
  ],
  monthly: [
    {
      month: "2024-01",
      shipName: "한국호",
      equipmentName: "주엔진",
      partName: "피스톤 링",
      partCode: "PR-001",
      inbound: 180,
      outbound: 95,
      loss: 15, // Added loss field to mock data
      stock: 45,
      unit: "개",
    },
    {
      month: "2024-01",
      shipName: "부산호",
      equipmentName: "보조엔진",
      partName: "연료 필터",
      partCode: "FF-001",
      inbound: 120,
      outbound: 68,
      loss: 8, // Added loss field to mock data
      stock: 32,
      unit: "개",
    },
  ],
}

const mockShortageData = [
  {
    shipName: "한국호",
    equipmentName: "주엔진",
    partName: "피스톤 링",
    partCode: "PR-001",
    currentStock: 5,
    minStock: 20,
    shortage: 15,
    unit: "개",
    lastUsed: "2024-01-18",
  },
  {
    shipName: "부산호",
    equipmentName: "보조엔진",
    partName: "연료 필터",
    partCode: "FF-001",
    currentStock: 8,
    minStock: 25,
    shortage: 17,
    unit: "개",
    lastUsed: "2024-01-19",
  },
]

const mockLossData = [
  {
    shipName: "한국호",
    equipmentName: "주엔진",
    partName: "피스톤 링",
    partCode: "PR-001",
    lossQuantity: 2,
    unit: "개",
    lossDate: "2024-01-18",
    reason: "작업 중 파손",
  },
  {
    shipName: "부산호",
    equipmentName: "보조엔진",
    partName: "연료 필터",
    partCode: "FF-001",
    lossQuantity: 1,
    unit: "개",
    lossDate: "2024-01-19",
    reason: "노후로 인한 손상",
  },
]

const shipList = [
  { id: "SHIP-001", name: "한국호" },
  { id: "SHIP-002", name: "부산호" },
  { id: "SHIP-003", name: "인천호" },
  { id: "SHIP-004", name: "울산호" },
  { id: "SHIP-005", name: "광주호" },
]

export default function InventoryStatusPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [activeMenu, setActiveMenu] = useState("status")
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly">("daily")
  const [selectedGroupBy, setSelectedGroupBy] = useState<"ship" | "equipment" | "part">("ship")

  const menuItems = [
    { id: "dashboard", label: "대시보드", icon: BarChart3 },
    { id: "status", label: "재고 현황", icon: Package },
    { id: "transactions", label: "입출고 내역", icon: History },
    { id: "shortage", label: "부족 부품", icon: AlertTriangle },
    { id: "statistics", label: "통계", icon: BarChart3 },
    { id: "parts", label: "부품 관리", icon: Package },
  ]

  const getCurrentInventoryData = () => {
    return mockInventoryData[selectedPeriod] || []
  }

  const getGroupedData = () => {
    const data = getCurrentInventoryData()
    const grouped: Record<string, any[]> = {}

    data.forEach((item) => {
      let key = ""
      switch (selectedGroupBy) {
        case "ship":
          key = item.shipName
          break
        case "equipment":
          key = `${item.shipName} - ${item.equipmentName}`
          break
        case "part":
          key = item.partName
          break
      }

      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(item)
    })

    return grouped
  }

  const handleShipClick = (shipName: string) => {
    const shipId = shipList.find((ship) => ship.name === shipName)?.id || "ALL"
    router.push(`/admin/inventory/ship/${shipId}?period=${selectedPeriod}`)
  }

  const handleMenuClick = (menuId: string) => {
    if (menuId === "dashboard") {
      router.push("/admin/dashboard")
    } else if (menuId === "status") {
      router.push("/admin/inventory/status")
    } else if (menuId === "transactions") {
      router.push("/admin/inventory/transactions")
    } else if (menuId === "shortage") {
      router.push("/admin/inventory/shortage")
    } else if (menuId === "statistics") {
      router.push("/admin/inventory/statistics")
    } else if (menuId === "parts") {
      router.push("/admin/inventory/parts")
    }
  }

  const handleShortageClick = () => {
    router.push("/admin/inventory/shortage")
  }

  const handleLossClick = () => {
    router.push("/admin/inventory/loss")
  }

  const groupedData = getGroupedData()
  const shortageCount = mockShortageData.length
  const lossCount = mockLossData.length // Added loss count

  const getTableHeaders = () => {
    const headers = []
    if (selectedGroupBy !== "ship") headers.push({ key: "ship", label: "선박", align: "text-left" })
    if (selectedGroupBy !== "equipment") headers.push({ key: "equipment", label: "장비", align: "text-left" })
    if (selectedGroupBy !== "part") headers.push({ key: "part", label: "부품명", align: "text-left" })
    headers.push(
      { key: "partCode", label: "부품코드", align: "text-left" },
      { key: "inbound", label: "입고", align: "text-center" },
      { key: "outbound", label: "출고", align: "text-center" },
      { key: "loss", label: "손망실", align: "text-center" },
      { key: "stock", label: "재고", align: "text-center" },
      { key: "unit", label: "단위", align: "text-center" },
      { key: "period", label: "기간", align: "text-left" },
    )
    return headers
  }
    
  useEffect(() => {
    try {
      const user = requireAuth()
      setUserInfo(user)
    } catch (error) {
      // Redirect handled by requireAuth
    }
  }, [])

  const getTableCells = (item: any, index: number) => {
    const cells = []

    if (selectedGroupBy !== "ship") {
      cells.push(
        <td key="ship" className="py-3 font-medium">
          <button
            onClick={() => handleShipClick(item.shipName)}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            {item.shipName}
          </button>
        </td>,
      )
    }

    if (selectedGroupBy !== "equipment") {
      cells.push(
        <td key="equipment" className="py-3 text-gray-600">
          {item.equipmentName}
        </td>,
      )
    }

    if (selectedGroupBy !== "part") {
      cells.push(
        <td key="part" className="py-3 font-medium">
          {item.partName}
        </td>,
      )
    }

    cells.push(
      <td key="partCode" className="py-3 text-gray-600">
        {item.partCode}
      </td>,
      <td key="inbound" className="py-3 text-center font-bold text-green-600">
        +{item.inbound}
      </td>,
      <td key="outbound" className="py-3 text-center font-bold text-red-600">
        -{item.outbound}
      </td>,
      <td key="loss" className="py-3 text-center font-bold text-orange-600">
        -{item.loss}
      </td>,
      <td key="stock" className="py-3 text-center font-bold text-blue-600">
        {item.stock}
      </td>,
      <td key="unit" className="py-3 text-center">
        {item.unit}
      </td>,
      <td key="period" className="py-3 text-gray-500">
        {selectedPeriod === "daily" && item.date}
        {selectedPeriod === "weekly" && item.week}
        {selectedPeriod === "monthly" && item.month}
      </td>,
    )

    return cells
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userType={userInfo.user_auth} />
      <div className="flex">
        <div className="w-64 bg-white shadow-sm border-r">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">재고 관리</h1>
            <p className="text-sm text-gray-600">부품 재고 통합 관리</p>
          </div>
          <nav className="px-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeMenu === item.id ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    activeMenu === item.id
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => handleMenuClick(item.id)}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">재고 현황</h2>
                  <p className="text-gray-600">선박별, 장비별, 부품별 재고 현황을 확인합니다</p>
                </div>
                <div className="flex gap-2">
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
                  <Select
                    value={selectedGroupBy}
                    onValueChange={(value: "ship" | "equipment" | "part") => setSelectedGroupBy(value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ship">선박별</SelectItem>
                      <SelectItem value="equipment">장비별</SelectItem>
                      <SelectItem value="part">부품별</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow border-red-200 bg-red-50"
                  onClick={handleShortageClick}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-600 font-medium">부족 부품</p>
                        <p className="text-2xl font-bold text-red-700">{shortageCount}개</p>
                        <p className="text-xs text-red-500">최소 보유 수량 미달</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow border-orange-200 bg-orange-50"
                  onClick={handleLossClick}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-600 font-medium">손망실 부품</p>
                        <p className="text-2xl font-bold text-orange-700">{lossCount}건</p>
                        <p className="text-xs text-orange-500">최근 손망실 발생</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {Object.entries(groupedData).map(([groupName, items]) => (
                  <Card key={groupName}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        {selectedGroupBy === "ship" ? (
                          <button
                            onClick={() => handleShipClick(groupName)}
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {groupName}
                          </button>
                        ) : (
                          groupName
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              {getTableHeaders().map((header) => (
                                <th key={header.key} className={`${header.align} py-2`}>
                                  {header.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {items.map((item, index) => (
                              <tr key={index} className="border-b hover:bg-gray-50">
                                {getTableCells(item, index)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
