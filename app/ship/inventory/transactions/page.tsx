"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  AlertTriangle,
  Package,
  Search,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Warehouse,
  History,
  Edit,
  Filter,
} from "lucide-react"

const mockEquipmentPartMapping = {
  "ENG-001": ["PART-001", "PART-002", "PART-005"], // 주엔진: 피스톤 링, 실린더 라이너, 오일 필터
  "ENG-002": ["PART-003", "PART-005"], // 보조엔진: 연료 필터, 오일 필터
  "NAV-001": ["PART-004"], // GPS 시스템: GPS 안테나
}

// Mock data for transaction history
const mockTransactionData = [
  {
    id: "TXN-001",
    date: "2024-01-15",
    type: "입고",
    equipmentName: "주엔진",
    partName: "피스톤 링",
    partCode: "PR-001",
    warehouse: "창고 A-1",
    quantity: 10,
    unit: "개",
    reason: "정기 보충",
    registrant: "김철수",
  },
  {
    id: "TXN-002",
    date: "2024-01-14",
    type: "출고",
    equipmentName: "주엔진",
    partName: "피스톤 링",
    partCode: "PR-001",
    warehouse: "창고 A-1",
    quantity: 5,
    unit: "개",
    reason: "정비 작업",
    registrant: "이영희",
  },
  {
    id: "TXN-003",
    date: "2024-01-13",
    type: "재고조정",
    equipmentName: "보조엔진",
    partName: "연료 필터",
    partCode: "FF-001",
    warehouse: "창고 B-1",
    quantity: -1,
    unit: "개",
    reason: "실사 차이",
    registrant: "박민수",
  },
  {
    id: "TXN-004",
    date: "2024-01-12",
    type: "손망실",
    equipmentName: "GPS 시스템",
    partName: "GPS 안테나",
    partCode: "GPS-ANT-001",
    warehouse: "창고 C-1",
    quantity: -1,
    unit: "개",
    reason: "파손",
    registrant: "최수진",
  },
  {
    id: "TXN-005",
    date: "2024-01-11",
    type: "입고",
    equipmentName: "보조엔진",
    partName: "오일 필터",
    partCode: "OF-001",
    warehouse: "창고 A-2",
    quantity: 8,
    unit: "개",
    reason: "정기 보충",
    registrant: "김철수",
  },
]

const mockEquipmentList = [
  { id: "ENG-001", name: "주엔진" },
  { id: "ENG-002", name: "보조엔진" },
  { id: "NAV-001", name: "GPS 시스템" },
]

const mockPartsList = [
  { id: "PART-001", name: "피스톤 링", code: "PR-001" },
  { id: "PART-002", name: "실린더 라이너", code: "CL-001" },
  { id: "PART-003", name: "연료 필터", code: "FF-001" },
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

export default function ShipInventoryTransactionsPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedTransactionType, setSelectedTransactionType] = useState("ALL")
  const [selectedEquipment, setSelectedEquipment] = useState("ALL")
  const [selectedPart, setSelectedPart] = useState("ALL")
  const [selectedWarehouse, setSelectedWarehouse] = useState("ALL")
  const [transactions, setTransactions] = useState(mockTransactionData)
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const [typeFilter, setTypeFilter] = useState("ALL")
  const [equipmentFilter, setEquipmentFilter] = useState("")
  const [partFilter, setPartFilter] = useState("")
  const [warehouseFilter, setWarehouseFilter] = useState("")

  const [availableParts, setAvailableParts] = useState(mockPartsList)

  useEffect(() => {
    try {
      const user = requireAuth()
      setUserInfo(user)
      // Set default date range (last 7 days)
      const today = new Date()
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      setEndDate(today.toISOString().split("T")[0])
      setStartDate(lastWeek.toISOString().split("T")[0])
    } catch (error) {
      // Redirect handled by requireAuth
    }
  }, [])

  useEffect(() => {
    if (selectedEquipment && selectedEquipment !== "ALL") {
      const equipmentPartIds =
        mockEquipmentPartMapping[selectedEquipment as keyof typeof mockEquipmentPartMapping] || []
      const filteredParts = mockPartsList.filter((part) => equipmentPartIds.includes(part.id))
      setAvailableParts(filteredParts)
      // Reset part selection if current selection is not available for selected equipment
      if (selectedPart && selectedPart !== "ALL" && !equipmentPartIds.includes(selectedPart)) {
        setSelectedPart("ALL")
      }
    } else {
      setAvailableParts(mockPartsList)
    }
  }, [selectedEquipment, selectedPart])

  if (!userInfo) return null

  const handleSearch = () => {
    let filtered = transactions

    // Filter by date range
    if (startDate && endDate) {
      filtered = filtered.filter((txn) => {
        const txnDate = new Date(txn.date)
        const start = new Date(startDate)
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999) // Include end date
        return txnDate >= start && txnDate <= end
      })
    }

    // Filter by transaction type
    if (selectedTransactionType && selectedTransactionType !== "ALL") {
      filtered = filtered.filter((txn) => txn.type === selectedTransactionType)
    }

    // Filter by equipment
    if (selectedEquipment && selectedEquipment !== "ALL") {
      const equipment = mockEquipmentList.find((eq) => eq.id === selectedEquipment)
      if (equipment) {
        filtered = filtered.filter((txn) => txn.equipmentName === equipment.name)
      }
    }

    // Filter by part
    if (selectedPart && selectedPart !== "ALL") {
      const part = mockPartsList.find((p) => p.id === selectedPart)
      if (part) {
        filtered = filtered.filter((txn) => txn.partName === part.name)
      }
    }

    // Filter by warehouse
    if (selectedWarehouse && selectedWarehouse !== "ALL") {
      const warehouse = mockWarehouseList.find((w) => w.id === selectedWarehouse)
      if (warehouse) {
        filtered = filtered.filter((txn) => txn.warehouse === warehouse.name)
      }
    }

    setFilteredTransactions(filtered)
    setHasSearched(true)
  }

  const applyTableFilters = (transactions: any[]) => {
    let filtered = transactions

    if (typeFilter && typeFilter !== "ALL") {
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

  const getQuantityDisplay = (quantity: number, type: string) => {
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
  const getUniqueEquipments = () => [...new Set(filteredTransactions.map((txn) => txn.equipmentName))]
  const getUniqueWarehouses = () => [...new Set(filteredTransactions.map((txn) => txn.warehouse))]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userType={userInfo.user_auth} />
      <div className="flex">
        {/* ... existing sidebar code ... */}
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
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
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
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors bg-blue-50 text-blue-700 border border-blue-200"
              >
                <History className="w-4 h-4" />
                입출고 내역
              </button>
              <button
                onClick={() => router.push("/ship/inventory/initial-stock")}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
              >
                <Package className="w-4 h-4" />
                기초재고 등록
              </button>
              <button
                onClick={() => router.push("/ship/inventory/adjustment")}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
              >
                <Edit className="w-4 h-4" />
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
                <h1 className="text-2xl font-bold text-gray-900">입출고 내역</h1>
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
                              <td className="py-3 px-2">{transaction.equipmentName}</td>
                              <td className="py-3 px-2 font-medium">{transaction.partName}</td>
                              <td className="py-3 px-2 text-gray-600">{transaction.partCode}</td>
                              <td className="py-3 px-2">{transaction.warehouse}</td>
                              <td className="py-3 px-2 text-center font-medium">
                                {getQuantityDisplay(transaction.quantity, transaction.type)} {transaction.unit}
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
        </main>
      </div>
    </div>
  )
}
