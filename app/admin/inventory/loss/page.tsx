"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Package, Search, BarChart3, History } from "lucide-react"

// Mock data for loss records
const mockLossData = [
  {
    id: "LOSS-001",
    date: "2024-01-20",
    shipName: "한국호",
    equipmentName: "주엔진",
    partName: "피스톤 링",
    partCode: "PR-001",
    quantity: 2,
    unit: "개",
    registrant: "김선장",
    reason: "작업 중 파손",
  },
  {
    id: "LOSS-002",
    date: "2024-01-19",
    shipName: "부산호",
    equipmentName: "보조엔진",
    partName: "연료 필터",
    partCode: "FF-001",
    quantity: 1,
    unit: "개",
    registrant: "이기관장",
    reason: "노후로 인한 손상",
  },
  {
    id: "LOSS-003",
    date: "2024-01-18",
    shipName: "한국호",
    equipmentName: "GPS 시스템",
    partName: "GPS 안테나",
    partCode: "GPS-ANT-001",
    quantity: 1,
    unit: "개",
    registrant: "박항해사",
    reason: "강풍으로 인한 파손",
  },
]

const shipList = [
  { id: "SHIP-001", name: "한국호" },
  { id: "SHIP-002", name: "부산호" },
  { id: "SHIP-003", name: "인천호" },
  { id: "SHIP-004", name: "울산호" },
  { id: "SHIP-005", name: "광주호" },
]

export default function AdminInventoryLossPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedShip, setSelectedShip] = useState<string>("ALL")
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredData, setFilteredData] = useState(mockLossData)

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

  const handleSearch = () => {
    const filtered = mockLossData.filter((item) => {
      const itemDate = new Date(item.date)
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)

      const dateMatch = itemDate >= start && itemDate <= end
      const shipMatch = selectedShip === "ALL" || item.shipName === selectedShip
      const searchMatch =
        searchTerm === "" ||
        item.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.partCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reason.toLowerCase().includes(searchTerm.toLowerCase())

      return dateMatch && shipMatch && searchMatch
    })

    setFilteredData(filtered)
  }

  useEffect(() => {
    try {
      const user = requireAuth("admin")
      setUserInfo(user)
    } catch (error) {
      // Redirect handled by requireAuth
    }
  }, [])

  useEffect(() => {
    handleSearch()
  }, [startDate, endDate, selectedShip, searchTerm])

  if (!userInfo) return null

  const menuItems = [
    { id: "dashboard", label: "대시보드", icon: BarChart3 },
    { id: "status", label: "재고 현황", icon: Package },
    { id: "transactions", label: "입출고 내역", icon: History },
    { id: "shortage", label: "부족 부품", icon: AlertTriangle },
    { id: "statistics", label: "통계", icon: BarChart3 },
    { id: "parts", label: "부품 관리", icon: Package },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
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
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-gray-900"
                  onClick={() => handleMenuClick(item.id)}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>

        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">손망실 부품 조회</h1>
              <p className="text-gray-600">선박별 부품 손망실 내역을 조회합니다</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  조회 조건
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="startDate">시작일</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">종료일</Label>
                    <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="ship">선박</Label>
                    <Select value={selectedShip} onValueChange={setSelectedShip}>
                      <SelectTrigger>
                        <SelectValue placeholder="선박 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">전체</SelectItem>
                        {shipList.map((ship) => (
                          <SelectItem key={ship.id} value={ship.name}>
                            {ship.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="search">검색</Label>
                    <Input
                      id="search"
                      placeholder="부품명, 코드, 사유..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  손망실 내역 ({filteredData.length}건)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredData.length > 0 ? (
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-3 px-2">일자</th>
                          <th className="text-left py-3 px-2">선박</th>
                          <th className="text-left py-3 px-2">장비명</th>
                          <th className="text-left py-3 px-2">부품명</th>
                          <th className="text-left py-3 px-2">부품코드</th>
                          <th className="text-center py-3 px-2">손망실 수량</th>
                          <th className="text-center py-3 px-2">단위</th>
                          <th className="text-left py-3 px-2">등록자</th>
                          <th className="text-left py-3 px-2">사유</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2">{item.date}</td>
                            <td className="py-3 px-2 font-medium">{item.shipName}</td>
                            <td className="py-3 px-2">{item.equipmentName}</td>
                            <td className="py-3 px-2 font-medium">{item.partName}</td>
                            <td className="py-3 px-2 text-gray-600">{item.partCode}</td>
                            <td className="py-3 px-2 text-center font-bold text-orange-600">{item.quantity}</td>
                            <td className="py-3 px-2 text-center">{item.unit}</td>
                            <td className="py-3 px-2">{item.registrant}</td>
                            <td className="py-3 px-2 text-gray-600">{item.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">조회 조건에 맞는 손망실 내역이 없습니다.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
