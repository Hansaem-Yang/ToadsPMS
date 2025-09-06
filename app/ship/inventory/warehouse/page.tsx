"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  AlertTriangle,
  Package,
  Search,
  Edit,
  TrendingUp,
  BarChart3,
  Warehouse,
  Plus,
  Trash2,
  History,
} from "lucide-react"

// Mock data for warehouses
const mockWarehouses = [
  {
    warehouseId: "WH-001",
    warehouseCode: "A-1",
    warehouseName: "주엔진 부품창고",
    location: "선수 1층",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-15",
  },
  {
    warehouseId: "WH-002",
    warehouseCode: "A-2",
    warehouseName: "보조엔진 부품창고",
    location: "선수 2층",
    createdAt: "2024-01-10",
    updatedAt: "2024-01-12",
  },
  {
    warehouseId: "WH-003",
    warehouseCode: "B-1",
    warehouseName: "항해장비 부품창고",
    location: "선교 1층",
    createdAt: "2024-01-11",
    updatedAt: "2024-01-14",
  },
  {
    warehouseId: "WH-004",
    warehouseCode: "C-1",
    warehouseName: "일반 소모품창고",
    location: "선미 1층",
    createdAt: "2024-01-12",
    updatedAt: "2024-01-13",
  },
]

const mockPartsWithWarehouse = [
  { partId: "P-001", warehouseId: "WH-001", partName: "엔진 오일 필터" },
  { partId: "P-002", warehouseId: "WH-002", partName: "연료 펌프" },
  { partId: "P-003", warehouseId: "WH-001", partName: "냉각수 호스" },
]

const mockReceivingHistory = [
  { receivingId: "R-001", warehouseId: "WH-001", date: "2024-01-15" },
  { receivingId: "R-002", warehouseId: "WH-003", date: "2024-01-16" },
]

const mockOutgoingHistory = [{ outgoingId: "O-001", warehouseId: "WH-002", date: "2024-01-17" }]

export default function ShipWarehouseManagementPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [warehouses, setWarehouses] = useState(mockWarehouses)
  const [isAddWarehouseDialogOpen, setIsAddWarehouseDialogOpen] = useState(false)
  const [isEditWarehouseDialogOpen, setIsEditWarehouseDialogOpen] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null)
  const [formData, setFormData] = useState({
    warehouseCode: "",
    warehouseName: "",
    location: "",
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

  const filteredWarehouses = warehouses.filter(
    (warehouse) =>
      warehouse.warehouseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouse.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const checkWarehouseUsage = (warehouseId: string) => {
    const partsUsage = mockPartsWithWarehouse.filter((part) => part.warehouseId === warehouseId)
    const receivingUsage = mockReceivingHistory.filter((receiving) => receiving.warehouseId === warehouseId)
    const outgoingUsage = mockOutgoingHistory.filter((outgoing) => outgoing.warehouseId === warehouseId)

    return {
      isUsed: partsUsage.length > 0 || receivingUsage.length > 0 || outgoingUsage.length > 0,
      partsCount: partsUsage.length,
      receivingCount: receivingUsage.length,
      outgoingCount: outgoingUsage.length,
      details: {
        parts: partsUsage,
        receiving: receivingUsage,
        outgoing: outgoingUsage,
      },
    }
  }

  const handleAddWarehouse = () => {
    if (!formData.warehouseCode.trim() || !formData.warehouseName.trim() || !formData.location.trim()) {
      alert("모든 필드를 입력해주세요.")
      return
    }

    const newWarehouse = {
      warehouseId: `WH-${String(warehouses.length + 1).padStart(3, "0")}`,
      warehouseCode: formData.warehouseCode,
      warehouseName: formData.warehouseName,
      location: formData.location,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }

    setWarehouses([...warehouses, newWarehouse])
    setFormData({ warehouseCode: "", warehouseName: "", location: "" })
    setIsAddWarehouseDialogOpen(false)
  }

  const handleEditWarehouse = (warehouse: any) => {
    setSelectedWarehouse(warehouse)
    setFormData({
      warehouseCode: warehouse.warehouseCode,
      warehouseName: warehouse.warehouseName,
      location: warehouse.location,
    })
    setIsEditWarehouseDialogOpen(true)
  }

  const handleUpdateWarehouse = () => {
    if (!formData.warehouseCode.trim() || !formData.warehouseName.trim() || !formData.location.trim()) {
      alert("모든 필드를 입력해주세요.")
      return
    }

    const updatedWarehouses = warehouses.map((warehouse) =>
      warehouse.warehouseId === selectedWarehouse.warehouseId
        ? {
            ...warehouse,
            warehouseCode: formData.warehouseCode,
            warehouseName: formData.warehouseName,
            location: formData.location,
            updatedAt: new Date().toISOString().split("T")[0],
          }
        : warehouse,
    )

    setWarehouses(updatedWarehouses)
    setFormData({ warehouseCode: "", warehouseName: "", location: "" })
    setIsEditWarehouseDialogOpen(false)
    setSelectedWarehouse(null)
  }

  const handleDeleteWarehouse = (warehouseId: string) => {
    const usage = checkWarehouseUsage(warehouseId)

    if (usage.isUsed) {
      let message = "이 창고는 다음과 같은 데이터에서 사용 중이므로 삭제할 수 없습니다:\n\n"

      if (usage.partsCount > 0) {
        message += `• 등록된 부품: ${usage.partsCount}개\n`
      }
      if (usage.receivingCount > 0) {
        message += `• 입고 내역: ${usage.receivingCount}건\n`
      }
      if (usage.outgoingCount > 0) {
        message += `• 출고 내역: ${usage.outgoingCount}건\n`
      }

      message += "\n먼저 관련 데이터를 정리한 후 삭제해주세요."
      alert(message)
      return
    }

    if (confirm("정말로 이 창고를 삭제하시겠습니까?")) {
      setWarehouses(warehouses.filter((warehouse) => warehouse.warehouseId !== warehouseId))
    }
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
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors text-gray-700 hover:bg-gray-50"
              >
                <AlertTriangle className="w-4 h-4" />
                손망실 처리
              </button>
              <button
                onClick={() => router.push("/ship/inventory/warehouse")}
                className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors bg-blue-50 text-blue-700 border border-blue-200"
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
                <h1 className="text-2xl font-bold text-gray-900">창고관리</h1>
                <p className="text-gray-600">선박 내 창고 정보를 등록하고 관리합니다</p>
              </div>
              <Button onClick={() => setIsAddWarehouseDialogOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                창고 추가
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Warehouse className="w-5 h-5" />
                    창고 목록
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="창고코드, 창고명, 위치로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-3 px-2">창고코드</th>
                        <th className="text-left py-3 px-2">창고명</th>
                        <th className="text-left py-3 px-2">창고위치</th>
                        <th className="text-center py-3 px-2">등록일</th>
                        <th className="text-center py-3 px-2">수정일</th>
                        <th className="text-center py-3 px-2">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWarehouses.map((warehouse) => {
                        const usage = checkWarehouseUsage(warehouse.warehouseId)
                        return (
                          <tr key={warehouse.warehouseId} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-2 font-medium">{warehouse.warehouseCode}</td>
                            <td className="py-3 px-2">
                              {warehouse.warehouseName}
                              {usage.isUsed && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                  사용중
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-2 text-gray-600">{warehouse.location}</td>
                            <td className="py-3 px-2 text-center text-gray-500">{warehouse.createdAt}</td>
                            <td className="py-3 px-2 text-center text-gray-500">{warehouse.updatedAt}</td>
                            <td className="py-3 px-2 text-center">
                              <div className="flex justify-center gap-2">
                                <Button onClick={() => handleEditWarehouse(warehouse)} size="sm" variant="ghost">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteWarehouse(warehouse.warehouseId)}
                                  size="sm"
                                  variant="ghost"
                                  className={`${usage.isUsed ? "text-gray-400 cursor-not-allowed" : "text-red-600 hover:text-red-700"}`}
                                  disabled={usage.isUsed}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  {filteredWarehouses.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm ? "검색 결과가 없습니다." : "등록된 창고가 없습니다."}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Add Warehouse Dialog */}
            <Dialog open={isAddWarehouseDialogOpen} onOpenChange={setIsAddWarehouseDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>창고 추가</DialogTitle>
                  <DialogDescription>새로운 창고 정보를 입력해주세요.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="warehouseCode">창고코드 *</Label>
                    <Input
                      id="warehouseCode"
                      placeholder="예: A-1"
                      value={formData.warehouseCode}
                      onChange={(e) => setFormData({ ...formData, warehouseCode: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="warehouseName">창고명 *</Label>
                    <Input
                      id="warehouseName"
                      placeholder="예: 주엔진 부품창고"
                      value={formData.warehouseName}
                      onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">창고위치 *</Label>
                    <Input
                      id="location"
                      placeholder="예: 선수 1층"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddWarehouseDialogOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleAddWarehouse}>추가</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Warehouse Dialog */}
            <Dialog open={isEditWarehouseDialogOpen} onOpenChange={setIsEditWarehouseDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>창고 수정</DialogTitle>
                  <DialogDescription>창고 정보를 수정해주세요.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="editWarehouseCode">창고코드 *</Label>
                    <Input
                      id="editWarehouseCode"
                      value={formData.warehouseCode}
                      onChange={(e) => setFormData({ ...formData, warehouseCode: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editWarehouseName">창고명 *</Label>
                    <Input
                      id="editWarehouseName"
                      value={formData.warehouseName}
                      onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="editLocation">창고위치 *</Label>
                    <Input
                      id="editLocation"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditWarehouseDialogOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleUpdateWarehouse}>수정</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  )
}
