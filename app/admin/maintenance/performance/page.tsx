"use client"

import { useEffect, useState } from "react"
import { requireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent,  CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  User,
  Search,
  Calendar,
  Settings,
  Ship,
  FolderTree,
  History,
  FileText,
} from "lucide-react"
import { Vessel } from '@/types/performance/vessel'; 
import { Machine } from '@/types/vessel/machine';
import { Equipment } from '@/types/vessel/equipment';
import { Section } from '@/types/vessel/section';
import { MaintenanceWork } from '@/types/vessel/maintenance_work'; // ✅ interface import

export default function MaintenanceWorkManagementPage() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [vessels, setVessels] = useState<Vessel[]>([])
  const [filteredData, setFilteredData] = useState<Vessel[]>(vessels)
  const [machines, setMachines] = useState<Machine[]>([])
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [equipmentFilteredData, setEquipmentFilteredData] = useState<Equipment[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [sectionFilteredData, setSectionFilteredData] = useState<Section[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [shipFilter, setShipFilter] = useState("ALL")
  const [machineFilter, setMachineFilter] = useState("ALL")
  const [equipmentFilter, setEquipmentFilter] = useState("ALL")
  const [sectionFilter, setSectionFilter] = useState("ALL")
  
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [isDetailHistoryDialogOpen, setIsDetailHistoryDialogOpen] = useState(false)
  const [selectedHistoryItems, setSelectedHistoryItems] = useState<MaintenanceWork[]>([])
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string>("")

  const fetchVessels = () => {
    fetch(`/api/admin/maintenance/performance`)
      .then(res => res.json())
      .then(data => setVessels(data))
      .catch(err => console.error(err));
  };

  const fetchMachines = (vesselNo: string) => {
    fetch(`/api/admin/ships/${vesselNo}/machine/code?vesselNo=${vesselNo}`)
      .then(res => res.json())
      .then(data => setMachines(data))
      .catch(err => console.error(err));
  };

  const fetchEquipments = (vesselNo: string) => {
    fetch(`/api/admin/ships/${vesselNo}/equipment/code?vesselNo=${vesselNo}`)
      .then(res => res.json())
      .then(data => setEquipments(data))
      .catch(err => console.error(err));
  };

  const fetchSections = (vesselNo: string) => {
    fetch(`/api/admin/ships/${vesselNo}/section/code?vesselNo=${vesselNo}`)
      .then(res => res.json())
      .then(data => setSections(data))
      .catch(err => console.error(err));
  };
  
  const fetchMaintenanceWorks = (vesselNo: string, equipNo: string, sectionCode: string, planCode: string) => {
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
    } catch (error) {
      // Redirect handled by requireAuth
    }
  }, [])

  useEffect(() => {
    fetchMachines(shipFilter);
    fetchEquipments(shipFilter);
    fetchSections(shipFilter);
  }, [shipFilter])
  
  useEffect(() => {
    let sectionFiltered = sections

    if (machineFilter !== "ALL") {
      sectionFiltered = sectionFiltered.filter((item) => item.vessel_no === shipFilter && item.machine_name === machineFilter)
    }

    setSectionFilteredData(sectionFiltered)
  }, [equipments, shipFilter, machineFilter])
  
  useEffect(() => {
    let sectionFiltered = sections

    if (machineFilter !== "ALL") {
      sectionFiltered = sectionFiltered.filter((item) => item.vessel_no === shipFilter && item.machine_name === machineFilter&& item.equip_no === equipmentFilter)
    }

    setSectionFilteredData(sectionFiltered)
  }, [sections, shipFilter, equipmentFilter, machineFilter])

  useEffect(() => {
    let filtered = vessels

    if (shipFilter !== "ALL") {
      filtered = filtered.filter((item) => item.vessel_no === shipFilter)
    }

    if (searchTerm) {
      const lowerKeyword = searchTerm.toLowerCase();

      filtered = filtered.map(vessel => {
        const filteredEquipments = vessel.children.map(equipment => {
            const filteredItems = equipment.children.filter(plan =>
              plan.section_name.toLowerCase().includes(lowerKeyword) || plan.plan_name.toLowerCase().includes(lowerKeyword)
            );

            return { ...equipment, children: filteredItems };
          })
          .filter(equipment => {
            return (
              equipment.equip_name.toLowerCase().includes(lowerKeyword) || equipment.children.length > 0
            );
          });

        if (vessel.vessel_name.toLowerCase().includes(lowerKeyword) || filteredEquipments.length > 0) {
          return { ...vessel, children: filteredEquipments };
        }

        return null;
      })
      .filter((e) => e !== null);
    }

    setFilteredData(filtered)
  }, [vessels, searchTerm, shipFilter])

  if (!userInfo) return null

  const truncateString = (str: string, maxLength: number): string  =>{
    if (str.length > maxLength) {
      return str.slice(0, maxLength) + '...';
    }
    return str;
  }
  
  const getTableHeaders = () => {
    const headers = []
    headers.push(
      { key: "code", label: "No", align: "text-center" },
      { key: "section", label: "Section", align: "text-center" },
      { key: "maintenance", label: "Maintenance", align: "text-center" },
      { key: "interval", label: "Interval", align: "text-center" },
      { key: "last_date", label: "Last Date", align: "text-center" },
      { key: "due_date", label: "Due Date", align: "text-center" }
    )

    for(let i = 0; i < 5; i++) {
      headers.push({ key: `work_date_${i}`, label: "Work Ddata", align: "text-center" })
    }
    return headers
  }

  const getTableCells = (item: any, index: number) => {
    const cells = []

    cells.push(
      <td key="code" width="120px;" className="py-3 text-gray-500 text-center">
        {`${item.equip_no}-${item.section_code}-${item.plan_code}`}
      </td>,
      <td key="section" width="320px;" className="py-3 text-gray-500">
        {item.section_name}
      </td>,
      <td key="maintenance" className="py-3 text-gray-500">
        {item.plan_name}
      </td>,
      <td key="interval" width="100px;" className="py-3 text-center text-gray-500">
        {`${item.interval} ${item.interval_term}`}
      </td>,
      <td key="lastest_date" width="120px;" className="py-3 text-center text-gray-500">
        {item.lastest_date}
      </td>,
      <td key="due_date" width="120px;" className="py-3 text-center text-gray-500">
        {item.due_date}
      </td>
    )

    let count = 0;
    {item.children.map((work: string) => {
      count = count + 1
      
      return (
        cells.push(
          <td key={`work_date_${count}`} width="120px;" className="py-3 text-center text-gray-500">
            {work}
          </td>
        )
      )
    })}

    for (let i = count + 1; i <= 5; i++) {
      cells.push(
        <td key={`work_date_${i}`} width="120px;" className="py-3 text-center text-gray-500"></td>
      )
    }

    return cells
  }
  
  // Function to handle history button click
  const handleHistoryClick = (task: any) => {
    setSelectedTaskId(`${task.equip_no}-${task.section_code}-${task.plan_code}`)
    fetchMaintenanceWorks(task.vessel_no, task.equip_no, task.section_code, task.plan_code)
  }

  // Function to handle history item selection
  const handleHistoryItemClick = (historyItem: any) => {
    setSelectedHistoryItem(historyItem)
    setIsDetailHistoryDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userType={userInfo.user_auth} />
      <div className="flex">
        <Sidebar userType={userInfo.user_auth} />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">정비 실적 현황</h1>
                <p className="text-gray-600">전체 선박의 정비 실적 현황을 조회하세요</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => (window.location.href = "/admin/calendar")} style={{cursor: 'pointer'}}>
                  <Calendar className="w-4 h-4 mr-2" />
                  작업 캘린더
                </Button>
              </div>
            </div>
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
                <Select value={shipFilter} onValueChange={setShipFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">전체 선박</SelectItem>
                    {vessels.map((vessel) => (
                      <SelectItem key={vessel.vessel_no} value={vessel.vessel_no}>{vessel.vessel_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* WBS 트리 구조 */}
          <Card>
            <CardContent>
              <div className="space-y-4">
                {filteredData.map(vessel => (
                  <div key={vessel.vessel_no} className="space-y-2">
                    <div className="flex items-center gap-2 text-xl font-bold text-gray-600">
                      <Ship className="w-5 h-5" />{vessel.vessel_name}
                    </div>
                    {vessel.children.map((eq) => (
                      <Card key={`${eq.vessel_no}-${eq.equip_no}`}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Settings className="w-5 h-5" />{eq.equip_name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  {getTableHeaders().map((header) => (
                                    <th key={header.key} className={`${header.align} py-2`}>
                                      {header.label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {eq.children.map((item, index) => (
                                  <tr 
                                    key={`${item.vessel_no}-${item.equip_no}-${item.section_code}-${item.plan_code}`} 
                                    className="border-b hover:bg-gray-50"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleHistoryClick(item)
                                    }}
                                  >
                                    {getTableCells(item, index)}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ))}
              </div>

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
                        {history.used_parts && history.used_parts.length > 0 && (
                          <span>부품: {history.used_parts[0].material_name} {history.used_parts.length > 1 ? `외 ${history.used_parts.length - 1} 건` : '' }</span>
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
