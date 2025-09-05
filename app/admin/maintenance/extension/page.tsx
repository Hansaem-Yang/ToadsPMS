"use client"

import { useEffect, useState } from "react"
import { requireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Card, CardContent,  CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Search,
  Calendar,
  Settings,
  Ship,
  FolderTree,
  FileText,
  
} from "lucide-react"
import { Vessel } from '@/types/extension/vessel'; 
import { Equipment } from '@/types/extension/equipment';
import { MaintenanceExtension } from '@/types/extension/maintenance_extension'; // ✅ interface import

export default function MaintenanceWorkManagementPage() {
  const [userInfo, setUserInfo] = useState<any>(null)
  const [vessels, setVessels] = useState<Vessel[]>([])
  const [filteredData, setFilteredData] = useState<Vessel[]>(vessels)
  const [searchTerm, setSearchTerm] = useState("")
  const [shipFilter, setShipFilter] = useState("ALL")
  const [selectedExtension, setSelectedExtension] = useState<MaintenanceExtension>()
  const [isApprovalReasonDialogOpen, setIsApprovalReasonDialogOpen] = useState(false)
  
  const [selectedApprovals, setSelectedApprovals] = useState<string[]>([])

  const fetchVessels = () => {
    fetch(`/api/admin/maintenance/extension`)
      .then(res => res.json())
      .then(data => setVessels(data))
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
    let filtered = vessels

    if (shipFilter !== "ALL") {
      filtered = filtered.filter((item) => item.vessel_no === shipFilter)
    }

    if (searchTerm) {
      const lowerKeyword = searchTerm.toLowerCase();

      filtered = filtered.map(vessel => {
        const filteredEquipments = vessel.children.map(equipment => {
            const filteredItems = equipment.children.filter(plan =>
              plan.section_name.toLowerCase().includes(lowerKeyword) || 
              plan.plan_name.toLowerCase().includes(lowerKeyword)
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
      // { key: "select", label: " ", align: "text-center" },
      { key: "code", label: "No", align: "text-center" },
      { key: "section", label: "Section", align: "text-center" },
      { key: "maintenance", label: "Maintenance", align: "text-center" },
      { key: "request_date", label: "Request Date", align: "text-center" },
      { key: "applicant", label: "Applicant", align: "text-center" },
      { key: "due_date", label: "Due Date", align: "text-center" },
      { key: "extension_date", label: "Extension Date", align: "text-center" },
      { key: "extension_reason", label: "Extension Reason", align: "text-center" },
      { key: "approval_date", label: "Approval Date", align: "text-center" },
      { key: "approver", label: "Approver", align: "text-center" },
      { key: "approval_status", label: "Status", align: "text-center" },
      { key: "approval", label: "", align: "text-center" },
    )

    return headers
  }

  const getTableCells = (item: any, index: number) => {
    const cells = []

    cells.push(
      // <td key="select" className="py-3 text-gray-500 text-center">
      //   <Checkbox
      //     id={`${item.vessel_no}-${item.equip_no}-${item.section_code}-${item.plan_code}`}
      //     checked={selectedApprovals.includes(`${item.vessel_no}-${item.equip_no}-${item.section_code}-${item.plan_code}`)}
      //     onCheckedChange={() => handleTaskSelection(`${item.vessel_no}-${item.equip_no}-${item.section_code}-${item.plan_code}`, item)}
      //     disabled={item.approval_status === "APPROVAL"}
      //     className="mt-1"
      //   />
      // </td>,
      <td key="code" className="py-3 text-gray-500 text-center">
        {`${item.equip_no}-${item.section_code}-${item.plan_code}`}
      </td>,
      <td key="section" className="py-3 text-gray-500">
        {item.section_name}
      </td>,
      <td key="maintenance" className="py-3 text-gray-500">
        {item.plan_name}
      </td>,
      <td key="request_date" className="py-3 text-center text-gray-500">
        {item.request_date}
      </td>,
      <td key="applicant" className="py-3 text-center text-gray-500">
        {item.applicant_name}
      </td>,
      <td key="due_date" className="py-3 text-center text-gray-500">
        {item.due_date}
      </td>,
      <td key="extension_date" className="py-3 text-center text-gray-500">
        {item.extension_date}
      </td>,
      <td key="extension_reason" className="py-3 text-gray-500">
        {item.extension_reason}
      </td>,
      <td key="approval_date" className="py-3 text-center text-gray-500">
        {item.approval_date}
      </td>,
      <td key="approver" className="py-3 text-center text-gray-500">
        {item.approver_name}
      </td>,
      <td key="approval_status" className="py-3 text-center text-gray-500">
        {item.approval_status}
      </td>,
      <td key="approval_status" className="py-3 text-center text-gray-500">
        {item.approval_status === 'REQUEST' && (
          <div>
            <Button onClick={() => handleApprovalOrRejectClick(item, "APPROVAL")} size="sm" className="ml-4" style={{cursor: 'pointer'}}>
              승인
            </Button>
            <Button onClick={() => handleApprovalOrRejectClick(item, "REJECT")} size="sm" className="ml-4" style={{cursor: 'pointer'}}>
              반려
            </Button>
          </div>
        )}
      </td>,
    )

    return cells
  }

  const handleTaskSelection = (taskId: string, task: any) => {
    setSelectedApprovals((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId)
      } else {
        return [...prev, taskId]
      }
    })
  }

  const handleSelectAll = (eq: Equipment) => {
    const allTaskIds = eq.children.filter((task) => task.approval_status !== "COMPLATE").map((task) => `${task.vessel_no}-${task.equip_no}-${task.section_code}-${task.plan_code}`)

    if (selectedApprovals.length === allTaskIds.length) {
      setSelectedApprovals([])
    } else {
      setSelectedApprovals(allTaskIds)
    }
  }

  // const handleBulkExtension = () => {

  //   const tasksToExtension = filteredData.flatMap(vessel => 
  //     vessel.children.flatMap(equipment => 
  //       equipment.children.filter(tplan =>
  //         selectedApprovals.includes(`${tplan.vessel_no}-${tplan.equip_no}-${tplan.section_code}-${tplan.plan_code}`)
  //       ).map((plan) => ({
  //         ...plan,
  //         vessel_no: plan.vessel_no, 
  //         vessel_name: plan.vessel_name, 
  //         imo_no: plan.imo_no, 
  //         equip_no: plan.equip_no, 
  //         equip_name: plan.equip_name, 
  //         category: plan.category, 
  //         section_code: plan.section_code, 
  //         section_name: plan.section_name, 
  //         plan_code: plan.plan_code, 
  //         plan_name: plan.plan_name, 
  //         extension_seq: plan.extension_seq, 
  //         extension_date: plan.extension_date, 
  //         extension_reason: plan.extension_reason, 
  //         request_date: plan.request_date, 
  //         applicant: plan.applicant, 
  //         applicant_name: plan.applicant_name, 
  //         approval_status: plan.approval_status, 
  //         approver: plan.approver, 
  //         approver_name: plan.approver_name, 
  //         lastest_date: plan.lastest_date, 
  //         due_date: plan.due_date, 
  //         regist_user: userInfo.account_no,
  //         modify_user: userInfo.account_no,
  //       }))
  //     )
  //   )

  //   setBulkExtensionData({
  //     tasks: tasksToExtension,
  //   })
  //   setIsBulkExtensionDialogOpen(true)
  // }

  const updateExtensions = (item: any) => {
    return vessels.map((vessel) => {
      if (vessel.vessel_no === item.vessel_no) {
        const updatedEquipment = vessel.children.map((eq) => {
          if (eq.equip_no === item.equip_no) {
            const updatedExtension = eq.children.map((plan) => {
              if (plan.section_code === item.section_code && plan.plan_code === item.plan_code && plan.extension_seq === item.extension_seq) {
                return { ...plan,  
                  vessel_no: item.vessel_no,
                  vessel_name: item.vessel_name,
                  imo_no: item.imo_no,
                  equip_no: item.equip_no,
                  equip_name: item.equip_name,
                  category: item.category,
                  section_code: item.section_code,
                  section_name: item.section_name,
                  plan_code: item.plan_code,
                  plan_name: item.plan_name,
                  extension_seq: item.extension_seq,
                  extension_date: item.extension_date,
                  extension_reason: item.extension_reason,
                  request_date: item.request_date,
                  applicant: item.applicant,
                  applicant_name: item.applicant_name,
                  approval_status: item.approval_status,
                  approver: item.approver,
                  approver_name: item.approver_name,
                  lastest_date: item.lastest_date,
                  due_date: item.due_date,
                  regist_date: item.regist_date,
                  regist_user: item.regist_user,
                  modify_date: item.modify_date,
                  modify_user: item.modify_user,
                };
              }

              return plan;
            });

            return {...eq, children: updatedExtension }
          }

          return eq;
        });

        return {...vessel, children: updatedEquipment }
      }

      return vessel;
    });
  }

  const handleApprovalOrRejectClick = (item: MaintenanceExtension, status: string) => {
    const updatedData = {
      ...item,
      approver: userInfo.account_no,
      approval_status: status,
      regist_user: userInfo.account_no,
      modify_user: userInfo.account_no,
    };

    setSelectedExtension(updatedData);
    setIsApprovalReasonDialogOpen(true);
  }

  const handleApprovalExtension = async () => {
    const res = await fetch('/api/admin/maintenance/extension/approval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedExtension),
    });

    if (res.ok) {
      if (selectedExtension?.approval_status === 'APPROVAL')
        alert(`연장 요청이 승인 되었습니다.`);
      else
        alert(`연장 요청이 반려 되었습니다.`);
    }

    fetchVessels();

    setIsApprovalReasonDialogOpen(false);
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
                <h1 className="text-3xl font-bold text-gray-900">정비 연장 신청 현황</h1>
                <p className="text-gray-600">전체 선박의 정비에 대한 연장 신청 현황을 조회하세요</p>
              </div>
              <div className="flex gap-2">
                {/* {selectedApprovals.length > 0 && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{selectedApprovals.length}개 작업 선택됨</span>
                    <Button onClick={handleBulkExtension} className="bg-blue-600 hover:bg-blue-700" style={{cursor: 'pointer'}}>
                      <Plus className="w-4 h-4 mr-2" />
                      일괄 실행 등록
                    </Button>
                  </div>
                )} */}
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
                <Select defaultValue={shipFilter} onValueChange={setShipFilter}>
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
                  <div className="space-y-2">
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
                                  {getTableHeaders().map((header) => {
                                    if (header.label === "CheckBox") {
                                      return (
                                        <th key={header.key} className={`${header.align} py-2`}>
                                          <Checkbox
                                            id="select-all"
                                            checked={
                                              selectedApprovals.length > 0 &&
                                              selectedApprovals.length === eq.children.filter((task) => task.approval_status !== "APPROVAL").length
                                            }
                                            onCheckedChange={(e) => {
                                              {handleSelectAll(eq)}
                                            }}
                                          />
                                        </th>
                                      )
                                    } else {
                                      return (
                                        <th key={header.key} className={`${header.align} py-2`}>
                                          {header.label}
                                        </th>
                                      )
                                    }
                                  })}
                                </tr>
                              </thead>
                              <tbody>
                                {eq.children.map((item, index) => (
                                  <tr 
                                    key={`${item.vessel_no}-${item.equip_no}-${item.section_code}-${item.plan_code}`} 
                                    className="border-b hover:bg-gray-50"
                                    onClick={(e) => {
                                      e.stopPropagation()
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

          {/* Detailed History Dialog */}
          <Dialog open={isApprovalReasonDialogOpen} onOpenChange={setIsApprovalReasonDialogOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  정비 연장 신청 승인 및 반려 사유
                </DialogTitle>
                <DialogDescription>선택한 정비 연장 신청의 승인 및 반려 사유를 입력하세요</DialogDescription>
              </DialogHeader>
              {selectedExtension && (
                <div className="space-y-6">
                  {/* 기본 정보 */}
                  <div className="grid grid-cols-1 gap-1">
                    <div className="space-y-2">
                      <Textarea 
                        id="approval_reason" 
                        placeholder="승인 및 반려 사유를 입력하세요" 
                        defaultValue={selectedExtension.approval_reason}
                        onChange={(e) => setSelectedExtension((prev: any) => ({ ...prev, approval_reason: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsApprovalReasonDialogOpen(false)} style={{cursor: 'pointer'}}>
                  취소
                </Button>
                <Button 
                  onClick={handleApprovalExtension}
                  disabled={!selectedExtension?.vessel_no || 
                    !selectedExtension?.equip_no || 
                    !selectedExtension?.section_code || 
                    !selectedExtension?.plan_code ||
                    !selectedExtension?.extension_seq ||
                    !selectedExtension?.approval_reason}
                  style={{cursor: 'pointer'}}
                >확인</Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
