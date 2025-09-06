"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Package, Search, BarChart3, TrendingUp, Edit, Warehouse, History } from "lucide-react"

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
          systemStock: 5,
          actualStock: "", // 실제 재고를 빈 문자열로 초기화
          minStock: 10,
          unit: "개",
          location: "창고 A-1",
          lastAdjustment: "2024-01-01",
        },
        {
          partId: "PART-002",
          partName: "실린더 라이너",
          partCode: "CL-001",
          systemStock: 15,
          actualStock: "", // 실제 재고를 빈 문자열로 초기화
          minStock: 8,
          unit: "개",
          location: "창고 A-2",
          lastAdjustment: "2024-01-01",
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
          systemStock: 2,
          actualStock: "", // 실제 재고를 빈 문자열로 초기화
          minStock: 5,
          unit: "개",
          location: "창고 B-1",
          lastAdjustment: "2024-01-01",
        },
        {
          partId: "PART-005",
          partName: "오일 필터",
          partCode: "OF-001",
          systemStock: 12,
          actualStock: "", // 실제 재고를 빈 문자열로 초기화
          minStock: 6,
          unit: "개",
          location: "창고 B-2",
          lastAdjustment: "2024-01-01",
        },
      ],
    },
  ],
}

export default function InventoryAdjustmentPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEquipment, setSelectedEquipment] = useState<string>("")
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [selectedPart, setSelectedPart] = useState<any>(null)
  const [adjustmentData, setAdjustmentData] = useState({
    actualStock: "",
    reason: "",
    adjustmentDate: new Date().toISOString().split("T")[0],
  })
  const [inventoryData, setInventoryData] = useState(mockShipInventoryData)
  const [isReasonDialogOpen, setIsReasonDialogOpen] = useState(false)
  const [pendingAdjustment, setPendingAdjustment] = useState<any>(null)

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

  const getDifferenceBadge = (systemStock: number, actualStock: string | number) => {
    if (actualStock === "" || actualStock === null || actualStock === undefined) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
          미입력
        </Badge>
      )
    }

    const actualStockNum = typeof actualStock === "string" ? Number.parseInt(actualStock) || 0 : actualStock
    const diff = actualStockNum - systemStock
    if (diff === 0) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          일치
        </Badge>
      )
    } else if (diff > 0) {
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800">
          +{diff}
        </Badge>
      )
    } else {
      return <Badge variant="destructive">-{Math.abs(diff)}</Badge>
    }
  }

  const handleActualStockChange = (partId: string, equipmentId: string, value: string) => {
    const updatedData = { ...inventoryData }
    const equipmentIndex = updatedData.equipment.findIndex((eq) => eq.equipmentId === equipmentId)

    if (equipmentIndex !== -1) {
      const partIndex = updatedData.equipment[equipmentIndex].parts.findIndex((p) => p.partId === partId)
      if (partIndex !== -1) {
        updatedData.equipment[equipmentIndex].parts[partIndex].actualStock = value
        setInventoryData(updatedData)
      }
    }
  }

  const handleActualStockBlur = (part: any, equipmentName: string) => {
    const actualStock = part.actualStock
    if (actualStock !== "" && Number.parseInt(actualStock) !== part.systemStock) {
      setPendingAdjustment({ ...part, equipmentName })
      setIsReasonDialogOpen(true)
    }
  }

  const handleAdjustment = (part: any, equipmentName: string) => {
    setSelectedPart({ ...part, equipmentName })
    setAdjustmentData({
      actualStock: part.actualStock.toString(),
      reason: "",
      adjustmentDate: new Date().toISOString().split("T")[0],
    })
    setIsAdjustDialogOpen(true)
  }

  const handleReasonSubmit = () => {
    if (!adjustmentData.reason.trim()) {
      alert("재고 변경 사유를 입력해주세요.")
      return
    }

    const updatedData = { ...inventoryData }
    const equipmentIndex = updatedData.equipment.findIndex((eq) =>
      eq.parts.some((p) => p.partId === pendingAdjustment.partId),
    )

    if (equipmentIndex !== -1) {
      const partIndex = updatedData.equipment[equipmentIndex].parts.findIndex(
        (p) => p.partId === pendingAdjustment.partId,
      )

      if (partIndex !== -1) {
        updatedData.equipment[equipmentIndex].parts[partIndex] = {
          ...updatedData.equipment[equipmentIndex].parts[partIndex],
          systemStock: Number.parseInt(pendingAdjustment.actualStock),
          lastAdjustment: new Date().toISOString().split("T")[0],
        }
        setInventoryData(updatedData)
      }
    }

    alert("재고 조정이 완료되었습니다.")
    setIsReasonDialogOpen(false)
    setPendingAdjustment(null)
    setAdjustmentData({ ...adjustmentData, reason: "" })
  }

  const handleSaveAdjustment = () => {
    if (!adjustmentData.actualStock || !adjustmentData.reason.trim()) {
      alert("실제 재고량과 조정 사유를 모두 입력해주세요.")
      return
    }

    const updatedData = { ...inventoryData }
    const equipmentIndex = updatedData.equipment.findIndex((eq) =>
      eq.parts.some((p) => p.partId === selectedPart.partId),
    )

    if (equipmentIndex !== -1) {
      const partIndex = updatedData.equipment[equipmentIndex].parts.findIndex((p) => p.partId === selectedPart.partId)

      if (partIndex !== -1) {
        updatedData.equipment[equipmentIndex].parts[partIndex] = {
          ...updatedData.equipment[equipmentIndex].parts[partIndex],
          systemStock: Number.parseInt(adjustmentData.actualStock),
          actualStock: Number.parseInt(adjustmentData.actualStock),
          lastAdjustment: adjustmentData.adjustmentDate,
        }
        setInventoryData(updatedData)
      }
    }

    alert("재고 조정이 완료되었습니다.")
    setIsAdjustDialogOpen(false)
  }

  const selectedEquipmentData = inventoryData.equipment.find((equip) => equip.equipmentId === selectedEquipment)

  const filteredParts =
    selectedEquipmentData?.parts.filter(
      (part) =>
        part.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.partCode.toLowerCase().includes(searchTerm.toLowerCase()),
    ) || []

  const tableHeaders = [
    { key: "partName", label: "부품명", align: "text-left" },
    { key: "partCode", label: "부품코드", align: "text-left" },
    { key: "systemStock", label: "시스템 재고", align: "text-center" },
    { key: "actualStock", label: "실제 재고", align: "text-center" },
    { key: "difference", label: "차이", align: "text-center" },
    { key: "unit", label: "단위", align: "text-center" },
    { key: "location", label: "보관위치", align: "text-left" },
    { key: "lastAdjustment", label: "최종 조정일", align: "text-center" },
    { key: "action", label: "조정", align: "text-center" },
  ]

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
                <Package className="w-4 h-4" />
                기초재고 등록
              </button>
              <button
                onClick={() => router.push("/ship/inventory/adjustment")}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors bg-blue-50 text-blue-700 border border-blue-200"
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
                <h1 className="text-2xl font-bold text-gray-900">재고 조정</h1>
                <p className="text-gray-600">{inventoryData.shipName}의 실제 재고와 시스템 재고를 조정합니다</p>
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
                      {selectedEquipmentData?.equipmentName} 재고 조정
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
                            {tableHeaders.map((header) => (
                              <th key={header.key} className={`${header.align} py-3 px-2`}>
                                {header.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredParts.map((part) => (
                            <tr key={part.partId} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-2 font-medium">{part.partName}</td>
                              <td className="py-3 px-2 text-gray-600">{part.partCode}</td>
                              <td className="py-3 px-2 text-center font-medium">{part.systemStock}</td>
                              <td className="py-3 px-2 text-center">
                                <Input
                                  type="number"
                                  value={part.actualStock}
                                  onChange={(e) =>
                                    handleActualStockChange(part.partId, selectedEquipment, e.target.value)
                                  }
                                  onBlur={() => handleActualStockBlur(part, selectedEquipmentData.equipmentName)}
                                  className="w-20 text-center"
                                  placeholder="입력"
                                />
                              </td>
                              <td className="py-3 px-2 text-center">
                                {getDifferenceBadge(part.systemStock, part.actualStock)}
                              </td>
                              <td className="py-3 px-2 text-center">{part.unit}</td>
                              <td className="py-3 px-2">{part.location}</td>
                              <td className="py-3 px-2 text-center text-gray-500">{part.lastAdjustment}</td>
                              <td className="py-3 px-2 text-center">
                                <Button
                                  onClick={() => handleAdjustment(part, selectedEquipmentData.equipmentName)}
                                  size="sm"
                                  variant="outline"
                                  disabled={
                                    part.actualStock === "" || Number.parseInt(part.actualStock) === part.systemStock
                                  }
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

            <Dialog open={isReasonDialogOpen} onOpenChange={setIsReasonDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>재고 변경 사유 입력</DialogTitle>
                  <DialogDescription>시스템 재고와 실제 재고가 다릅니다. 변경 사유를 입력해주세요.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {pendingAdjustment && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">재고 차이 발생</span>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        {pendingAdjustment.partName} - 시스템 재고: {pendingAdjustment.systemStock} → 실제 재고:{" "}
                        {pendingAdjustment.actualStock}
                        <span className="font-medium">
                          {" "}
                          (차이:{" "}
                          {Number.parseInt(pendingAdjustment.actualStock) - pendingAdjustment.systemStock > 0
                            ? "+"
                            : ""}
                          {Number.parseInt(pendingAdjustment.actualStock) - pendingAdjustment.systemStock})
                        </span>
                      </p>
                    </div>
                  )}
                  <div>
                    <Label>재고 변경 사유 *</Label>
                    <Textarea
                      value={adjustmentData.reason}
                      onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                      placeholder="재고 변경 사유를 입력해주세요 (필수)"
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsReasonDialogOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleReasonSubmit}>확인</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Adjustment Dialog */}
            {selectedPart && (
              <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>재고 조정</DialogTitle>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>시스템 재고</Label>
                        <Input value={selectedPart.systemStock} disabled className="bg-gray-50" />
                      </div>
                      <div>
                        <Label>실제 재고 *</Label>
                        <Input
                          type="number"
                          value={adjustmentData.actualStock}
                          onChange={(e) => setAdjustmentData({ ...adjustmentData, actualStock: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>조정 일자</Label>
                      <Input
                        type="date"
                        value={adjustmentData.adjustmentDate}
                        onChange={(e) => setAdjustmentData({ ...adjustmentData, adjustmentDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>조정 사유 *</Label>
                      <Textarea
                        value={adjustmentData.reason}
                        onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                        placeholder="재고 조정 사유를 입력해주세요 (필수)"
                        rows={3}
                      />
                    </div>
                    {selectedPart.systemStock !== Number.parseInt(adjustmentData.actualStock) && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">재고 차이 발생</span>
                        </div>
                        <p className="text-sm text-yellow-700 mt-1">
                          시스템 재고: {selectedPart.systemStock} → 실제 재고: {adjustmentData.actualStock}
                          {adjustmentData.actualStock && (
                            <span className="font-medium">
                              {" "}
                              (차이:{" "}
                              {Number.parseInt(adjustmentData.actualStock) - selectedPart.systemStock > 0 ? "+" : ""}
                              {Number.parseInt(adjustmentData.actualStock) - selectedPart.systemStock})
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
                      취소
                    </Button>
                    <Button onClick={handleSaveAdjustment}>조정 완료</Button>
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
