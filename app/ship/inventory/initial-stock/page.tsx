"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Package,
  Search,
  Upload,
  Download,
  Plus,
  BarChart3,
  TrendingUp,
  Edit,
  AlertTriangle,
  Warehouse,
  History,
} from "lucide-react"

// Mock data for ship inventory
const mockWarehouses = [
  { warehouseId: "WH-001", warehouseCode: "A", warehouseName: "주창고", location: "선수부" },
  { warehouseId: "WH-002", warehouseCode: "B", warehouseName: "보조창고", location: "선미부" },
  { warehouseId: "WH-003", warehouseCode: "C", warehouseName: "엔진룸창고", location: "엔진룸" },
]

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
          warehouseId: "WH-001",
          warehouseName: "주창고",
          currentStock: 5,
          minStock: 10,
          unit: "개",
          supplier: "현대중공업",
        },
        {
          partId: "PART-001",
          partName: "피스톤 링",
          partCode: "PR-001",
          warehouseId: "WH-002",
          warehouseName: "보조창고",
          currentStock: 3,
          minStock: 5,
          unit: "개",
          supplier: "현대중공업",
        },
        {
          partId: "PART-002",
          partName: "실린더 라이너",
          partCode: "CL-001",
          warehouseId: "WH-001",
          warehouseName: "주창고",
          currentStock: 15,
          minStock: 8,
          unit: "개",
          supplier: "두산엔진",
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
          warehouseId: "WH-003",
          warehouseName: "엔진룸창고",
          currentStock: 2,
          minStock: 5,
          unit: "개",
          supplier: "만엔진",
        },
        {
          partId: "PART-005",
          partName: "오일 필터",
          partCode: "OF-001",
          warehouseId: "WH-003",
          warehouseName: "엔진룸창고",
          currentStock: 12,
          minStock: 6,
          unit: "개",
          supplier: "만엔진",
        },
      ],
    },
  ],
}

export default function InitialStockPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEquipment, setSelectedEquipment] = useState<string>("")
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [inventoryData, setInventoryData] = useState(mockShipInventoryData)
  const [newPart, setNewPart] = useState({
    partName: "",
    partCode: "",
    warehouseId: "",
    initialStock: "",
    minStock: "",
    unit: "",
    supplier: "",
  })

  useEffect(() => {
    try {
      const user = requireAuth()
      setUserInfo(user)
      if (mockShipInventoryData.equipment.length > 0) {
        setSelectedEquipment(mockShipInventoryData.equipment[0].equipmentId)
      }
    } catch (error) {
      // Redirect handled by requireAuth
    }
  }, [])

  if (!userInfo) return null

  const handleAddPart = () => {
    if (!selectedEquipment || !newPart.partName || !newPart.partCode || !newPart.warehouseId || !newPart.initialStock) {
      alert("필수 항목을 모두 입력해주세요.")
      return
    }

    const selectedWarehouse = mockWarehouses.find((w) => w.warehouseId === newPart.warehouseId)
    const updatedData = { ...inventoryData }
    const equipmentIndex = updatedData.equipment.findIndex((eq) => eq.equipmentId === selectedEquipment)

    if (equipmentIndex !== -1 && selectedWarehouse) {
      const existingPartIndex = updatedData.equipment[equipmentIndex].parts.findIndex(
        (p) => p.partCode === newPart.partCode && p.warehouseId === newPart.warehouseId,
      )

      if (existingPartIndex !== -1) {
        alert("해당 부품이 선택한 창고에 이미 등록되어 있습니다.")
        return
      }

      const newPartData = {
        partId: newPart.partCode,
        partName: newPart.partName,
        partCode: newPart.partCode,
        warehouseId: newPart.warehouseId,
        warehouseName: selectedWarehouse.warehouseName,
        currentStock: Number.parseInt(newPart.initialStock),
        minStock: Number.parseInt(newPart.minStock) || 0,
        unit: newPart.unit,
        supplier: newPart.supplier,
      }

      updatedData.equipment[equipmentIndex].parts.push(newPartData)
      setInventoryData(updatedData)
    }

    setNewPart({
      partName: "",
      partCode: "",
      warehouseId: "",
      initialStock: "",
      minStock: "",
      unit: "",
      supplier: "",
    })
    setIsAddPartDialogOpen(false)
  }

  const handleExcelDownload = () => {
    alert("엑셀 템플릿이 다운로드됩니다.")
  }

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      alert(`${file.name} 파일이 업로드되었습니다. 일괄 등록을 진행합니다.`)
      setIsUploadDialogOpen(false)
    }
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
      <Header userType={userInfo.user_auth} />
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
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors bg-blue-50 text-blue-700 border border-blue-200"
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
                <h1 className="text-2xl font-bold text-gray-900">기초재고 등록</h1>
                <p className="text-gray-600">{inventoryData.shipName}의 장비별 부품 기초재고를 등록합니다</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExcelDownload} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  템플릿 다운로드
                </Button>
                <Button onClick={() => setIsUploadDialogOpen(true)} variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  엑셀 업로드
                </Button>
                <Button onClick={() => setIsAddPartDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  부품 추가
                </Button>
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
                </CardHeader>
                <CardContent>
                  {selectedEquipmentData ? (
                    <div className="overflow-auto max-h-[calc(100vh-350px)]">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-white border-b">
                          <tr>
                            <th className="text-left py-3 px-2">부품명</th>
                            <th className="text-left py-3 px-2">부품코드</th>
                            <th className="text-left py-3 px-2">창고</th>
                            <th className="text-center py-3 px-2">기초재고</th>
                            <th className="text-center py-3 px-2">최소재고</th>
                            <th className="text-center py-3 px-2">단위</th>
                            <th className="text-left py-3 px-2">공급업체</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredParts.map((part, index) => (
                            <tr key={`${part.partId}-${part.warehouseId}`} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-2 font-medium">{part.partName}</td>
                              <td className="py-3 px-2 text-gray-600">{part.partCode}</td>
                              <td className="py-3 px-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  {part.warehouseName}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-center">
                                <Input type="number" defaultValue={part.currentStock} className="w-20 text-center" />
                              </td>
                              <td className="py-3 px-2 text-center">
                                <Input type="number" defaultValue={part.minStock} className="w-20 text-center" />
                              </td>
                              <td className="py-3 px-2 text-center">{part.unit}</td>
                              <td className="py-3 px-2">{part.supplier}</td>
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

            <Dialog open={isAddPartDialogOpen} onOpenChange={setIsAddPartDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>부품 추가</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>장비</Label>
                    <Input value={selectedEquipmentData?.equipmentName || ""} disabled className="bg-gray-50" />
                  </div>
                  <div>
                    <Label>부품명 *</Label>
                    <Input
                      value={newPart.partName}
                      onChange={(e) => setNewPart({ ...newPart, partName: e.target.value })}
                      placeholder="부품명을 입력하세요"
                    />
                  </div>
                  <div>
                    <Label>부품코드 *</Label>
                    <Input
                      value={newPart.partCode}
                      onChange={(e) => setNewPart({ ...newPart, partCode: e.target.value })}
                      placeholder="부품코드를 입력하세요"
                    />
                  </div>
                  <div>
                    <Label>창고 *</Label>
                    <Select
                      value={newPart.warehouseId}
                      onValueChange={(value) => setNewPart({ ...newPart, warehouseId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="창고를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockWarehouses.map((warehouse) => (
                          <SelectItem key={warehouse.warehouseId} value={warehouse.warehouseId}>
                            {warehouse.warehouseName} ({warehouse.location})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>기초재고 *</Label>
                      <Input
                        type="number"
                        value={newPart.initialStock}
                        onChange={(e) => setNewPart({ ...newPart, initialStock: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label>최소재고</Label>
                      <Input
                        type="number"
                        value={newPart.minStock}
                        onChange={(e) => setNewPart({ ...newPart, minStock: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>단위</Label>
                      <Input
                        value={newPart.unit}
                        onChange={(e) => setNewPart({ ...newPart, unit: e.target.value })}
                        placeholder="개, kg, L 등"
                      />
                    </div>
                    <div>
                      <Label>공급업체</Label>
                      <Input
                        value={newPart.supplier}
                        onChange={(e) => setNewPart({ ...newPart, supplier: e.target.value })}
                        placeholder="공급업체명"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddPartDialogOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleAddPart}>추가</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>엑셀 파일 업로드</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    <p>• 먼저 템플릿을 다운로드하여 양식에 맞게 작성해주세요.</p>
                    <p>• 엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.</p>
                    <p>• 기존 부품과 중복되는 부품코드는 업데이트됩니다.</p>
                  </div>
                  <div>
                    <Label>파일 선택</Label>
                    <Input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} className="cursor-pointer" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    취소
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  )
}
