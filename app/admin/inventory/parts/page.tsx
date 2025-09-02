"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Package,
  BarChart3,
  AlertTriangle,
  History,
  Plus,
  Edit,
  Trash2,
  Settings,
  Upload,
  Download,
} from "lucide-react"

// Mock data for ships and equipment
const mockShips = [
  { id: "SHIP-001", name: "한국호" },
  { id: "SHIP-002", name: "부산호" },
  { id: "SHIP-003", name: "인천호" },
]

const mockEquipment = {
  "SHIP-001": [
    { id: "EQ-001", name: "주엔진" },
    { id: "EQ-002", name: "보조엔진" },
    { id: "EQ-003", name: "발전기" },
  ],
  "SHIP-002": [
    { id: "EQ-004", name: "주엔진" },
    { id: "EQ-005", name: "보조엔진" },
  ],
  "SHIP-003": [
    { id: "EQ-006", name: "주엔진" },
    { id: "EQ-007", name: "발전기" },
  ],
}

const initialParts = [
  {
    id: "PART-001",
    shipId: "SHIP-001",
    equipmentId: "EQ-001",
    partName: "피스톤 링",
    partCode: "PR-001",
    partNumbers: ["PN-12345", "PN-67890"],
    unit: "개",
    minStock: 20,
    initialStock: 50,
  },
  {
    id: "PART-002",
    shipId: "SHIP-001",
    equipmentId: "EQ-001",
    partName: "실린더 라이너",
    partCode: "CL-001",
    partNumbers: ["PN-11111", "PN-22222", "PN-33333"],
    unit: "개",
    minStock: 15,
    initialStock: 30,
  },
  {
    id: "PART-003",
    shipId: "SHIP-002",
    equipmentId: "EQ-004",
    partName: "연료 필터",
    partCode: "FF-001",
    partNumbers: ["PN-44444"],
    unit: "개",
    minStock: 25,
    initialStock: 40,
  },
]

export default function PartsManagementPage() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState("parts")
  const [selectedShip, setSelectedShip] = useState<string>("all")
  const [selectedEquipment, setSelectedEquipment] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isExcelUploadOpen, setIsExcelUploadOpen] = useState(false)
  const [editingPart, setEditingPart] = useState<any>(null)
  const [parts, setParts] = useState(initialParts)
  const [formData, setFormData] = useState({
    partName: "",
    partCode: "",
    partNumbers: ["", "", ""],
    unit: "",
    minStock: "",
    initialStock: "",
  })

  const menuItems = [
    { id: "dashboard", label: "대시보드", icon: BarChart3 },
    { id: "status", label: "재고 현황", icon: Package },
    { id: "transactions", label: "입출고 내역", icon: History },
    { id: "shortage", label: "부족 부품", icon: AlertTriangle },
    { id: "statistics", label: "통계", icon: BarChart3 },
    { id: "parts", label: "부품 관리", icon: Settings },
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

  const getFilteredParts = () => {
    return parts.filter((part) => {
      if (selectedShip && selectedShip !== "all" && part.shipId !== selectedShip) return false
      if (selectedEquipment && selectedEquipment !== "all" && part.equipmentId !== selectedEquipment) return false
      return true
    })
  }

  const getShipName = (shipId: string) => {
    return mockShips.find((ship) => ship.id === shipId)?.name || ""
  }

  const getEquipmentName = (equipmentId: string) => {
    for (const shipEquipment of Object.values(mockEquipment)) {
      const equipment = shipEquipment.find((eq) => eq.id === equipmentId)
      if (equipment) return equipment.name
    }
    return ""
  }

  const handleAddPart = () => {
    if (!selectedShip || selectedShip === "all" || !selectedEquipment || selectedEquipment === "all") {
      alert("선박과 장비를 선택해주세요.")
      return
    }

    const newPart = {
      id: `PART-${Date.now()}`,
      shipId: selectedShip,
      equipmentId: selectedEquipment,
      partName: formData.partName,
      partCode: formData.partCode,
      partNumbers: formData.partNumbers.filter((pn) => pn.trim() !== ""),
      unit: formData.unit,
      minStock: Number.parseInt(formData.minStock) || 0,
      initialStock: Number.parseInt(formData.initialStock) || 0,
    }

    setParts((prevParts) => [...prevParts, newPart])
    setIsAddDialogOpen(false)
    setFormData({
      partName: "",
      partCode: "",
      partNumbers: ["", "", ""],
      unit: "",
      minStock: "",
      initialStock: "",
    })
    console.log("[v0] Part added successfully:", newPart)
  }

  const handleEditPart = (part: any) => {
    setEditingPart(part)
    setFormData({
      partName: part.partName,
      partCode: part.partCode,
      partNumbers: [...part.partNumbers, "", "", ""].slice(0, 3),
      unit: part.unit,
      minStock: part.minStock.toString(),
      initialStock: part.initialStock?.toString() || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdatePart = () => {
    if (!editingPart) return

    const updatedPart = {
      ...editingPart,
      partName: formData.partName,
      partCode: formData.partCode,
      partNumbers: formData.partNumbers.filter((pn) => pn.trim() !== ""),
      unit: formData.unit,
      minStock: Number.parseInt(formData.minStock) || 0,
      initialStock: Number.parseInt(formData.initialStock) || 0,
    }

    setParts((prevParts) => prevParts.map((part) => (part.id === editingPart.id ? updatedPart : part)))
    setIsEditDialogOpen(false)
    setEditingPart(null)
    setFormData({
      partName: "",
      partCode: "",
      partNumbers: ["", "", ""],
      unit: "",
      minStock: "",
      initialStock: "",
    })
    console.log("[v0] Part updated successfully:", updatedPart)
  }

  const handleDeletePart = (partId: string) => {
    if (confirm("이 부품을 삭제하시겠습니까?")) {
      setParts((prevParts) => prevParts.filter((part) => part.id !== partId))
      console.log("[v0] Part deleted successfully:", partId)
    }
  }

  const updatePartNumber = (index: number, value: string) => {
    const newPartNumbers = [...formData.partNumbers]
    newPartNumbers[index] = value
    setFormData({ ...formData, partNumbers: newPartNumbers })
  }

  const handleDownloadTemplate = () => {
    const csvContent =
      "선박ID,장비ID,부품명,부품코드,Part No.1,Part No.2,Part No.3,단위,최소재고,기초재고\n" +
      "SHIP-001,EQ-001,샘플 부품,SP-001,PN-001,PN-002,,개,10,50\n"

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "부품_등록_템플릿.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("Uploading file:", file.name)
      const sampleParts = [
        {
          id: `PART-EXCEL-${Date.now()}`,
          shipId: "SHIP-001",
          equipmentId: "EQ-001",
          partName: "Excel 업로드 부품",
          partCode: "EX-001",
          partNumbers: ["PN-EXCEL-001"],
          unit: "개",
          minStock: 10,
          initialStock: 25,
        },
      ]
      setParts((prevParts) => [...prevParts, ...sampleParts])
      alert("파일이 성공적으로 업로드되었습니다.")
      setIsExcelUploadOpen(false)
    }
  }

  const filteredParts = getFilteredParts()
  const availableEquipment = selectedShip ? mockEquipment[selectedShip] || [] : []

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
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
                  <h2 className="text-xl font-bold text-gray-900">부품 관리</h2>
                  <p className="text-gray-600">각 선박의 장비별 부품 정보를 관리합니다</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleDownloadTemplate}>
                    <Download className="w-4 h-4 mr-2" />
                    템플릿 다운로드
                  </Button>
                  <Dialog open={isExcelUploadOpen} onOpenChange={setIsExcelUploadOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Upload className="w-4 h-4 mr-2" />
                        Excel 업로드
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Excel 파일 업로드</DialogTitle>
                        <DialogDescription>
                          CSV 또는 Excel 파일을 업로드하여 부품을 일괄 등록할 수 있습니다.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="text-sm text-gray-600">
                          <p>• CSV 또는 Excel 파일을 업로드하여 부품을 일괄 등록할 수 있습니다.</p>
                          <p>• 먼저 템플릿을 다운로드하여 형식을 확인하세요.</p>
                        </div>
                        <div>
                          <Label htmlFor="excel-file">파일 선택</Label>
                          <Input
                            id="excel-file"
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleExcelUpload}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        부품 추가
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>새 부품 추가</DialogTitle>
                        <DialogDescription>새로운 부품 정보를 입력하여 시스템에 등록합니다.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="ship">선박</Label>
                          <Select value={selectedShip} onValueChange={setSelectedShip}>
                            <SelectTrigger>
                              <SelectValue placeholder="선박을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockShips.map((ship) => (
                                <SelectItem key={ship.id} value={ship.id}>
                                  {ship.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="equipment">장비</Label>
                          <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                            <SelectTrigger>
                              <SelectValue placeholder="장비를 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableEquipment.map((equipment) => (
                                <SelectItem key={equipment.id} value={equipment.id}>
                                  {equipment.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="partName">부품명</Label>
                          <Input
                            id="partName"
                            value={formData.partName}
                            onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
                            placeholder="부품명을 입력하세요"
                          />
                        </div>
                        <div>
                          <Label htmlFor="partCode">부품코드</Label>
                          <Input
                            id="partCode"
                            value={formData.partCode}
                            onChange={(e) => setFormData({ ...formData, partCode: e.target.value })}
                            placeholder="부품코드를 입력하세요"
                          />
                        </div>
                        <div>
                          <Label>Part No. (최대 3개)</Label>
                          {formData.partNumbers.map((partNumber, index) => (
                            <Input
                              key={index}
                              value={partNumber}
                              onChange={(e) => updatePartNumber(index, e.target.value)}
                              placeholder={`Part No. ${index + 1}`}
                              className="mt-2"
                            />
                          ))}
                        </div>
                        <div>
                          <Label htmlFor="unit">단위</Label>
                          <Input
                            id="unit"
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            placeholder="단위를 입력하세요"
                          />
                        </div>
                        <div>
                          <Label htmlFor="minStock">최소 보유재고</Label>
                          <Input
                            id="minStock"
                            type="number"
                            value={formData.minStock}
                            onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                            placeholder="최소 보유재고를 입력하세요"
                          />
                        </div>
                        <div>
                          <Label htmlFor="initialStock">기초 재고</Label>
                          <Input
                            id="initialStock"
                            type="number"
                            value={formData.initialStock}
                            onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                            placeholder="기초 재고를 입력하세요"
                          />
                        </div>
                        <Button onClick={handleAddPart} className="w-full">
                          추가
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>필터</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label>선박</Label>
                      <Select value={selectedShip} onValueChange={setSelectedShip}>
                        <SelectTrigger>
                          <SelectValue placeholder="전체 선박" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">전체 선박</SelectItem>
                          {mockShips.map((ship) => (
                            <SelectItem key={ship.id} value={ship.id}>
                              {ship.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label>장비</Label>
                      <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                        <SelectTrigger>
                          <SelectValue placeholder="전체 장비" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">전체 장비</SelectItem>
                          {availableEquipment.map((equipment) => (
                            <SelectItem key={equipment.id} value={equipment.id}>
                              {equipment.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>부품 목록 ({filteredParts.length}개)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3">선박</th>
                          <th className="text-left py-3">장비</th>
                          <th className="text-left py-3">부품명</th>
                          <th className="text-left py-3">부품코드</th>
                          <th className="text-left py-3">Part No.</th>
                          <th className="text-center py-3">단위</th>
                          <th className="text-center py-3">최소재고</th>
                          <th className="text-center py-3">기초재고</th>
                          <th className="text-center py-3">작업</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredParts.map((part) => (
                          <tr key={part.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 font-medium">{getShipName(part.shipId)}</td>
                            <td className="py-3">{getEquipmentName(part.equipmentId)}</td>
                            <td className="py-3 font-medium">{part.partName}</td>
                            <td className="py-3 text-gray-600">{part.partCode}</td>
                            <td className="py-3">
                              <div className="flex flex-wrap gap-1">
                                {part.partNumbers.map((partNumber, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {partNumber}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 text-center">{part.unit}</td>
                            <td className="py-3 text-center font-medium">{part.minStock}</td>
                            <td className="py-3 text-center font-medium text-blue-600">{part.initialStock || 0}</td>
                            <td className="py-3">
                              <div className="flex gap-2 justify-center">
                                <Button size="sm" variant="outline" onClick={() => handleEditPart(part)}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeletePart(part.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>부품 수정</DialogTitle>
              <DialogDescription>선택한 부품의 정보를 수정합니다.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editPartName">부품명</Label>
                <Input
                  id="editPartName"
                  value={formData.partName}
                  onChange={(e) => setFormData({ ...formData, partName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editPartCode">부품코드</Label>
                <Input
                  id="editPartCode"
                  value={formData.partCode}
                  onChange={(e) => setFormData({ ...formData, partCode: e.target.value })}
                />
              </div>
              <div>
                <Label>Part No. (최대 3개)</Label>
                {formData.partNumbers.map((partNumber, index) => (
                  <Input
                    key={index}
                    value={partNumber}
                    onChange={(e) => updatePartNumber(index, e.target.value)}
                    placeholder={`Part No. ${index + 1}`}
                    className="mt-2"
                  />
                ))}
              </div>
              <div>
                <Label htmlFor="editUnit">단위</Label>
                <Input
                  id="editUnit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editMinStock">최소 보유재고</Label>
                <Input
                  id="editMinStock"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editInitialStock">기초 재고</Label>
                <Input
                  id="editInitialStock"
                  type="number"
                  value={formData.initialStock}
                  onChange={(e) => setFormData({ ...formData, initialStock: e.target.value })}
                />
              </div>
              <Button onClick={handleUpdatePart} className="w-full">
                수정
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
