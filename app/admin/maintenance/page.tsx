"use client"

import { useEffect, useState } from "react"
import { requireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  User,
  Search,
  ChevronDown,
  ChevronRight,
  Wrench,
  Calendar,
  AlertTriangle,
  Settings,
  Ship,
  FolderTree,
  History,
  Clock,
  FileText,
} from "lucide-react"
import { Maintenance } from '@/types/status/maintenance'; // ✅ interface import
import { MaintenanceWork } from '@/types/vessel/maintenance_work'; // ✅ interface import

export default function MaintenanceWorkManagementPage() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [vessels, setVessels] = useState<Maintenance[]>([])
  const [maintenanceData, setMaintenanceData] = useState<Maintenance[]>([])
  const [filteredData, setFilteredData] = useState<Maintenance[]>(maintenanceData)
  const [searchTerm, setSearchTerm] = useState("")
  const [shipFilter, setShipFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // State for work history dialogs
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [isDetailHistoryDialogOpen, setIsDetailHistoryDialogOpen] = useState(false)
  const [selectedHistoryItems, setSelectedHistoryItems] = useState<MaintenanceWork[]>([])
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string>("")

  const fetchVessels = () => {
    fetch(`/api/admin/ships/all`)
      .then(res => res.json())
      .then(data => setVessels(data))
      .catch(err => console.error(err));
  };

  const fetchMaintenance = () => {
    fetch(`/api/admin/maintenance`)
      .then(res => res.json())
      .then(data => setMaintenanceData(data))
      .catch(err => console.error(err));
  };
  
  const fetchMaintenanceWork = (vesselNo: string, equipNo: string, sectionCode: string, planCode: string) => {
    fetch(`/api/admin/maintenance/work?vesselNo=${vesselNo}&equipNo=${equipNo}&sectionCode=${sectionCode}&planCode=${planCode}`)
      .then(res => res.json())
      .then(data => {
        setSelectedHistoryItems(data)
        setIsHistoryDialogOpen(true)
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    try {
      const user = requireAuth();
      setUserInfo(user);

      fetchVessels();
      fetchMaintenance();
    } catch (error) {
      // Redirect handled by requireAuth
    }
  }, [])

  useEffect(() => {
    let filtered = maintenanceData

    if (shipFilter !== "all") {
      filtered = filtered.filter((item) => item.vessel_no === shipFilter)
    }

    if (searchTerm) {
      filtered = filterBySearch(filtered, searchTerm)
    }

    if (statusFilter !== "all") {
      filtered = filterByStatus(filtered, statusFilter)
    }

    setFilteredData(filtered)
  }, [maintenanceData, searchTerm, shipFilter, statusFilter])

  if (!userInfo) return null

  const filterBySearch = (items: Maintenance[], term: string): Maintenance[] => {
    return items.map((item) => {
        const matchesSearch = item.name.toLowerCase().includes(term.toLowerCase())
        const filteredChildren = item.children ? filterBySearch(item.children, term) : []

        if (matchesSearch || filteredChildren.length > 0) {
          return {
            ...item,
            children: filteredChildren,
          }
        }
        return null
      })
      .filter(Boolean) as Maintenance[]
  }

  const filterByStatus = (items: Maintenance[], status: string): Maintenance[] => {
    return items
      .map((item) => {
        const matchesStatus = item.status === status
        const filteredChildren = item.children ? filterByStatus(item.children, status) : []

        if (matchesStatus || filteredChildren.length > 0) {
          return {
            ...item,
            children: filteredChildren,
          }
        }
        return null
      })
      .filter(Boolean) as Maintenance[]
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delayed":
        return <Badge variant="destructive">지연</Badge>
      case "extension":
        return <Badge variant="outline">연장</Badge>
      case "normal":
        return <Badge variant="secondary">예정</Badge>
      case "complate":
        return <Badge variant="default">완료</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCycleText = (cycle?: number, cycleUnit?: string) => {
    if (!cycle || !cycleUnit) return ""
    return `${cycle} ${cycleUnit} 마다`
  }
  
  // Function to handle history button click
  const handleHistoryClick = (vesselNo: string, taskId: string) => {
    const taskIds : string[] = taskId.split('-');

    setSelectedTaskId(taskId)
    fetchMaintenanceWork(vesselNo, taskIds[0], taskIds[1], taskIds[2])
  }

  // Function to handle history item selection
  const handleHistoryItemClick = (historyItem: any) => {
    setSelectedHistoryItem(historyItem)
    setIsDetailHistoryDialogOpen(true)
  }

  const renderMaintenanceTree = (items: Maintenance[], level = 0) => {
    return items.map((item) => (
      <div key={item.id} className={`${level > 0 ? "ml-6" : ""}`}>
        <Collapsible open={expandedItems.has(item.id)} onOpenChange={() => toggleExpanded(item.id)}>
          <div className="flex items-center gap-2 p-3 border rounded-lg mb-2 bg-white hover:bg-gray-50">
            {item.children && item.children.length > 0 && (
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="p-0 h-auto" style={{cursor: 'pointer'}}>
                  {expandedItems.has(item.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            )}

            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {item.type === 'VESSEL' ? (
                    <Ship className="w-5 h-5" />
                  ) : (
                    item.type === "EQUIPMENT" || item.type === "SECTION" ? (
                      <FolderTree className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Wrench className="w-5 h-5 text-orange-600" />
                    )
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{`${item.name}`}</span>
                      <span className="text-sm text-gray-500">({item.id})</span>
                      {item.critical && (
                        <Badge variant="destructive" className="text-xs">
                          Critical
                        </Badge>
                      )}
                      {item.type === "TASK" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleHistoryClick(item.vessel_no, item.id)
                          }}
                          className="hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all"
                          title="작업 이력 조회"
                          style={{cursor: 'pointer'}}
                        >
                          <Calendar className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {item.type === "TASK" && (
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        {item.interval && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getCycleText(item.interval, item.interval_term)}
                          </span>
                        )}
                        {item.manager && <span>담당: {item.manager}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {item.type === "TASK" && item.lastest_date && (
                  <span className="text-sm text-gray-500">최근 정비: {item.lastest_date}</span>
                )}
                {item.type === "TASK" && item.due_date && (
                  <span className="text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-500">예정일: {item.due_date}</span>
                    </div>
                  </span>
                )}
                {item.status && getStatusBadge(item.status)}
              </div>
            </div>
          </div>

          {item.children && item.children.length > 0 && (
            <CollapsibleContent>
              <div className="ml-4 border-l-2 border-gray-200 pl-4">
                {renderMaintenanceTree(item.children, level + 1)}
              </div>
            </CollapsibleContent>
          )}
        </Collapsible>
      </div>
    ))
  }

  const totalTasks = (items: Maintenance[]): number => {
    return items.reduce((count, item) => {
      if (item.type === "TASK") count++
      if (item.children) count += totalTasks(item.children)
      return count
    }, 0)
  }

  const getTasksByStatus = (items: Maintenance[], status: string): number => {
    return items.reduce((count, item) => {
      if (item.type === "TASK" && item.status === status) count++
      if (item.children) count += getTasksByStatus(item.children, status)
      return count
    }, 0)
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
                <h1 className="text-3xl font-bold text-gray-900">정비 현황</h1>
                <p className="text-gray-600">전체 선박의 정비 현황을 관리하세요</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => (window.location.href = "/admin/calendar")} style={{cursor: 'pointer'}}>
                  <Calendar className="w-4 h-4 mr-2" />
                  작업 캘린더
                </Button>
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
                <div className="text-2xl font-bold">{totalTasks(maintenanceData)}</div>
                <p className="text-xs text-muted-foreground">등록된 작업</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">지연된 작업</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{getTasksByStatus(maintenanceData, "delayed")}</div>
                <p className="text-xs text-muted-foreground">즉시 조치 필요</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">예정된 작업</CardTitle>
                <Calendar className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{getTasksByStatus(maintenanceData, "normal")}</div>
                <p className="text-xs text-muted-foreground">예정된 작업</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">완료된 작업</CardTitle>
                <Settings className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{getTasksByStatus(maintenanceData, "complate")}</div>
                <p className="text-xs text-muted-foreground">완료된 작업</p>
              </CardContent>
            </Card>
          </div>

          {/* 필터 및 검색 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">필터 및 검색</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="작업명, 작업코드로 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select defaultValue={shipFilter} onValueChange={setShipFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 선박</SelectItem>
                    {vessels.map((vessel) => (
                      <SelectItem value={vessel.vessel_no}>{vessel.vessel_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select defaultValue={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 상태</SelectItem>
                    <SelectItem value="delayed">지연</SelectItem>
                    <SelectItem value="normal">예정</SelectItem>
                    <SelectItem value="extension">연장</SelectItem>
                    <SelectItem value="complate">완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* WBS 트리 구조 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5" />
                유지보수 작업 WBS
              </CardTitle>
              <CardDescription>계층적 구조로 관리되는 유지보수 작업 목록</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">{renderMaintenanceTree(filteredData)}</div>

              {filteredData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FolderTree className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>조건에 맞는 작업이 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Work History Dialog */}
          <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  작업 실적 이력 조회
                </DialogTitle>
                <DialogDescription>해당 작업의 정비 일정을 확인하고 상세 이력을 조회하세요</DialogDescription>
              </DialogHeader>
              <div className="max-h-96 overflow-y-auto">
                {(() => {
                  const historyData = selectedHistoryItems
                  if (!historyData || historyData.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>작업 이력이 없습니다.</p>
                        <p className="text-xs mt-2">Task ID: {selectedTaskId}</p>
                      </div>
                    )
                  }

                  return historyData.map((history) => (
                    <div
                      key={history.work_order}
                      className="p-4 border rounded-lg mb-3 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleHistoryItemClick(history)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{history.work_date}</span>
                          <Badge variant="default">완료</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <User className="w-3 h-3" />
                          {history.manager}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{history.work_details}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>작업시간: {history.work_hours} 시간</span>
                        {history.used_parts && (
                          <span>부품: {history.used_parts}</span>
                        )}
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </DialogContent>
          </Dialog>

          {/* Detailed History Dialog */}
          <Dialog open={isDetailHistoryDialogOpen} onOpenChange={setIsDetailHistoryDialogOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  정비 실적 상세 이력
                </DialogTitle>
                <DialogDescription>선택한 정비 작업의 상세 실적을 확인하세요</DialogDescription>
              </DialogHeader>
              {selectedHistoryItem && (
                <div className="space-y-6">
                  {/* 기본 정보 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">작업 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="equip_no">작업일자</Label>
                          <span className="text-sm font-medium text-gray-500">{selectedHistoryItem.work_date}</span>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="equip_no">담당자</Label>
                          <span className="text-sm font-medium text-gray-500">{selectedHistoryItem.manager}</span>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="equip_no">작업시간</Label>
                          <span className="text-sm font-medium text-gray-500">{selectedHistoryItem.work_hours}시간</span>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="equip_no">상태</Label>
                          <Badge variant="default">완료</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 작업 설명 */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">작업 설명</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500">{selectedHistoryItem.work_details}</p>
                    </CardContent>
                  </Card>

                  {/* 사용 부품 */}
                  {selectedHistoryItem.used_parts && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">사용 부품</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">{selectedHistoryItem.used_parts}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsDetailHistoryDialogOpen(false)} style={{cursor: 'pointer'}}>
                  닫기
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
