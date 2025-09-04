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
import {
  AlertTriangle,
  Package,
  Search,
  Plus,
  Trash2,
  BarChart3,
  TrendingUp,
  Edit,
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
          unit: "개",
          location: "창고 A-1",
        },
        {
          partId: "PART-002",
          partName: "실린더 라이너",
          partCode: "CL-001",
          currentStock: 15,
          unit: "개",
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
          currentStock: 2,
          unit: "개",
          location: "창고 B-1",
        },
        {
          partId: "PART-005",
          partName: "오일 필터",
          partCode: "OF-001",
          currentStock: 12,
          unit: "개",
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
          currentStock: 3,
          unit: "개",
          location: "창고 C-1",
        },
      ],
    },
  ],
}

interface LossItem {
  id: string
  equipmentId: string
  equipmentName: string
  partId: string
  partName: string
  partCode: string
  quantity: string
  currentStock: number
  unit: string
  location: string
}

export default function ShipInventoryLossPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [lossDate, setLossDate] = useState(new Date().toISOString().split("T")[0])
  const [registrant, setRegistrant] = useState("")
  const [reason, setReason] = useState("")
  const [lossItems, setLossItems] = useState<LossItem[]>([])
  const [isPartSearchDialogOpen, setIsPartSearchDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false)

  useEffect(() => {
    try {
      const user = requireAuth("ship")
      setUserInfo(user)
      setRegistrant(user.username || "")
    } catch (error) {
      // Redirect handled by requireAuth
    }
  }, [])

  if (!userInfo) return null

  const getAllParts = () => {
    const allParts: any[] = []
    mockShipInventoryData.equipment.forEach((equipment) => {
      equipment.parts.forEach((part) => {
        allParts.push({
          ...part,
          equipmentId: equipment.equipmentId,
          equipmentName: equipment.equipmentName,
        })
      })
    })
    return allParts
  }

  const filteredParts = getAllParts().filter(
    (part) =>
      part.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddPart = (part: any) => {
    const newLossItem: LossItem = {
      id: `loss-${Date.now()}-${Math.random()}`,
      equipmentId: part.equipmentId,
      equipmentName: part.equipmentName,
      partId: part.partId,
      partName: part.partName,
      partCode: part.partCode,
      quantity: "",
      currentStock: part.currentStock,
      unit: part.unit,
      location: part.location,
    }
    setLossItems([...lossItems, newLossItem])
    setIsPartSearchDialogOpen(false)
    setSearchTerm("")
  }

  const handleRemovePart = (id: string) => {
    setLossItems(lossItems.filter((item) => item.id !== id))
  }

  const handleQuantityChange = (id: string, quantity: string) => {
    setLossItems(lossItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const isFormValid = () => {
    const completeItems = lossItems.filter((item) => item.quantity && Number.parseInt(item.quantity) > 0)
    return lossDate && registrant.trim() && reason.trim() && completeItems.length > 0
  }

  const handleSubmit = () => {
    if (!isFormValid()) return

    console.log("[v0] Submitting loss data:", {
      lossDate,
      registrant,
      reason,
      lossItems,
    })

    setIsSuccessDialogOpen(true)
  }

  const handleSuccessConfirm = () => {
    setIsSuccessDialogOpen(false)
    // Reset form
    setLossDate(new Date().toISOString().split("T")[0])
    setReason("")
    setLossItems([])
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
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
              >
                <Edit className="w-4 h-4" />
                재고 조정
              </button>
              <button
                onClick={() => router.push("/ship/inventory/loss")}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors bg-blue-50 text-blue-700 border border-blue-200"
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
            <div>
              <h1 className="text-2xl font-bold text-gray-900">손망실 처리</h1>
              <p className="text-gray-600">부품의 손망실을 등록하고 재고를 조정합니다</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  손망실 등록 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lossDate">손망실 등록 일자</Label>
                    <Input id="lossDate" type="date" value={lossDate} onChange={(e) => setLossDate(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="registrant">등록자</Label>
                    <Input id="registrant" value={registrant} onChange={(e) => setRegistrant(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reason">등록 사유 *</Label>
                  <Textarea
                    id="reason"
                    placeholder="손망실 사유를 입력해주세요... (필수)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className={!reason.trim() && lossItems.length > 0 ? "border-red-300 focus:border-red-500" : ""}
                  />
                  {!reason.trim() && lossItems.length > 0 && (
                    <p className="text-sm text-red-600 mt-1">등록 사유는 필수 입력 항목입니다.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    손망실 부품 목록
                  </CardTitle>
                  <Button onClick={() => setIsPartSearchDialogOpen(true)} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    부품 추가
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {lossItems.length > 0 ? (
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-3 px-2">장비명</th>
                          <th className="text-left py-3 px-2">부품명</th>
                          <th className="text-left py-3 px-2">부품코드</th>
                          <th className="text-center py-3 px-2">현재재고</th>
                          <th className="text-center py-3 px-2">손망실 수량</th>
                          <th className="text-center py-3 px-2">단위</th>
                          <th className="text-left py-3 px-2">보관위치</th>
                          <th className="text-center py-3 px-2">작업</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lossItems.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2">{item.equipmentName}</td>
                            <td className="py-3 px-2 font-medium">{item.partName}</td>
                            <td className="py-3 px-2 text-gray-600">{item.partCode}</td>
                            <td className="py-3 px-2 text-center">{item.currentStock}</td>
                            <td className="py-3 px-2">
                              <Input
                                type="number"
                                min="1"
                                max={item.currentStock}
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                className="w-20 text-center"
                                placeholder="0"
                              />
                            </td>
                            <td className="py-3 px-2 text-center">{item.unit}</td>
                            <td className="py-3 px-2">{item.location}</td>
                            <td className="py-3 px-2 text-center">
                              <Button
                                onClick={() => handleRemovePart(item.id)}
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    손망실 처리할 부품을 추가해주세요.
                    <br />
                    <Button
                      onClick={() => setIsPartSearchDialogOpen(true)}
                      variant="outline"
                      className="mt-2 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      부품 추가
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSubmit} disabled={!isFormValid()} className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                손망실 등록
                {!isFormValid() && (
                  <span className="sr-only">
                    {!reason.trim() ? "등록 사유를 입력해주세요" : "모든 필수 정보를 입력해주세요"}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>

      {/* Part Search Dialog */}
      <Dialog open={isPartSearchDialogOpen} onOpenChange={setIsPartSearchDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>부품 검색</DialogTitle>
            <DialogDescription>손망실 처리할 부품을 검색하여 선택해주세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="부품명, 부품코드, 장비명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-96 overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white border-b">
                  <tr>
                    <th className="text-left py-2 px-2">장비명</th>
                    <th className="text-left py-2 px-2">부품명</th>
                    <th className="text-left py-2 px-2">부품코드</th>
                    <th className="text-center py-2 px-2">현재재고</th>
                    <th className="text-center py-2 px-2">단위</th>
                    <th className="text-left py-2 px-2">보관위치</th>
                    <th className="text-center py-2 px-2">선택</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParts.map((part) => (
                    <tr key={`${part.equipmentId}-${part.partId}`} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">{part.equipmentName}</td>
                      <td className="py-2 px-2 font-medium">{part.partName}</td>
                      <td className="py-2 px-2 text-gray-600">{part.partCode}</td>
                      <td className="py-2 px-2 text-center">{part.currentStock}</td>
                      <td className="py-2 px-2 text-center">{part.unit}</td>
                      <td className="py-2 px-2">{part.location}</td>
                      <td className="py-2 px-2 text-center">
                        <Button
                          onClick={() => handleAddPart(part)}
                          size="sm"
                          disabled={lossItems.some((item) => item.partId === part.partId)}
                        >
                          {lossItems.some((item) => item.partId === part.partId) ? "추가됨" : "선택"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredParts.length === 0 && (
                <div className="text-center py-8 text-gray-500">검색 결과가 없습니다.</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              손망실 등록 완료
            </DialogTitle>
            <DialogDescription>손망실 처리가 성공적으로 등록되었습니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">등록 일자: {lossDate}</p>
            <p className="text-sm text-gray-600">등록자: {registrant}</p>
            <p className="text-sm text-gray-600">처리된 부품: {lossItems.length}개</p>
          </div>
          <DialogFooter>
            <Button onClick={handleSuccessConfirm}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
