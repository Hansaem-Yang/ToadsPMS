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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Package,
  Plus,
  Trash2,
  TrendingUp,
  BarChart3,
  ArrowLeft,
  Save,
  CheckCircle,
  AlertTriangle,
  Warehouse,
  History,
} from "lucide-react"

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
        },
        {
          partId: "PART-002",
          partName: "실린더 라이너",
          partCode: "CL-001",
          currentStock: 15,
          minStock: 8,
          unit: "개",
          status: "정상",
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
        },
      ],
    },
  ],
}

// Mock data for warehouses
const mockWarehouses = [
  { warehouseId: "WH-001", warehouseName: "엔진룸 창고", warehouseLocation: "엔진룸 1층" },
  { warehouseId: "WH-002", warehouseName: "갑판 창고", warehouseLocation: "상부 갑판" },
  { warehouseId: "WH-003", warehouseName: "선수 창고", warehouseLocation: "선수부" },
  { warehouseId: "WH-004", warehouseName: "선미 창고", warehouseLocation: "선미부" },
]

export default function PartsReceivingPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [activeMenu, setActiveMenu] = useState("receiving")
  const [inventoryData, setInventoryData] = useState(mockShipInventoryData)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [todayReceivings, setTodayReceivings] = useState<any[]>([])
  const [receivingData, setReceivingData] = useState({
    receiveDate: new Date().toISOString().split("T")[0],
    supplier: "",
    notes: "",
    parts: [] as any[],
  })

  useEffect(() => {
    try {
      const user = requireAuth("ship")
      setUserInfo(user)
    } catch (error) {
      // Redirect handled by requireAuth
    }
  }, [])

  if (!userInfo) return null

  const addPartToReceiving = () => {
    setReceivingData((prev) => ({
      ...prev,
      parts: [...prev.parts, { equipmentId: "", partId: "", quantity: "", warehouseId: "", notes: "" }],
    }))
  }

  const removePartFromReceiving = (index: number) => {
    setReceivingData((prev) => ({
      ...prev,
      parts: prev.parts.filter((_, i) => i !== index),
    }))
  }

  const updateReceivingPart = (index: number, field: string, value: string) => {
    setReceivingData((prev) => ({
      ...prev,
      parts: prev.parts.map((part, i) => (i === index ? { ...part, [field]: value } : part)),
    }))
  }

  const getAvailablePartsForEquipment = (equipmentId: string) => {
    const equipment = inventoryData.equipment.find((e) => e.equipmentId === equipmentId)
    return equipment ? equipment.parts : []
  }

  const handleSaveReceiving = () => {
    console.log("[v0] Saving receiving data:", receivingData)

    // Add to today's receivings
    const newReceiving = {
      id: Date.now(),
      ...receivingData,
      timestamp: new Date().toISOString(),
    }

    setTodayReceivings((prev) => [...prev, newReceiving])
    setShowSuccessDialog(true)

    setReceivingData((prev) => ({
      ...prev,
      parts: [],
      notes: "",
    }))
  }

  const getTodayReceivingSummary = () => {
    const today = new Date().toISOString().split("T")[0]
    const todayReceivingsFiltered = todayReceivings.filter((r) => r.receiveDate === today)

    const summary: {
      [key: string]: { equipmentName: string; totalParts: number; totalQuantity: number; parts: any[] }
    } = {}

    todayReceivingsFiltered.forEach((receiving) => {
      receiving.parts.forEach((part: any) => {
        const equipment = inventoryData.equipment.find((e) => e.equipmentId === part.equipmentId)
        const partInfo = equipment?.parts.find((p) => p.partId === part.partId)

        if (equipment && partInfo) {
          if (!summary[part.equipmentId]) {
            summary[part.equipmentId] = {
              equipmentName: equipment.equipmentName,
              totalParts: 0,
              totalQuantity: 0,
              parts: [],
            }
          }

          summary[part.equipmentId].totalParts += 1
          summary[part.equipmentId].totalQuantity += Number.parseInt(part.quantity || "0")
          summary[part.equipmentId].parts.push({
            partName: partInfo.partName,
            partCode: partInfo.partCode,
            quantity: part.quantity,
            unit: partInfo.unit,
          })
        }
      })
    })

    return summary
  }

  const handleMenuClick = (menu: string) => {
    setActiveMenu(menu)
    if (menu === "dashboard") {
      router.push("/ship/dashboard")
    } else if (menu === "status") {
      router.push("/ship/inventory/status")
    }
  }

  const isReceivingDataValid = () => {
    if (!receivingData.supplier.trim()) return false

    const partsWithData = receivingData.parts.filter((part) => part.equipmentId || part.partId || part.quantity)

    if (partsWithData.length === 0) return false

    return partsWithData.every(
      (part) =>
        part.equipmentId && part.partId && part.quantity && part.warehouseId && Number.parseInt(part.quantity) > 0,
    )
  }

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
                onClick={() => handleMenuClick("status")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                  activeMenu === "status"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                재고현황
              </button>
              <button
                onClick={() => handleMenuClick("receiving")}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                  activeMenu === "receiving"
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
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
                <BarChart3 className="w-4 h-4" />
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
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push("/ship/inventory")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                뒤로가기
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">부품 입고 등록</h1>
                <p className="text-gray-600">{inventoryData.shipName}의 부품 입고를 등록합니다</p>
              </div>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>입고 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="receive-date">입고 일자</Label>
                      <Input
                        id="receive-date"
                        type="date"
                        value={receivingData.receiveDate}
                        onChange={(e) => setReceivingData((prev) => ({ ...prev, receiveDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="supplier">납품처</Label>
                      <Input
                        id="supplier"
                        placeholder="납품처명을 입력하세요"
                        value={receivingData.supplier}
                        onChange={(e) => setReceivingData((prev) => ({ ...prev, supplier: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="receive-notes">비고</Label>
                    <Textarea
                      id="receive-notes"
                      placeholder="입고에 대한 비고사항을 입력하세요..."
                      value={receivingData.notes}
                      onChange={(e) => setReceivingData((prev) => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>입고 부품 목록</CardTitle>
                    <Button type="button" onClick={addPartToReceiving} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-1" />
                      부품 추가
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {receivingData.parts.map((part, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">부품 #{index + 1}</h4>
                            <Button
                              type="button"
                              onClick={() => removePartFromReceiving(index)}
                              size="sm"
                              variant="ghost"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm">장비</Label>
                              <Select
                                value={part.equipmentId}
                                onValueChange={(value) => updateReceivingPart(index, "equipmentId", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="장비 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                  {inventoryData.equipment.map((equipment) => (
                                    <SelectItem key={equipment.equipmentId} value={equipment.equipmentId}>
                                      {equipment.equipmentName}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-sm">부품</Label>
                              <Select
                                value={part.partId}
                                onValueChange={(value) => updateReceivingPart(index, "partId", value)}
                                disabled={!part.equipmentId}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="부품 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailablePartsForEquipment(part.equipmentId).map((availablePart) => (
                                    <SelectItem key={availablePart.partId} value={availablePart.partId}>
                                      {availablePart.partName} ({availablePart.partCode})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm">입고 창고</Label>
                            <Select
                              value={part.warehouseId}
                              onValueChange={(value) => updateReceivingPart(index, "warehouseId", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="창고 선택" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockWarehouses.map((warehouse) => (
                                  <SelectItem key={warehouse.warehouseId} value={warehouse.warehouseId}>
                                    {warehouse.warehouseName} ({warehouse.warehouseLocation})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm">입고 수량</Label>
                              <Input
                                type="number"
                                placeholder="수량"
                                value={part.quantity}
                                onChange={(e) => updateReceivingPart(index, "quantity", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label className="text-sm">단위</Label>
                              <Input
                                value={
                                  part.partId
                                    ? getAvailablePartsForEquipment(part.equipmentId).find(
                                        (p) => p.partId === part.partId,
                                      )?.unit || ""
                                    : ""
                                }
                                disabled
                                className="bg-gray-50"
                              />
                            </div>
                            <div>
                              <Label className="text-sm">현재 재고</Label>
                              <Input
                                value={
                                  part.partId
                                    ? getAvailablePartsForEquipment(part.equipmentId).find(
                                        (p) => p.partId === part.partId,
                                      )?.currentStock || ""
                                    : ""
                                }
                                disabled
                                className="bg-gray-50"
                              />
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm">부품별 비고</Label>
                            <Input
                              placeholder="이 부품에 대한 비고..."
                              value={part.notes}
                              onChange={(e) => updateReceivingPart(index, "notes", e.target.value)}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}

                    {receivingData.parts.length === 0 && (
                      <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                        <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm">입고할 부품이 없습니다</p>
                        <p className="text-xs">부품 추가 버튼을 클릭하여 입고 부품을 등록하세요</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => router.push("/ship/inventory")}>
                  취소
                </Button>
                <Button
                  onClick={handleSaveReceiving}
                  disabled={!isReceivingDataValid()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  입고 등록
                </Button>
              </div>

              {todayReceivings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      금일 입고 현황
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(getTodayReceivingSummary()).map(([equipmentId, summary]) => (
                        <Card key={equipmentId} className="border-l-4 border-l-green-500">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{summary.equipmentName}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">총 부품 종류</span>
                              <span className="font-semibold">{summary.totalParts}종</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">총 입고 수량</span>
                              <span className="font-semibold">{summary.totalQuantity}개</span>
                            </div>
                            <div className="border-t pt-3">
                              <p className="text-xs text-gray-500 mb-2">입고 부품 목록</p>
                              <div className="space-y-1">
                                {summary.parts.map((part, index) => (
                                  <div key={index} className="flex justify-between text-xs">
                                    <span className="truncate">{part.partName}</span>
                                    <span className="text-gray-600">
                                      {part.quantity}
                                      {part.unit}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              입고 등록 완료
            </DialogTitle>
            <DialogDescription>
              부품 입고가 성공적으로 등록되었습니다. 하단에서 금일 입고 현황을 확인하실 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowSuccessDialog(false)}>확인</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
