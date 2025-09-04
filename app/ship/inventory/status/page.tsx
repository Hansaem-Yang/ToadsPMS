"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Package, Search, Edit, TrendingUp, BarChart3, Warehouse, History } from "lucide-react"

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
          partNumbers: ["PN-PR-001-A", "PN-PR-001-B"],
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
          partNumbers: ["PN-CL-001-X", "PN-CL-001-Y", "PN-CL-001-Z"],
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
          partNumbers: ["PN-FF-001"],
          currentStock: 2,
          minStock: 5,
          unit: "개",
          status: "부족",
          lastUpdated: "2024-01-13",
          supplier: "만엔진",
          location: "창고 B-1",
        },
        {
          partId: "PART-005",
          partName: "오일 필터",
          partCode: "OF-001",
          partNumbers: ["PN-OF-001-A", "PN-OF-001-B"],
          currentStock: 12,
          minStock: 6,
          unit: "개",
          status: "정상",
          lastUpdated: "2024-01-11",
          supplier: "만엔진",
          location: "창고 B-2",
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
          partNumbers: ["PN-GPS-ANT-001"],
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

export default function ShipInventoryStatusPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEquipment, setSelectedEquipment] = useState<string>("")
  const [isEditPartDialogOpen, setIsEditPartDialogOpen] = useState(false)
  const [selectedPart, setSelectedPart] = useState<any>(null)
  const [inventoryData, setInventoryData] = useState(mockShipInventoryData)
  const [editPartNumbers, setEditPartNumbers] = useState<string[]>([])

  useEffect(() => {
    try {
      const user = requireAuth("ship")
      setUserInfo(user)
      if (mockShipInventoryData.equipment.length > 0) {
        setSelectedEquipment(mockShipInventoryData.equipment[0].equipmentId)
      }
    } catch (error) {
      // Redirect handled by requireAuth
    }
  }, [])

  if (!userInfo) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "부족":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            부족
          </Badge>
        )
      case "정상":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            정상
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleEditPart = (part: any, equipmentName: string) => {
    setSelectedPart({ ...part, equipmentName })
    setEditPartNumbers([...part.partNumbers, "", "", ""].slice(0, 3))
    setIsEditPartDialogOpen(true)
  }

  const handlePartNumberChange = (index: number, value: string) => {
    const newPartNumbers = [...editPartNumbers]
    newPartNumbers[index] = value
    setEditPartNumbers(newPartNumbers)
  }

  const selectedEquipmentData = inventoryData.equipment.find((equip) => equip.equipmentId === selectedEquipment)

  const filteredParts =
    selectedEquipmentData?.parts.filter(
      (part) =>
        part.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partCode.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

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
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
              >
                <Package className="w-4 h-4" />
                재고관리 대시보드
              </button>
              <button
                onClick={() => router.push("/ship/inventory/status")}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors bg-blue-50 text-blue-700 border border-blue-200"
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
                <h1 className="text-2xl font-bold text-gray-900">재고 현황</h1>
                <p className="text-gray-600">{inventoryData.shipName}의 장비별 부품 재고 현황을 조회합니다</p>
              </div>
            </div>

            <div className="flex gap-6 h-[calc(100vh-200px)]">
              <Card className="w-80 flex-shrink-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    장비 목록
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {inventoryData.equipment.map((equipment) => (
                      <button
                        key={equipment.equipmentId}
                        onClick={() => setSelectedEquipment(equipment.equipmentId)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-l-4 ${
                          selectedEquipment === equipment.equipmentId
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-transparent"
                        }`}
                      >
                        <div className="font-medium">{equipment.equipmentName}</div>
                        <div className="text-sm text-gray-500">{equipment.parts.length}개 부품</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="flex-1">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      {selectedEquipmentData?.equipmentName} 부품 목록
                    </CardTitle>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="부품명 또는 부품코드로 검색..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedEquipmentData ? (
                    <div className="overflow-auto max-h-[calc(100vh-350px)]">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-white border-b">
                          <tr>
                            <th className="text-left py-3 px-2">부품명</th>
                            <th className="text-left py-3 px-2">부품코드</th>
                            <th className="text-left py-3 px-2">Part No.</th>
                            <th className="text-center py-3 px-2">현재재고</th>
                            <th className="text-center py-3 px-2">최소재고</th>
                            <th className="text-center py-3 px-2">단위</th>
                            <th className="text-center py-3 px-2">상태</th>
                            <th className="text-left py-3 px-2">보관위치</th>
                            <th className="text-center py-3 px-2">최종 업데이트</th>
                            <th className="text-center py-3 px-2">작업</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredParts.map((part) => (
                            <tr key={part.partId} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-2 font-medium">{part.partName}</td>
                              <td className="py-3 px-2 text-gray-600">{part.partCode}</td>
                              <td className="py-3 px-2">
                                <div className="space-y-1">
                                  {part.partNumbers.map((partNumber: string, index: number) => (
                                    <div key={index} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                      {partNumber}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="py-3 px-2 text-center font-medium">{part.currentStock}</td>
                              <td className="py-3 px-2 text-center text-gray-600">{part.minStock}</td>
                              <td className="py-3 px-2 text-center">{part.unit}</td>
                              <td className="py-3 px-2 text-center">{getStatusBadge(part.status)}</td>
                              <td className="py-3 px-2">{part.location}</td>
                              <td className="py-3 px-2 text-center text-gray-500">{part.lastUpdated}</td>
                              <td className="py-3 px-2 text-center">
                                <Button
                                  onClick={() => handleEditPart(part, selectedEquipmentData.equipmentName)}
                                  size="sm"
                                  variant="ghost"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredParts.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          {searchTerm ? "검색 결과가 없습니다." : "부품이 없습니다."}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">왼쪽에서 장비를 선택해주세요.</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {selectedPart && (
              <Dialog open={isEditPartDialogOpen} onOpenChange={setIsEditPartDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>부품 정보 수정</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>장비</Label>
                      <Input value={selectedPart.equipmentName} disabled className="bg-gray-50" />
                    </div>
                    <div>
                      <Label>부품명</Label>
                      <Input value={selectedPart.partName} disabled className="bg-gray-50" />
                    </div>
                    <div>
                      <Label>부품코드</Label>
                      <Input value={selectedPart.partCode} disabled className="bg-gray-50" />
                    </div>
                    <div>
                      <Label>Part No. (최대 3개)</Label>
                      <div className="space-y-2">
                        {editPartNumbers.map((partNumber, index) => (
                          <Input
                            key={index}
                            placeholder={`Part No. ${index + 1}`}
                            value={partNumber}
                            onChange={(e) => handlePartNumberChange(index, e.target.value)}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>현재 재고</Label>
                        <Input value={selectedPart.currentStock} disabled className="bg-gray-50" />
                      </div>
                      <div>
                        <Label>최소 재고</Label>
                        <Input type="number" defaultValue={selectedPart.minStock} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>단위</Label>
                        <Input value={selectedPart.unit} disabled className="bg-gray-50" />
                      </div>
                      <div>
                        <Label>보관위치</Label>
                        <Input defaultValue={selectedPart.location} />
                      </div>
                    </div>
                    <div>
                      <Label>공급업체</Label>
                      <Input defaultValue={selectedPart.supplier} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditPartDialogOpen(false)}>
                      취소
                    </Button>
                    <Button onClick={() => setIsEditPartDialogOpen(false)}>저장</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
