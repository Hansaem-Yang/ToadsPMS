"use client"

import { useEffect, useState } from "react"
import { requireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/inventory/sidebar"
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
  Pointer,
} from "lucide-react"
import { Vessel as VesselCode } from '@/types/common/vessel'; // ✅ interface import
import { Transactions } from '@/types/inventory/transactions/transactions'; // ✅ interface import

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
  const initialTransaction : Transactions = {
    vessel_no: "",
    vessel_name: "",
    date: "",
    type: "",
    no: "",
    material_code: "",
    material_name: "",
    machine_id: "",
    machine_name: "",
    location: "",
    unit: "",
    qty: 0,
    reason: "",
    regist_user: "",
    registrant: "",
    start_date: "",
    end_date: "",
  }
  const [userInfo, setUserInfo] = useState<any>(null)
  const [vesselCodes, setVesselCodes] = useState<VesselCode[]>([])
  const [selectedVesselCode, setSelectedVesselCode] = useState<VesselCode>()

  const [transactionsData, setTransactionsData] = useState<Transactions[]>([]);
  const [filteredData, setFilteredData] = useState<Transactions[]>(transactionsData)
  

  const [searchData, setSearchData] = useState<Transactions>(initialTransaction);
  const [hasSearched, setHasSearched] = useState(false)

  const [typeFilter, setTypeFilter] = useState("all")
  const [machineFilter, setMachineFilter] = useState("")
  const [materialFilter, setMaterialFilter] = useState("")
  const [warehouseFilter, setWarehouseFilter] = useState("")
  
  const fetchVesselCodes = () => {
    fetch(`/api/admin/common/vessel`)
      .then(res => res.json())
      .then(data => setVesselCodes(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    try {
      const user = requireAuth()
      setUserInfo(user)
      
      fetchVesselCodes()

      setSearchData((prev: any) => ({ ...prev, start_date: getWeekAgoDate() }))
      setSearchData((prev: any) => ({ ...prev, end_date: getTodayDate() }))

    } catch (error) {
      // Redirect handled by requireAuth
    }
  }, [])

  useEffect(() => {
    let filtered = transactionsData

    if (typeFilter !== "all") {
      filtered = filtered.filter((txn) => txn.type === typeFilter)
    }

    if (machineFilter) {
      filtered = filtered.filter((txn) => txn.machine_name.toLowerCase().includes(machineFilter.toLowerCase()))
    }

    if (materialFilter) {
      filtered = filtered.filter(
        (txn) =>
          txn.material_name.toLowerCase().includes(materialFilter.toLowerCase()) ||
          txn.material_code.toLowerCase().includes(materialFilter.toLowerCase()),
      )
    }

    if (warehouseFilter) {
      filtered = filtered.filter((txn) => txn.location.toLowerCase().includes(warehouseFilter.toLowerCase()))
    }

    setFilteredData(filtered);

  }, [transactionsData, typeFilter, machineFilter, materialFilter, warehouseFilter])

  if (!userInfo) return null

  const handleSearch = async () => {
    const res = await fetch(`/api/admin/inventory/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(searchData),
    });

    const data = await res.json();
    setTransactionsData(data);

    setHasSearched(true)
  }

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case "I0":
        return (
          <Badge className="bg-green-100 text-green-800">
            <TrendingUp className="w-3 h-3 mr-1" />
            입고
          </Badge>
        )
      case "O0":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <TrendingDown className="w-3 h-3 mr-1" />
            출고
          </Badge>
        )
      case "AI":
      case "AO":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <Edit className="w-3 h-3 mr-1" />
            재고조정
          </Badge>
        )
      case "L0":
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

  const getTransactionType = (type: string) => {
    switch (type) {
      case "I0":
        return '정상입고'
      case "O0":
        return '정상출고'
      case "AI":
        return '재고조정 - 입고'
      case "AO":
        return '재고조정 - 출고'
      case "L0":
        return '손망실'
    }
  }

  const getQuantityDisplay = (type: string, quantity: number) => {
    const isNegative = type === 'AO' || type === 'O0' || type === 'L0'
    const displayQuantity = Math.abs(quantity)

    return (
      <span className={isNegative ? "text-red-600" : "text-green-600"}>
        {isNegative ? "-" : "+"}
        {displayQuantity}
      </span>
    )
  }

  const vesselChanged = (vesselNo: string) => {
    setSearchData((prev: any) => ({ ...prev, vessel_no: vesselNo }))
    setSelectedVesselCode(vesselCodes.find(vessel => vessel.vessel_no === vesselNo))
  }

  const getUniqueTypes = () => [...new Set(filteredData.map((txn) => txn.type))]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userType={userInfo.user_auth} />
      <div className="flex">
        <Sidebar userType={userInfo.user_auth} />

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
                  <div className="grid grid-cols-1 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex flex-row gap-4">
                        <div className="space-y-2">
                          <Label>시작일자 *</Label>
                          <Input 
                            type="date" 
                            defaultValue={searchData.start_date} 
                            onChange={(e) => setSearchData((prev: any) => ({ ...prev, start_date: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="flex flex-row gap-4">
                        <div className="space-y-2">
                          <Label>종료일자 *</Label>
                          <Input 
                            type="date" 
                            defaultValue={searchData.end_date} 
                            onChange={(e) => setSearchData((prev: any) => ({ ...prev, end_date: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>구분</Label>
                        <Select 
                          defaultValue={searchData.type} 
                          onValueChange={(value) => setSearchData((prev: any) => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="전체" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">전체</SelectItem>
                            <SelectItem value="I">입고</SelectItem>
                            <SelectItem value="O">출고</SelectItem>
                            <SelectItem value="A">재고조정</SelectItem>
                            <SelectItem value="L">손망실</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>선박</Label>
                        <Select 
                          defaultValue={searchData.vessel_no} 
                          onValueChange={(value) => vesselChanged(value)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="선박 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">전체</SelectItem>
                            {vesselCodes.map((vessel) => (
                              <SelectItem key={vessel.vessel_no} value={vessel.vessel_no}>
                                {vessel.vessel_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>장비</Label>
                        <Select 
                          defaultValue={searchData.machine_id} 
                          onValueChange={(value) => setSearchData((prev: any) => ({ ...prev, machine_id: value }))}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="전체" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">전체</SelectItem>
                            {selectedVesselCode?.machines.map((machine) => (
                              <SelectItem key={machine.machine_id} value={machine.machine_id}>
                                {machine.machine_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>창고</Label>
                        <Select 
                          defaultValue={searchData.location} 
                          onValueChange={(value) => setSearchData((prev: any) => ({ ...prev, location: value }))}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="전체" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">전체</SelectItem>
                            {selectedVesselCode?.warehouses.map((warehouse) => (
                              <SelectItem key={warehouse.warehouse_no} value={warehouse.warehouse_no}>
                                {warehouse.warehouse_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleSearch} className="w-full" style={{cursor: 'pointer'}}>
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
                      입출고 내역 ({filteredData.length}건)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {transactionsData.length > 0 && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Filter className="w-4 h-4" />
                          <span className="text-sm font-medium">테이블 필터</span>
                        </div>
                        <div className="flex flex-row gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">구분</Label>
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                              <SelectTrigger className="h-8 w-38">
                                <SelectValue placeholder="전체" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">전체</SelectItem>
                                {getUniqueTypes().map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {getTransactionType(type)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">장비</Label>
                            <Input
                              placeholder="장비명 검색"
                              value={machineFilter}
                              onChange={(e) => setMachineFilter(e.target.value)}
                              className="h-8"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">부품</Label>
                            <Input
                              placeholder="부품명/코드 검색"
                              value={materialFilter}
                              onChange={(e) => setMaterialFilter(e.target.value)}
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

                    {transactionsData.length > 0 ? (
                      <div className="overflow-auto">
                        <table className="w-full text-sm">
                          <thead className="border-b">
                            <tr>
                              <th className="text-left py-3 px-2">선박</th>
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
                            {filteredData.map((transaction) => (
                              <tr key={transaction.no} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-2">{transaction.vessel_name}</td>
                                <td className="py-3 px-2">{transaction.date}</td>
                                <td className="py-3 px-2">{getTransactionTypeBadge(transaction.type)}</td>
                                <td className="py-3 px-2">{transaction.machine_name}</td>
                                <td className="py-3 px-2 font-medium">{transaction.material_name}</td>
                                <td className="py-3 px-2 text-gray-600">{transaction.material_code}</td>
                                <td className="py-3 px-2">{transaction.location}</td>
                                <td className="py-3 px-2 text-center font-medium">
                                  {getQuantityDisplay(transaction.type, transaction.qty)} {transaction.unit}
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
                        {filteredData.length === 0
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
