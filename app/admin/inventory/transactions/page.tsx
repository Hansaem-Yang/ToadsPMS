"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Package,
  Search,
  BarChart3,
  AlertTriangle,
  History,
  TrendingUp,
  TrendingDown,
  Edit,
  Filter,
} from "lucide-react"

const mockEquipmentPartMapping = {
  "ENG-001": ["PART-001", "PART-002", "PART-005"], // 주엔진: 피스톤 링, 실린더 라이너, 오일 필터
  "ENG-002": ["PART-003", "PART-005"], // 보조엔진: 연료 필터, 오일 필터
  "NAV-001": ["PART-004"], // GPS 시스템: GPS 안테나
}

const mockWeeklyTransactions = [
  {
    id: "TXN-001",
    date: "2024-01-20",
    type: "입고",
    shipId: "SHIP-001",
    shipName: "한국호",
    equipmentName: "주엔진",
    partName: "피스톤 링",
    partCode: "PR-001",
    warehouse: "창고 A-1",
    quantity: 20,
    unit: "개",
    supplier: "현대중공업",
    reference: "PO-2024-001",
    reason: "정기 보충",
    registrant: "김철수",
  },
  {
    id: "TXN-002",
    date: "2024-01-21",
    type: "출고",
    shipId: "SHIP-001",
    shipName: "한국호",
    equipmentName: "주엔진",
    partName: "피스톤 링",
    partCode: "PR-001",
    warehouse: "창고 A-1",
    quantity: -5,
    unit: "개",
    supplier: "",
    reference: "WO-2024-001",
    reason: "정비 작업",
    registrant: "이영희",
  },
  {
    id: "TXN-003",
    date: "2024-01-22",
    type: "재고조정",
    shipId: "SHIP-002",
    shipName: "부산호",
    equipmentName: "보조엔진",
    partName: "연료 필터",
    partCode: "FF-002",
    warehouse: "창고 B-1",
    quantity: -1,
    unit: "개",
    supplier: "",
    reference: "ADJ-2024-001",
    reason: "실사 차이",
    registrant: "박민수",
  },
  {
    id: "TXN-004",
    date: "2024-01-23",
    type: "손망실",
    shipId: "SHIP-002",
    shipName: "부산호",
    equipmentName: "GPS 시스템",
    partName: "GPS 안테나",
    partCode: "GPS-ANT-001",
    warehouse: "창고 C-1",
    quantity: -1,
    unit: "개",
    supplier: "",
    reference: "LOSS-2024-001",
    reason: "파손",
    registrant: "최수진",
  },
  {
    id: "TXN-005",
    date: "2024-01-24",
    type: "입고",
    shipId: "SHIP-003",
    shipName: "인천호",
    equipmentName: "보조엔진",
    partName: "오일 필터",
    partCode: "OF-001",
    warehouse: "창고 A-2",
    quantity: 8,
    unit: "개",
    supplier: "삼성중공업",
    reference: "PO-2024-003",
    reason: "정기 보충",
    registrant: "김철수",
  },
]

const shipList = [
  { id: "SHIP-001", name: "한국호" },
  { id: "SHIP-002", name: "부산호" },
  { id: "SHIP-003", name: "인천호" },
  { id: "SHIP-004", name: "울산호" },
  { id: "SHIP-005", name: "광주호" },
]

const mockEquipmentList = [
  { id: "ENG-001", name: "주엔진" },
  { id: "ENG-002", name: "보조엔진" },
  { id: "NAV-001", name: "GPS 시스템" },
]

const mockPartsList = [
  { id: "PART-001", name: "피스톤 링", code: "PR-001" },
  { id: "PART-002", name: "실린더 라이너", code: "CL-001" },
  { id: "PART-003", name: "연료 필터", code: "FF-002" },
  { id: "PART-004", name: "GPS 안테나", code: "GPS-ANT-001" },
  { id: "PART-005", name: "오일 필터", code: "OF-001" },
]

const mockWarehouseList = [
  { id: "WH-001", name: "창고 A-1" },
  { id: "WH-002", name: "창고 A-2" },
  { id: "WH-003", name: "창고 B-1" },
  { id: "WH-004", name: "창고 B-2" },
  { id: "WH-005", name: "창고 C-1" },
]

const getTodayDate = () => {
  const today = new Date()
  return today.toISOString().split("T")[0]
}

const getWeekAgoDate = () => {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  return weekAgo.toISOString().split("T")[0]
}

export default function InventoryTransactionsPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [activeMenu, setActiveMenu] = useState("transactions")
  const [selectedShip, setSelectedShip] = useState<string>("ALL")
  const [startDate, setStartDate] = useState(getWeekAgoDate())
  const [endDate, setEndDate] = useState(getTodayDate())

  const [selectedTransactionType, setSelectedTransactionType] = useState("ALL")
  const [selectedEquipment, setSelectedEquipment] = useState("ALL")
  const [selectedPart, setSelectedPart] = useState("ALL")
  const [selectedWarehouse, setSelectedWarehouse] = useState("ALL")
  const [availableParts, setAvailableParts] = useState(mockPartsList)

  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const [typeFilter, setTypeFilter] = useState("ALL")
  const [equipmentFilter, setEquipmentFilter] = useState("")
  const [partFilter, setPartFilter] = useState("")
  const [warehouseFilter, setWarehouseFilter] = useState("")

  useEffect(() => {
    if (selectedEquipment && selectedEquipment !== "ALL") {
      const equipmentPartIds =
        mockEquipmentPartMapping[selectedEquipment as keyof typeof mockEquipmentPartMapping] || []
      const filteredParts = mockPartsList.filter((part) => equipmentPartIds.includes(part.id))
      setAvailableParts(filteredParts)
      if (selectedPart && selectedPart !== "ALL" && !equipmentPartIds.includes(selectedPart)) {
        setSelectedPart("ALL")
      }
    } else {
      setAvailableParts(mockPartsList)
    }
  }, [selectedEquipment, selectedPart])

  useEffect(() => {
    try {
      const user = requireAuth("admin")
      setUserInfo(user)
    } catch (error) {
      // Redirect handled by requireAuth
    }
  }, [])

  if (!userInfo) return null

  const menuItems = [
    { id: "dashboard", label: "대시보드", icon: BarChart3 },
    { id: "status", label: "재고 현황", icon: Package },
    { id: "transactions", label: "입출고 내역", icon: History },
    { id: "shortage", label: "부족 부품", icon: AlertTriangle },
    { id: "statistics", label: "통계", icon: BarChart3 },
    { id: "parts", label: "부품 관리", icon: Package },
  ]

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
    let filtered = mockWeeklyTransactions

    // Filter by date range
    if (startDate && endDate) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        const start = new Date(startDate)
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
        return transactionDate >= start && transactionDate <= end
      })
    }

    // Filter by ship
    if (selectedShip !== "ALL") {
      filtered = filtered.filter((transaction) => transaction.shipId === selectedShip)
    }

    // Filter by transaction type
    if (selectedTransactionType !== "ALL") {
      filtered = filtered.filter((transaction) => transaction.type === selectedTransactionType)
    }

    // Filter by equipment
    if (selectedEquipment !== "ALL") {
      const equipment = mockEquipmentList.find((eq) => eq.id === selectedEquipment)
      if (equipment) {
        filtered = filtered.filter((transaction) => transaction.equipmentName === equipment.name)
      }
    }

    // Filter by part
    if (selectedPart !== "ALL") {
      const part = mockPartsList.find((p) => p.id === selectedPart)
      if (part) {
        filtered = filtered.filter((transaction) => transaction.partName === part.name)
      }
    }

    // Filter by warehouse
    if (selectedWarehouse !== "ALL") {
      const warehouse = mockWarehouseList.find((w) => w.id === selectedWarehouse)
      if (warehouse) {
        filtered = filtered.filter((transaction) => transaction.warehouse === warehouse.name)
      }
    }

    setFilteredTransactions(filtered)
    setHasSearched(true)
  }

  const applyTableFilters = (transactions: any[]) => {
    let filtered = transactions

    if (typeFilter !== "ALL") {
      filtered = filtered.filter((txn) => txn.type === typeFilter)
    }

    if (equipmentFilter) {
      filtered = filtered.filter((txn) => txn.equipmentName.toLowerCase().includes(equipmentFilter.toLowerCase()))
    }

    if (partFilter) {
      filtered = filtered.filter(
        (txn) =>
          txn.partName.toLowerCase().includes(partFilter.toLowerCase()) ||
          txn.partCode.toLowerCase().includes(partFilter.toLowerCase()),
      )
    }

    if (warehouseFilter) {
      filtered = filtered.filter((txn) => txn.warehouse.toLowerCase().includes(warehouseFilter.toLowerCase()))
    }

    return filtered
  }

  const displayedTransactions = applyTableFilters(filteredTransactions)

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case "입고":
        return (
          <Badge className="bg-green-100 text-green-800">
            <TrendingUp className="w-3 h-3 mr-1" />
            입고
          </Badge>
        )
      case "출고":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <TrendingDown className="w-3 h-3 mr-1" />
            출고
          </Badge>
        )
      case "재고조정":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <Edit className="w-3 h-3 mr-1" />
            재고조정
          </Badge>
        )
      case "손망실":
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            손망실
          </Badge>
        )
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const getQuantityDisplay = (quantity: number) => {
    const isNegative = quantity < 0
    const displayQuantity = Math.abs(quantity)

    return (
      <span className={isNegative ? "text-red-600" : "text-green-600"}>
        {isNegative ? "-" : "+"}
        {displayQuantity}
      </span>
    )
  }

  const getUniqueTypes = () => [...new Set(filteredTransactions.map((txn) => txn.type))]

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
                  <h2 className="text-xl font-bold text-gray-900">입출고 내역</h2>
                  <p className="text-gray-600">부품의 입고, 출고, 재고조정, 손망실 내역을 조회합니다</p>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    조회 조건
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>시작일자 *</Label>
                      <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>종료일자 *</Label>
                      <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>선박 (선택사항)</Label>
                      <Select value={selectedShip} onValueChange={setSelectedShip}>
                        <SelectTrigger>
                          <SelectValue placeholder="전체 선박" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">전체 선박</SelectItem>
                          {shipList.map((ship) => (
                            <SelectItem key={ship.id} value={ship.id}>
                              {ship.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>구분 (선택사항)</Label>
                      <Select value={selectedTransactionType} onValueChange={setSelectedTransactionType}>
                        <SelectTrigger>
                          <SelectValue placeholder="전체" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">전체</SelectItem>
                          <SelectItem value="입고">입고</SelectItem>
                          <SelectItem value="출고">출고</SelectItem>
                          <SelectItem value="재고조정">재고조정</SelectItem>
                          <SelectItem value="손망실">손망실</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>장비 (선택사항)</Label>
                      <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                        <SelectTrigger>
                          <SelectValue placeholder="전체" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">전체</SelectItem>
                          {mockEquipmentList.map((equipment) => (
                            <SelectItem key={equipment.id} value={equipment.id}>
                              {equipment.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>부품 (선택사항)</Label>
                      <Select value={selectedPart} onValueChange={setSelectedPart}>
                        <SelectTrigger>
                          <SelectValue placeholder="전체" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">전체</SelectItem>
                          {availableParts.map((part) => (
                            <SelectItem key={part.id} value={part.id}>
                              {part.name} ({part.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>창고 (선택사항)</Label>
                      <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                        <SelectTrigger>
                          <SelectValue placeholder="전체" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">전체</SelectItem>
                          {mockWarehouseList.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleSearch} className="w-full">
                        <Search className="w-4 h-4 mr-2" />
                        조회
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {hasSearched && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="w-5 h-5" />
                      입출고 내역 ({displayedTransactions.length}건)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {filteredTransactions.length > 0 && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Filter className="w-4 h-4" />
                          <span className="text-sm font-medium">테이블 필터</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">구분</Label>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="전체" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ALL">전체</SelectItem>
                                {getUniqueTypes().map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">장비</Label>
                            <Input
                              placeholder="장비명 검색"
                              value={equipmentFilter}
                              onChange={(e) => setEquipmentFilter(e.target.value)}
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">부품</Label>
                            <Input
                              placeholder="부품명/코드 검색"
                              value={partFilter}
                              onChange={(e) => setPartFilter(e.target.value)}
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">창고</Label>
                            <Input
                              placeholder="창고명 검색"
                              value={warehouseFilter}
                              onChange={(e) => setWarehouseFilter(e.target.value)}
                              className="h-8"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {displayedTransactions.length > 0 ? (
                      <div className="overflow-auto">
                        <table className="w-full text-sm">
                          <thead className="border-b">
                            <tr>
                              <th className="text-left py-3 px-2">일자</th>
                              <th className="text-left py-3 px-2">구분</th>
                              <th className="text-left py-3 px-2">선박</th>
                              <th className="text-left py-3 px-2">장비</th>
                              <th className="text-left py-3 px-2">부품명</th>
                              <th className="text-left py-3 px-2">부품코드</th>
                              <th className="text-left py-3 px-2">창고</th>
                              <th className="text-center py-3 px-2">수량</th>
                              <th className="text-left py-3 px-2">사유</th>
                              <th className="text-left py-3 px-2">등록자</th>
                            </tr>
                          </thead>
                          <tbody>
                            {displayedTransactions.map((transaction) => (
                              <tr key={transaction.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-2">{transaction.date}</td>
                                <td className="py-3 px-2">{getTransactionTypeBadge(transaction.type)}</td>
                                <td className="py-3 px-2">{transaction.shipName}</td>
                                <td className="py-3 px-2">{transaction.equipmentName}</td>
                                <td className="py-3 px-2 font-medium">{transaction.partName}</td>
                                <td className="py-3 px-2 text-gray-600">{transaction.partCode}</td>
                                <td className="py-3 px-2">{transaction.warehouse}</td>
                                <td className="py-3 px-2 text-center font-medium">
                                  {getQuantityDisplay(transaction.quantity)} {transaction.unit}
                                </td>
                                <td className="py-3 px-2">{transaction.reason}</td>
                                <td className="py-3 px-2">{transaction.registrant}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        {filteredTransactions.length === 0
                          ? "조회 조건에 맞는 내역이 없습니다."
                          : "필터 조건에 맞는 내역이 없습니다."}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
