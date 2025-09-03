"use client"

import { useEffect, useState } from "react"
import { vesselRequireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  User,
  Search,
  Calendar,
  Settings,
  FolderTree,
  History,
} from "lucide-react"
import { Vessel } from '@/types/performance/vessel'; 
import { MaintenanceWork } from '@/types/vessel/maintenance_work'; // ✅ interface import

export default function MaintenanceWorkManagementPage() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [vessels, setVessels] = useState<Vessel[]>([])
  const [filteredData, setFilteredData] = useState<Vessel[]>(vessels)
  const [searchTerm, setSearchTerm] = useState("")
  
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [selectedHistoryItems, setSelectedHistoryItems] = useState<MaintenanceWork[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string>("")

  const fetchVessels = (vesselNo: string) => {
    fetch(`/api/ship/maintenance/performance?vesselNo=${vesselNo}`)
      .then(res => res.json())
      .then(data => setVessels(data))
      .catch(err => console.error(err));
  };
  
  const fetchMaintenanceWorks = (vesselNo: string, equipNo: string, sectionCode: string, planCode: string) => {
    fetch(`/api/ship/maintenance/work?vesselNo=${vesselNo}&equipNo=${equipNo}&sectionCode=${sectionCode}&planCode=${planCode}`)
      .then(res => res.json())
      .then(data => {
        setSelectedHistoryItems(data)
        setIsHistoryDialogOpen(true)
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    try {
      const user = vesselRequireAuth();
      setUserInfo(user);

      fetchVessels(user.ship_no);
    } catch (error) {
      // Redirect handled by requireAuth
    }
  }, [])

  useEffect(() => {
    let filtered = vessels

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
  }, [vessels, searchTerm])

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
      <td key="code" className="py-3 text-gray-500">
        {`${item.equip_no}-${item.section_code}-${item.plan_code}`}
      </td>,
      <td key="section" className="py-3 font-bold text-gray-500">
        {item.section_name}
      </td>,
      <td key="maintenance" className="py-3 font-bold text-gray-500">
        {item.plan_name}
      </td>,
      <td key="interval" className="py-3 text-center font-bold text-gray-500">
        {`${item.interval} ${item.interval_term}`}
      </td>,
      <td key="last_date" className="py-3 text-center font-bold text-gray-500">
        {item.last_date}
      </td>,
      <td key="due_date" className="py-3 text-center">
        {item.due_date}
      </td>
    )

    let count = 0;
    {item.children.map((work: string) => {
      count = count + 1
      
      return (
        cells.push(
          <td key={`work_date_${count}`} className="py-3 text-center">
            {work}
          </td>
        )
      )
    })}

    for (let i = count + 1; i <= 5; i++) {
      cells.push(
        <td key={`work_date_${i}`} className="py-3 text-center"></td>
      )
    }

    return cells
  }
  
  // Function to handle history button click
  const handleHistoryClick = (task: any) => {
    setSelectedTaskId(`${task.equip_no}-${task.section_code}-${task.plan_code}`)
    fetchMaintenanceWorks(task.vessel_no, task.equip_no, task.section_code, task.plan_code)
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
                <h1 className="text-3xl font-bold text-gray-900">{userInfo.ship_name} - 정비 실적 현황</h1>
                <p className="text-gray-600">{userInfo.ship_no} 선박의 정비 실적 현황을 조회하세요</p>
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
              </div>
            </CardContent>
          </Card>

          {/* WBS 트리 구조 */}
          <Card>
            <CardContent>
              <div className="space-y-4">
                {filteredData.map(vessel => (
                  <div className="space-y-2">
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
                                    className="border-b hover:bg-gray-50 cursor-pointer"
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
            <DialogContent className="sm:max-w-[820px] max-h-[620px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  작업 실적 이력 조회
                </DialogTitle>
                <DialogDescription>해당 작업의 정비 이력을 확인하세요</DialogDescription>
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
                      className="p-4 border rounded-lg mb-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 min-w-[130px]">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{history.work_date}</span>&nbsp;
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span>정비내용: {history.work_details}</span>
                          </div>
                          {history.delay_reason && (
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>지연사유: {history.delay_reason} 시간</span>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>작업시간: {history.work_hours} 시간</span>
                            {history.used_parts && (
                              <span>부품: {history.used_parts}</span>
                            )}
                            {history.manager && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {history.manager}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
