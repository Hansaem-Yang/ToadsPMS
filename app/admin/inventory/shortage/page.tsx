"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Search, Package, Calendar, BarChart3, History } from "lucide-react"

const mockShortageData = [
  {
    id: "SH-001",
    shipName: "한국호",
    shipId: "SHIP-001",
    equipmentName: "주엔진",
    partName: "피스톤 링",
    partCode: "PR-001",
    currentStock: 5,
    minStock: 20,
    shortage: 15,
    unit: "개",
    lastUsed: "2024-01-18",
    priority: "높음",
  },
  {
    id: "SH-002",
    shipName: "부산호",
    shipId: "SHIP-002",
    equipmentName: "보조엔진",
    partName: "연료 필터",
    partCode: "FF-001",
    currentStock: 8,
    minStock: 25,
    shortage: 17,
    unit: "개",
    lastUsed: "2024-01-19",
    priority: "높음",
  },
  {
    id: "SH-003",
    shipName: "한국호",
    shipId: "SHIP-001",
    equipmentName: "주엔진",
    partName: "터보차저 블레이드",
    partCode: "TB-001",
    currentStock: 2,
    minStock: 10,
    shortage: 8,
    unit: "개",
    lastUsed: "2024-01-17",
    priority: "중간",
  },
  {
    id: "SH-004",
    shipName: "부산호",
    shipId: "SHIP-002",
    equipmentName: "보조엔진",
    partName: "실린더 라이너",
    partCode: "CL-002",
    currentStock: 1,
    minStock: 15,
    shortage: 14,
    unit: "개",
    lastUsed: "2024-01-16",
    priority: "높음",
  },
  {
    id: "SH-005",
    shipName: "한국호",
    shipId: "SHIP-001",
    equipmentName: "보조엔진",
    partName: "오일 필터",
    partCode: "OF-001",
    currentStock: 3,
    minStock: 12,
    shortage: 9,
    unit: "개",
    lastUsed: "2024-01-15",
    priority: "중간",
  },
]

export default function ShortagePage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [selectedShip, setSelectedShip] = useState<string>("ALL")
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeMenu, setActiveMenu] = useState("shortage")

  const menuItems = [
    { id: "dashboard", label: "대시보드", icon: BarChart3 },
    { id: "status", label: "재고 현황", icon: Package },
    { id: "transactions", label: "입출고 내역", icon: History },
    { id: "shortage", label: "부족 부품", icon: AlertTriangle },
    { id: "statistics", label: "통계", icon: BarChart3 },
    { id: "parts", label: "부품 관리", icon: Package },
  ]
    
  useEffect(() => {
    try {
      const user = requireAuth()
      setUserInfo(user)
    } catch (error) {
      // Redirect handled by requireAuth
    }
  }, [])

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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "높음":
        return <Badge variant="destructive">높음</Badge>
      case "중간":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            중간
          </Badge>
        )
      case "낮음":
        return <Badge variant="outline">낮음</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const filteredShortageData = mockShortageData.filter((item) => {
    const matchesShip = selectedShip === "ALL" || item.shipId === selectedShip
    const matchesPriority = selectedPriority === "ALL" || item.priority === selectedPriority
    const matchesSearch =
      item.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.shipName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.equipmentName.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesShip && matchesPriority && matchesSearch
  })

  const totalShortage = filteredShortageData.reduce((sum, item) => sum + item.shortage, 0)
  const highPriorityCount = filteredShortageData.filter((item) => item.priority === "높음").length

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
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">부족 부품 현황</h1>
              <p className="text-gray-600">최소 보유 수량 미달 부품을 관리합니다</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">총 부족 부품</p>
                      <p className="text-2xl font-bold text-red-600">{filteredShortageData.length}개</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">총 부족 수량</p>
                      <p className="text-2xl font-bold text-orange-600">{totalShortage}개</p>
                    </div>
                    <Package className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">높은 우선순위</p>
                      <p className="text-2xl font-bold text-red-600">{highPriorityCount}개</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-64">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="부품명, 부품코드, 선박명, 장비명으로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedShip} onValueChange={setSelectedShip}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">전체 선박</SelectItem>
                      <SelectItem value="SHIP-001">한국호</SelectItem>
                      <SelectItem value="SHIP-002">부산호</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">전체 우선순위</SelectItem>
                      <SelectItem value="높음">높음</SelectItem>
                      <SelectItem value="중간">중간</SelectItem>
                      <SelectItem value="낮음">낮음</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  부족 부품 목록
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">우선순위</th>
                        <th className="text-left py-3">선박</th>
                        <th className="text-left py-3">장비</th>
                        <th className="text-left py-3">부품명</th>
                        <th className="text-left py-3">부품코드</th>
                        <th className="text-center py-3">현재재고</th>
                        <th className="text-center py-3">최소수량</th>
                        <th className="text-center py-3">부족수량</th>
                        <th className="text-center py-3">단위</th>
                        <th className="text-left py-3">최종사용일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShortageData.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{getPriorityBadge(item.priority)}</td>
                          <td className="py-3 font-medium text-blue-600">{item.shipName}</td>
                          <td className="py-3 text-gray-600">{item.equipmentName}</td>
                          <td className="py-3 font-medium">{item.partName}</td>
                          <td className="py-3 text-gray-600">{item.partCode}</td>
                          <td className="py-3 text-center font-bold text-red-600">{item.currentStock}</td>
                          <td className="py-3 text-center text-gray-600">{item.minStock}</td>
                          <td className="py-3 text-center font-bold text-orange-600">{item.shortage}</td>
                          <td className="py-3 text-center">{item.unit}</td>
                          <td className="py-3 text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.lastUsed).toLocaleDateString("ko-KR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredShortageData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>검색 조건에 맞는 부족 부품이 없습니다</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
