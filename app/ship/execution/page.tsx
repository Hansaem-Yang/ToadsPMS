"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { vesselRequireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Settings, Wrench, Calendar, AlertTriangle, CheckCircle, Plus, PlusCircle } from "lucide-react"
import { Equipment } from '@/types/dashboard/equipment';
import { Maintenance } from '@/types/dashboard/maintenance';
import { MaintenanceExtension } from '@/types/vessel/maintenance_extension';

export default function MaintenanceExecutionPage() {
  const searchParams = useSearchParams()
  const equipName = searchParams.get("equipName") || ""
  const initialMaintenanceItem: Maintenance = {
    vessel_no: "",
    vessel_name: "",
    equip_no: "",
    equip_name: "",
    section_code: "",
    section_name: "",
    plan_code: "",
    plan_name: "",
    category: "",
    manufacturer: "",
    model: "",
    specifications: "",
    lastest_date: "",
    workers: 0,
    work_hours: 0,
    interval: 0,
    interval_term: "",
    location: "",
    self_maintenance: "",
    manager: "",
    critical: "",
    due_date: "",
    next_due_date: "",
    status: "",
    days_until: 0,
    extension_date: "",
    extension_days_until: 0,
    work_details: "",
    delay_reason: ""
  };

  
  const initialMaintenanceExtension: MaintenanceExtension = {
    vessel_no: "",
    equip_no: "",
    section_code: "",
    plan_code: "",
    plan_name: "",
    manager: "",
    extension_seq: "",
    extension_date: "",
    extension_reason: "",
    due_date: "",
    next_due_date: "",
    applicant: "",
    approval_status: "",
    approval_date: "",
    approver: "",
    regist_date: "",
    regist_user: "",
    modify_date: "",
    modify_user: "",
  };

  const [userInfo, setUserInfo] = useState<any>(null)
  const [params, setParams] = useState<any>(null)
  const [equipmentWorks, setEquipmentWorks] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState(equipmentWorks)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("ALL")
  const [selectedWork, setSelectedWork] = useState<any>(null)
  const [isExecutionDialogOpen, setIsExecutionDialogOpen] = useState(false)
  const [executionResult, setExecutionResult] = useState<Maintenance>(initialMaintenanceItem)

  const [selectedWorks, setSelectedWorks] = useState<string[]>([])
  const [isBulkExecutionDialogOpen, setIsBulkExecutionDialogOpen] = useState(false)
  const [bulkExecutionData, setBulkExecutionData] = useState({
    name: "",
    tasks: [] as any[],
  })

  const [selectedExtension, setSelectedExtension] = useState<any>(null)
  const [isExtensionDialogOpen, setIsExtensionDialogOpen] = useState(false)
  const [extensionResult, setExtensionResult] = useState<MaintenanceExtension>(initialMaintenanceExtension)
  const nowDate = new Date();
  const today = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate())
  
  const fetchEquipmentTasks = (vesselNo: string) => {
    fetch(`/api/ship/execution/all?vesselNo=${vesselNo}`)
      .then(res => res.json())
      .then(data => setEquipmentWorks(data))
      .catch(err => console.error(err));
  }

  useEffect(() => {
    try {
      const user = vesselRequireAuth()
      setUserInfo(user)

      fetchEquipmentTasks(user.ship_no)
      
      if (equipName) {
        setParams(equipName)
      }
    } catch (error) {
      // Redirect handled by requireAuth
    }
  }, [])

  useEffect(() => {
    let filtered = equipmentWorks
      
    if (params) {
      setSearchTerm(params);

      setParams('');
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (eq) =>
          eq.equip_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          eq.children.some((task) => task.plan_name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (categoryFilter !== "ALL") {
      filtered = filtered.filter((eq) => eq.category === categoryFilter)
    }

    setFilteredEquipment(filtered)
  }, [equipmentWorks, searchTerm, categoryFilter])

  if (!userInfo) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELAYED":
        return <Badge variant="destructive">지연</Badge>
      case "EXTENSION":
        return <Badge variant="outline">연장</Badge>
      case "NORMAL":
        return <Badge variant="secondary">예정</Badge>
      case "COMPLATE":
        return <Badge variant="default">완료</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  const getCriticalBadge = (critical: string) => {
    switch (critical) {
      case "NORMAL":
        return <Badge variant="outline" className="text-xs">일상정비</Badge>
      case "CRITICAL":
        return <Badge variant="destructive" className="text-xs">Critical</Badge>
      case "DOCK":
        return <Badge variant="secondary" className="text-xs">Dock</Badge>
      case "CMS":
        return <Badge variant="default" className="text-xs">CMS</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELAYED":
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case "EXTENSION":
        return <PlusCircle className="w-4 h-4 text-orange-600" />
      case "NORMAL":
        return <Calendar className="w-4 h-4 text-blue-600" />
      case "COMPLATE":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const handleExecuteTask = (equipment: any, task: any) => {
    setSelectedWork({ ...task, equipment: equipment.name })
    setExecutionResult(task);
    setIsExecutionDialogOpen(true)
  }

  const handleSaveExecution = async () => {
    const res = await fetch('/api/ship/execution/insert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(executionResult),
    });
    
    // 선택된 작업들의 상태를 완료로 업데이트
    setEquipmentWorks((prev) =>
      prev.map((eq) => ({
        ...eq,
        children: eq.children.map((task) =>
          executionResult.equip_no === task.equip_no &&
          executionResult.section_code === task.section_code &&
          executionResult.plan_code === task.plan_code
          ? { ...task, status: "COMPLATE", lastest_date: new Date().toISOString().split("T")[0] }
          : task,
        ),
      })),
    )

    setIsExecutionDialogOpen(false)
    setSelectedWork(null)
  }

  const handleExtension = (equipment: any, task: any) => {
    setSelectedExtension({ ...task, equipment: equipment.name });
    setExtensionResult(task);
    setIsExtensionDialogOpen(true);

    setExtensionResult((prev) => ({ ...prev, applicant: userInfo.account_no }))
  }

  const handleSaveExtension = async () => {
    const res = await fetch('/api/ship/extension/insert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(extensionResult),
    });
    
    // 선택된 작업들의 상태를 완료로 업데이트
    setEquipmentWorks((prev) =>
      prev.map((eq) => ({
        ...eq,
        children: eq.children.map((task) =>
          extensionResult.equip_no === task.equip_no &&
          extensionResult.section_code === task.section_code &&
          extensionResult.plan_code === task.plan_code
          ? { ...task, status: "EXTENSION", extension_date: extensionResult.extension_date }
          : task,
        ),
      })),
    )

    setIsExtensionDialogOpen(false)
    setSelectedExtension(null)
  }

  const getTotalTasks = () => {
    return equipmentWorks.reduce((total, eq) => total + eq.children.length, 0)
  }

  const getTasksByStatus = (status: string) => {
    return equipmentWorks.reduce((total, eq) => {
      return total + eq.children.filter((task) => task.status === status).length
    }, 0)
  }

  const handleTaskSelection = (taskId: string, equipmentName: string, task: any) => {
    setSelectedWorks((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId)
      } else {
        return [...prev, taskId]
      }
    })
  }

  const handleSelectAll = () => {
    const allTaskIds = filteredEquipment.flatMap((eq) =>
      eq.children.filter((task) => task.status !== "COMPLATE").map((task) => `${task.equip_no}-${task.section_code}-${task.plan_code}`),
    )

    if (selectedWorks.length === allTaskIds.length) {
      setSelectedWorks([])
    } else {
      setSelectedWorks(allTaskIds)
    }
  }

  const handleBulkExecution = (equipNo: string, equipName: string) => {
    const tasksToExecute = filteredEquipment.flatMap((eq) =>
      eq.children
        .filter((task) => task.equip_no === equipNo && selectedWorks.includes(`${task.equip_no}-${task.section_code}-${task.plan_code}`))
        .map((task) => ({
          ...task,
          equipmentName: eq.equip_name,
          actualHours: task.work_hours.toString(),
          partsUsed: "",
          notes: "",
          issues: "",
        })),
    )

    setBulkExecutionData({
      name: equipName,
      tasks: tasksToExecute,
    })
    setIsBulkExecutionDialogOpen(true)
  }

  const handleSaveBulkExecution = async () => {
    const res = await fetch('/api/ship/execution/inserts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bulkExecutionData.tasks),
    });

    // 선택된 작업들의 상태를 완료로 업데이트
    setEquipmentWorks((prev) =>
      prev.map((eq) => ({
        ...eq,
        children: eq.children.map((task) =>
          bulkExecutionData.tasks.some((data) =>
            data.equip_no === task.equip_no &&
            data.section_code === task.section_code &&
            data.plan_code === task.plan_code
          )
          ? { ...task, status: "COMPLATE", lastest_date: new Date().toISOString().split("T")[0] }
          : task,
        ),
      })),
    )

    setSelectedWorks([])
    setIsBulkExecutionDialogOpen(false)
  }

  const updateTaskData = (equip_no: string, section_code: string, plan_code: string, field: string, value: string) => {
    setBulkExecutionData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) => (task.equip_no === equip_no && task.section_code === section_code && task.plan_code === plan_code ? { ...task, [field]: value } : task)),
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar userType={userInfo.user_auth} />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{userInfo.ship_name} - 정비 실행</h1>
                <p className="text-gray-600">{userInfo?.ship_no} 선박의 정비 작업을 실행하고 결과를 등록하세요</p>
              </div>
            </div>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">총 작업 수</CardTitle>
                <Wrench className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getTotalTasks()}</div>
                <p className="text-xs text-muted-foreground">전체 작업</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">지연된 작업</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{getTasksByStatus("DELAYED")}</div>
                <p className="text-xs text-muted-foreground">즉시 실행 필요</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">예정된 작업</CardTitle>
                <Calendar className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{getTasksByStatus("NORMAL") + getTasksByStatus("EXTENSION")}</div>
                <p className="text-xs text-muted-foreground">실행 대기</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">완료된 작업</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{getTasksByStatus("COMPLATE")}</div>
                <p className="text-xs text-muted-foreground">실행 완료</p>
              </CardContent>
            </Card>
          </div>

          {/* 필터 및 검색 */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">필터 및 검색</CardTitle>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={
                      selectedWorks.length > 0 &&
                      selectedWorks.length ===
                        filteredEquipment.flatMap((eq) => eq.children.filter((task) => task.status !== "COMPLATE")).length
                    }
                    onCheckedChange={handleSelectAll}
                  />
                  <Label htmlFor="select-all" className="text-sm">
                    전체 선택
                  </Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="장비명, 작업명으로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체 카테고리</SelectItem>
                    <SelectItem value="ENGINE">Engine</SelectItem>
                    <SelectItem value="DECK">Deck</SelectItem>
                    <SelectItem value="ETC">Etc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 장비별 작업 목록 */}
          <div className="space-y-6">
            {filteredEquipment.map((eq) => (
              <Card key={eq.equip_no}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Settings className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{eq.equip_name}</CardTitle>
                        <p className="text-gray-600">{eq.category}</p>
                      </div>
                    </div>
                    {selectedWorks.length > 0 && (
                      selectedWorks.filter(selected => selected.includes(eq.equip_no)).length > 0 && (
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{selectedWorks.filter(selected => selected.includes(eq.equip_no)).length}개 작업 선택됨</span>
                        <Button onClick={() => handleBulkExecution(eq.equip_no, eq.equip_name)} className="bg-blue-600 hover:bg-blue-700" style={{cursor: 'pointer'}}>
                          <Plus className="w-4 h-4 mr-2" />
                          일괄 실행 등록
                        </Button>
                      </div>
                      )
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {eq.children.map((task) => (
                      <div key={`${task.equip_no}-${task.section_code}-${task.plan_code}`} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <Checkbox
                              id={`${task.equip_no}-${task.section_code}-${task.plan_code}`}
                              checked={selectedWorks.includes(`${task.equip_no}-${task.section_code}-${task.plan_code}`)}
                              onCheckedChange={() => handleTaskSelection(`${task.equip_no}-${task.section_code}-${task.plan_code}`, eq.equip_name, task)}
                              disabled={task.status === "COMPLATE"}
                              className="mt-1"
                            />
                            <div className="flex items-center gap-2">
                              {getStatusIcon(task.status)}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold">{task.plan_name}</h4>
                                  <span className="text-sm text-gray-500">({task.plan_code})</span>
                                  {task.critical && getCriticalBadge(task.critical)}
                                  {getStatusBadge(task.status)}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{task.specifications}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>예정일: {task.extension_date ? task.extension_date : task.due_date}</span>
                                  <span>담당자: {task.manager}</span>
                                  <span>작업자수: {task.workers}</span>
                                  <span>작업자별 작업시간: {task.work_hours}시간</span>
                                  {task.status === "COMPLATE" && (
                                    <span className="text-green-600">완료일: {task.lastest_date}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          {task.status !== "COMPLATE" && task.status === "DELAYED" && (
                            <Button onClick={() => handleExtension(eq, task)} size="sm" className="ml-4" style={{cursor: 'pointer'}}>
                              연장 신청
                            </Button>
                          )}
                          {task.status !== "COMPLATE" && (
                            <Button onClick={() => handleExecuteTask(eq, task)} size="sm" className="ml-4" style={{cursor: 'pointer'}}>
                              개별 실행
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Dialog open={isBulkExecutionDialogOpen} onOpenChange={setIsBulkExecutionDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>일괄 정비 작업 실행 등록</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* 개별 작업 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{bulkExecutionData.name}</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {bulkExecutionData.tasks.map((task) => (
                      <Card key={`${task.equip_no}-${task.section_code}-${task.plan_code}`} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{task.plan_name}</h4>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">실제 소요시간</Label>
                              <Input
                                type="number"
                                placeholder="시간"
                                value={task.work_hours}
                                onChange={(e) => updateTaskData(task.equip_no, task.section_code, task.plan_code, "work_hours", e.target.value)}
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">다음 정비 예정일</Label>
                              <Input
                                type="date"
                                placeholder="시간"
                                value={task.next_due_date}
                                className="text-sm"
                                disabled
                              />
                            </div>
                          </div>
                          <div>
                              <Label className="text-xs">사용 부품</Label>
                              <Input
                                placeholder="부품명"
                                value={task.used_parts}
                                onChange={(e) => updateTaskData(task.equip_no, task.section_code, task.plan_code, "used_parts", e.target.value)}
                                className="text-sm"
                              />
                          </div>
                          <div>
                            <Label className="text-xs">작업 내용</Label>
                            <Textarea
                              placeholder="이 작업에 대한 내용..."
                              value={task.work_details}
                              onChange={(e) => updateTaskData(task.equip_no, task.section_code, task.plan_code, "work_details", e.target.value)}
                              rows={2}
                              className="text-sm"
                            />
                          </div>
                          {task.status === "DELAYED" && (
                            <div>
                              <Label className="text-xs">지연 사유</Label>
                              <Textarea
                                placeholder="이 작업에 대한 지연 사유..."
                                value={task.delay_reason}
                                onChange={(e) => updateTaskData(task.equip_no, task.section_code, task.plan_code, "delay_reason", e.target.value)}
                                rows={2}
                                className="text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsBulkExecutionDialogOpen(false)} style={{cursor: 'pointer'}}>
                  취소
                </Button>
                <Button 
                  onClick={handleSaveBulkExecution} 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={bulkExecutionData?.tasks.filter(item => !item.work_details || (item.status === "DELAYED" && !item.delay_reason)).length > 0}
                  style={{cursor: 'pointer'}}
                >
                  일괄 등록 완료
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* 개별 실행 다이얼로그 */}
          {selectedWork && (
            <Dialog open={isExecutionDialogOpen} onOpenChange={setIsExecutionDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>작업 실행 등록</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">실제 소요시간</Label>
                      <Input
                        type="number"
                        placeholder="시간"
                        value={selectedWork.work_hours}
                        onChange={(e) => updateTaskData(selectedWork.equip_no, selectedWork.section_code, selectedWork.plan_code, "work_hours", e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">다음 정비일자</Label>
                      <Input
                        type="date"
                        placeholder="시간"
                        value={selectedWork.next_due_date}
                        className="text-sm"
                        disabled
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="parts-used">사용 부품</Label>
                    <Input
                      id="parts-used"
                      placeholder="부품명"
                      value={selectedWork.used_parts}
                      onChange={(e) => setExecutionResult((prev) => ({ ...prev, used_parts: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">작업 내용</Label>
                    <Textarea
                      id="notes"
                      placeholder="이 작업에 대한 내용을 입력하세요..."
                      value={selectedWork.work_details}
                      onChange={(e) => setExecutionResult((prev) => ({ ...prev, work_details: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  {selectedWork.status === "DELAYED" && (
                    <div>
                      <Label className="text-xs">지연 사유</Label>
                      <Textarea
                        placeholder="이 작업에 대한 지연 사유..."
                        value={selectedWork.delay_reason}
                        onChange={(e) => setExecutionResult((prev) => ({ ...prev, delay_reason: e.target.value }))}
                        rows={2}
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsExecutionDialogOpen(false)}>
                    취소
                  </Button>
                  <Button 
                    onClick={handleSaveExecution} 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!executionResult.work_details || (executionResult.status === "DELAYED" && !executionResult.delay_reason) }
                    style={{cursor: 'pointer'}}
                  >
                    등록 완료
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          

          {/* 연장 신청 다이얼로그 */}
          {selectedExtension && (
            <Dialog open={isExtensionDialogOpen} onOpenChange={setIsExtensionDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>작업 연장 신청</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">예정일</Label>
                      <Input
                        type="date"
                        placeholder="예정일"
                        value={selectedExtension.due_date}
                        className="text-sm"
                        disabled
                      />
                    </div>
                    <div>
                      <Label className="text-xs">연장 일자</Label>
                      <Input
                        type="date"
                        placeholder="신청일자"
                        defaultValue={selectedExtension.extension_date}
                        className="text-sm"
                        onChange={(e) => setExtensionResult((prev) => ({ ...prev, extension_date: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">연장 사유</Label>
                    <Textarea
                      placeholder="이 작업에 대한 일정 연장 사유..."
                      defaultValue={selectedExtension.extension_reason}
                      onChange={(e) => setExtensionResult((prev) => ({ ...prev, extension_reason: e.target.value }))}
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsExtensionDialogOpen(false)}>
                    취소
                  </Button>
                  <Button 
                    onClick={handleSaveExtension} 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!extensionResult.next_due_date || !(new Date(extensionResult.next_due_date) > today) || !extensionResult.extension_reason }
                    style={{cursor: 'pointer'}}
                  >
                    등록 완료
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </main>
      </div>
    </div>
  )
}
