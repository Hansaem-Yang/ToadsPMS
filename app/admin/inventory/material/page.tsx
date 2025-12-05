"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { requireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/inventory/sidebar"
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
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Ship,
  Plus,
  Edit,
  Trash2,
  Upload,
  Download,
} from "lucide-react"
import * as XLSX from 'xlsx';
import { Vessel as VesselCode } from '@/types/common/vessel'; // ✅ interface import
import { Machine as MachinesCode } from '@/types/common/machine'; // ✅ interface import
import { Warehouse } from '@/types/common/warehouse'; // ✅ interface import
import { MaterialType } from '@/types/common/material_type'; // ✅ interface import
import { MaterialUnit } from '@/types/common/material_unit'; // ✅ interface import
import { Vessel } from '@/types/inventory/material/vessel'; // ✅ interface import
import { Material } from '@/types/inventory/material/material'; // ✅ interface import

export default function PartsManagementPage() {
  const initialMaterial: Material = {
    vessel_no: "",
    vessel_name: "",
    machine_name: "",
    material_code: "",
    material_name: "",
    material_group: "",
    material_spec: "",
    material_type: "",
    material_unit: "",
    drawing_no: "",
    standard_qty: 0,
    initial_stock: 0,
    receive_count: 0,
    release_count: 0,
    regist_date: "",
    regist_user: "",
    modify_date: "",
    modify_user: "",
    warehouse_no: "",
    warehouse_name: ""
  };

  interface ExcelData {
    [key: string]: any;
  }

  const [userInfo, setUserInfo] = useState<any>(null)
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([])
  const [materialUnits, setMaterialUnits] = useState<MaterialUnit[]>([])
  const [vessels, setVessels] = useState<Vessel[]>([])
  const [filteredData, setFilteredData] = useState<Vessel[]>(vessels)

  const [vesselCodes, setVesselCodes] = useState<VesselCode[]>([])
  const [selectedVessel, setSelectedVessel] = useState<string>("all")
  const [selectedMachine, setSelectedMachine] = useState<string>("all")
  
  const [insertedVessel, setInsertedVessel] = useState<string>("")
  const [insertedMachine, setInsertedMachine] = useState<string>("")

  const [addMaterial, setAddMaterial] = useState<Material>(initialMaterial)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const [editMaterial, setEditMaterial] = useState<Material>(initialMaterial)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  
  const [availableMachine, setAvailableMachine] = useState<MachinesCode[]>([])
  const [availableWarehouse, setAvailableWarehouse] = useState<Warehouse[]>([])
  const [availableInsertedMachine, setAvailableInsertedMachine] = useState<MachinesCode[]>([])
  const [excelData, setExcelData] = useState<ExcelData[]>([]);
  
  const fetchVesselCodes = () => {
    fetch(`/api/common/vessel/code`)
      .then(res => res.json())
      .then(data => setVesselCodes(data))
      .catch(err => console.error(err));
  };
  
  const fetchMaterialTypes = () => {
    fetch(`/api/common/material_type/code`)
      .then(res => res.json())
      .then(data => setMaterialTypes(data))
      .catch(err => console.error(err));
  };
  
  const fetchMaterialUnits = () => {
    fetch(`/api/common/material_unit/code`)
      .then(res => res.json())
      .then(data => setMaterialUnits(data))
      .catch(err => console.error(err));
  };
  
  const fetchMaterials = () => {
    fetch(`/api/admin/inventory/material`)
      .then(res => res.json())
      .then(data => setVessels(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    try {
      const user = requireAuth();
      setUserInfo(user);

      fetchVesselCodes();
      fetchMaterialTypes();
      fetchMaterialUnits();
      fetchMaterials();
    } catch (error) {
      // Redirect handled by requireAuth
    }
  }, [])
  
  useEffect(() => {
    let filtered = vessels

    if (selectedVessel === 'all' && selectedMachine === 'all') {
      setFilteredData(filtered)
      return;
    }

    if (selectedVessel) {
      const foundVessel = vesselCodes.find(vessel => vessel.vessel_no === selectedVessel);
      let machines: MachinesCode[] = [];
      if (foundVessel) 
        machines = foundVessel.machines;
      
      setAvailableMachine(machines);

      let warehouses: Warehouse[] = [];
      if (foundVessel) 
        warehouses = foundVessel.warehouses;
      
      setAvailableWarehouse(warehouses);
    }

    if (selectedVessel || selectedMachine) {
        filtered = filtered.map(vessel => {
          if (vessel.children.length > 0 && selectedMachine !== 'all') {
            const filteredItems = vessel.children.filter(material =>
              material.machine_name.includes(selectedMachine)
            );

            if (vessel.vessel_no.includes(selectedVessel) || filteredItems.length > 0) {
              return { ...vessel, children: filteredItems };
            }
            
            return null;
          }

          if (vessel.vessel_no.includes(selectedVessel)) {
            return vessel;
          }
          return null;
        })
        .filter((e) => e !== null);
    }

    setFilteredData(filtered)
  }, [vessels, selectedVessel, selectedMachine])

  useEffect(() => {
    if (insertedVessel) {
      const foundVessel = vesselCodes.find(vessel => vessel.vessel_no === insertedVessel);
      let machines: MachinesCode[] = [];
      if (insertedVessel && foundVessel) 
        machines = foundVessel.machines;
      
      setAvailableInsertedMachine(machines);

      let warehouses: Warehouse[] = [];
      if (insertedVessel && foundVessel) 
        warehouses = foundVessel.warehouses;
      
      setAvailableWarehouse(warehouses);
  }
  }, [insertedVessel])

  if (!userInfo) return null

  const addMaterials = (item: any) => {
    return vessels.map((vessel) => {
      if (vessel.vessel_no === item.vessel_no) {
        const updatedMaterials = [...vessel.children, item];
        return {...vessel, children: updatedMaterials }
      }

      return vessel;
    });
  }

  const handleInsertMaterial =  async () => {    
    const insertedData = {
      ...addMaterial,
      regist_user: userInfo.account_no,
      modify_user: userInfo.account_no,
    };

    const res = await fetch(`/api/admin/inventory/material/insert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(insertedData),
    });

    const result = await res.json();

    if (result.success) {
      alert("저장이 완료되었습니다.");

      setVessels(addMaterials({
        ...addMaterial,
        material_code: result.data.material_code
      }));

      setIsAddDialogOpen(false);
    } else {
      alert(result.message);
    }
  }

  const updateMaterials = (item: any) => {
    return vessels.map((vessel) => {
      if (vessel.vessel_no === item.vessel_no) {
        const updatedMaterials = vessel.children.map((material) => {
          if (material.material_code === item.material_code) {
            return { ...material,  
              vessel_no: item.vessel_no,
              machine_name: item.machine_name,
              material_code: item.material_code,
              material_name: item.material_name,
              material_unit: item.material_unit,
              warehouse_no: item.warehouse_no,
              warehouse_name: item.warehouse_name,
              standard_qty: item.standard_qty,
              initial_stock: item.initial_stock
            };
          }

          return material;
        });

        return {...vessel, children: updatedMaterials }
      }

      return vessel;
    });
  }

  const handleEditMaterial = (part: any) => {
    setInsertedVessel(part.vessel_no);
    setInsertedMachine(part.machine_name);

    setEditMaterial(part);
    setIsEditDialogOpen(true);
  }

  const handleUpdateMaterial = async () => {    
    const updatedData = {
      ...editMaterial,
      regist_user: userInfo.account_no,
      modify_user: userInfo.account_no,
    };

    const res = await fetch(`/api/admin/inventory/material/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });

    const data = await res.json();

    if (data.success) {
      alert("저장이 완료되었습니다.");

      setVessels(updateMaterials(editMaterial));
      setIsEditDialogOpen(false);
    } else {
      alert(data.message);
    }
  }

  const handleDeleteMaterial = async (vesselNo: string, materialNo: string) => {
    if (confirm("이 부품을 삭제하시겠습니까?")) {
      const deletedData = {
        vessel_no: vesselNo,
        material_no: materialNo
      };

      const res = await fetch(`/api/admin/inventory/material/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deletedData),
      });

      const data = await res.json();

      if (data.success) {
        alert("삭제가 완료되었습니다.");
      } else {
        alert(data.message);
      }
    }
  }
  
  const sendDataToServer = async (excelData: ExcelData[]) => {
    try {
      const sendData = {
        'registUser': userInfo.account_no,
        'modifyUser': userInfo.account_no,
        'excelData': excelData
      }

      const res = await fetch(`/api/admin/inventory/material/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sendData),
      });

      const data = await res.json();

      if (data.success) {
        alert('데이터가 성공적으로 전송되었습니다.');
        setIsUploadDialogOpen(false);

        fetchMaterials()
      } else {
        alert('데이터 전송 실패');
      }
    } catch (error) {
      alert(`네트워크 에러: ${error}`);
    }
  };
  
  const handleExcelUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const headerMapping = [
          "CallSign",
          "Machine", 
          "MaterialGroup", 
          "MaterialName", 
          "Type", 
          "Unit", 
          "Warehouse", 
          "DrawingNo", 
          "StandardQty", 
          "InitialStock"
        ]

        const jsonData: ExcelData[] = XLSX.utils.sheet_to_json(worksheet, {header: headerMapping});
        
        setExcelData(jsonData);
        
        // 서버로 데이터 전송
        sendDataToServer(jsonData);
      };
      
      reader.readAsArrayBuffer(file);
    }
        
    if (event.target) {
        event.target.value = '';
    }
  };

  const machineChanged = (mode: string, value: string) => {
    const foundMachine = availableInsertedMachine.find(machine => machine.machine_name === value)
    
    if (foundMachine) {
      if (mode === 'add') {
        setAddMaterial({ ...addMaterial, machine_name: foundMachine.machine_name })
      } else {
        setEditMaterial({ ...editMaterial, machine_name: foundMachine.machine_name })
      }
    }
    else {
      if (mode === 'add') {
        setAddMaterial({ ...addMaterial, machine_name: value })
      } else {
        setEditMaterial({ ...editMaterial, machine_name: value })
      }
    }
    
    setInsertedMachine(value)
  }

  const warehouseChanged = (mode: string, value: string) => {
    const foundWarehouse = availableWarehouse.find(warehouse => warehouse.warehouse_no === value)
    
    if (foundWarehouse) {
      if (mode === 'add') {
        setAddMaterial({ ...addMaterial, warehouse_no: foundWarehouse.warehouse_no, warehouse_name: foundWarehouse.warehouse_name })
      } else {
        setEditMaterial({ ...editMaterial, warehouse_no: foundWarehouse.warehouse_no, warehouse_name: foundWarehouse.warehouse_name })
      }
    }
    else {
      if (mode === 'add') {
        setAddMaterial({ ...addMaterial, warehouse_no: value })
      } else {
        setEditMaterial({ ...editMaterial, warehouse_no: value })
      }
    }
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Header userType={userInfo.user_auth} />
      <div className="flex">
        <Sidebar userType={userInfo.user_auth} />

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">부품 관리</h2>
                  <p className="text-gray-600">각 선박의 장비별 부품 정보를 관리합니다</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    <a href="/template/PMS Material Upload Template.xlsx">
                      템플릿 다운로드
                    </a>
                  </Button>
                  <Button onClick={() => setIsUploadDialogOpen(true)} variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    엑셀 업로드
                  </Button>
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
                          <Label htmlFor="vessel">선박</Label>
                          <Select 
                            value={insertedVessel} 
                            onValueChange={(value) => {
                              setAddMaterial((prev: any) => ({ ...prev, vessel_no: value }))
                              setInsertedVessel(value)
                            }}>
                            <SelectTrigger>
                              <SelectValue placeholder="선박을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                              {vesselCodes.map((vessel) => (
                                <SelectItem key={vessel.vessel_no} value={vessel.vessel_no}>
                                  {vessel.vessel_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="machine_name">장비</Label>
                          <Select 
                            value={insertedMachine}
                            onValueChange={(value) => { machineChanged('add', value) }}>
                            <SelectTrigger>
                              <SelectValue placeholder="장비를 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableInsertedMachine?.map((machine) => (
                                <SelectItem key={machine.machine_name} value={machine.machine_name}>
                                  {machine.machine_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="material_group">부품구분</Label>
                          <Input
                            id="material_group"
                            onChange={(e) => setAddMaterial((prev: any) => ({ ...prev, material_group: e.target.value }))}
                            placeholder="부품구분을 입력하세요"
                          />
                        </div>
                        <div>
                          <Label htmlFor="material_name">부품명 *</Label>
                          <Input
                            id="material_name"
                            onChange={(e) => setAddMaterial((prev: any) => ({ ...prev, material_name: e.target.value }))}
                            placeholder="부품명을 입력하세요"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="material_type">부품유형 *</Label>
                            <Select 
                              onValueChange={(value) => setAddMaterial((prev: any) => ({ ...prev, material_type: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="부품유형을 선택하세요" />
                              </SelectTrigger>
                              <SelectContent>
                                {materialTypes?.map((type) => (
                                  <SelectItem key={type.code} value={type.code}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="warehouse_no">창고 *</Label>
                            <Select
                              value={addMaterial.warehouse_no}
                              onValueChange={(value) => warehouseChanged('add', value) }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="창고를 선택하세요" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableWarehouse.map((warehouse) => (
                                  <SelectItem key={warehouse.warehouse_no} value={warehouse.warehouse_no}>
                                    {warehouse.warehouse_name} ({warehouse.warehouse_location})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="initial_stock">기초재고 *</Label>
                            <Input
                              id="initial_stock"
                              type="number"
                              onChange={(e) => setAddMaterial((prev: any) => ({ ...prev, initial_stock: e.target.value }))}
                              placeholder="기초 재고를 입력하세요"
                            />
                          </div>
                          <div>
                            <Label htmlFor="standard_qty">최소재고 *</Label>
                            <Input
                              id="standard_qty"
                              type="number"
                              onChange={(e) => setAddMaterial((prev: any) => ({ ...prev, standard_qty: e.target.value }))}
                              placeholder="최소 보유재고를 입력하세요"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="material_unit">단위 *</Label>
                            <Select 
                              onValueChange={(value) => setAddMaterial((prev: any) => ({ ...prev, material_unit: value }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="자재타입을 선택하세요" />
                              </SelectTrigger>
                              <SelectContent>
                                {materialUnits?.map((type) => (
                                  <SelectItem key={type.code} value={type.code}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="drawing_no">도면번호</Label>
                            <Input
                              id="drawing_no"
                              onChange={(e) => setAddMaterial((prev: any) => ({ ...prev, drawing_no: e.target.value }))}
                              placeholder="DWG No를 입력하세요"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} style={{cursor: 'pointer'}}>
                          취소
                        </Button>
                        <Button 
                          onClick={handleInsertMaterial}
                          disabled={!addMaterial?.vessel_no || 
                            !addMaterial?.machine_name || 
                            !addMaterial?.material_name || 
                            !addMaterial?.material_type || 
                            !addMaterial?.warehouse_no ||
                            !addMaterial?.material_unit ||
                            !addMaterial?.initial_stock ||
                            !addMaterial?.standard_qty}
                          style={{cursor: 'pointer'}}
                        >추가</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">필터 및 검색</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div>
                      <Select value={selectedVessel} onValueChange={setSelectedVessel}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="전체 선박" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">전체 선박</SelectItem>
                          {vesselCodes.map((vessel) => (
                            <SelectItem key={vessel.vessel_no} value={vessel.vessel_no}>
                              {vessel.vessel_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="전체 장비" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">전체 장비</SelectItem>
                          {availableMachine?.map((machine) => (
                            <SelectItem key={machine.machine_name} value={machine.machine_name}>
                              {machine.machine_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {filteredData.map((vessel) => (
              <Card key={vessel.vessel_no}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="w-5 h-5" />{vessel.vessel_name} 부품 목록 ({vessel.children.length}개)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3">장비</th>
                          <th className="text-left py-3">부품구분</th>
                          <th className="text-left py-3">부품명</th>
                          <th className="text-left py-3">부품코드</th>
                          <th className="text-left py-3">창고</th>
                          <th className="text-center py-3">단위</th>
                          <th className="text-center py-3">최소재고</th>
                          <th className="text-center py-3">기초재고</th>
                          <th className="text-center py-3">작업</th>
                        </tr>
                      </thead>
                      {vessel.children.length > 0 ? (
                        <tbody>
                          {vessel.children.map((material) => (
                            <tr key={material.material_code} className="border-b hover:bg-gray-50">
                              <td className="py-3">{material.machine_name}</td>
                              <td className="py-3 font-medium">{material.material_group}</td>
                              <td className="py-3 font-medium">{material.material_name}</td>
                              <td className="py-3 text-gray-600">{material.material_code}</td>
                              <td className="py-3 px-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  {material.warehouse_name}
                                </span>
                              </td>
                              <td className="py-3 text-center">{material.material_unit}</td>
                              <td className="py-3 text-center font-medium">{material.standard_qty}</td>
                              <td className="py-3 text-center font-medium">{material.initial_stock}</td>
                              <td className="py-3">
                                <div className="flex gap-2 justify-center">
                                  <Button size="sm" variant="outline" onClick={() => handleEditMaterial(material)} style={{cursor: 'pointer'}}>
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteMaterial(material.vessel_no, material.material_code)}
                                    className="text-red-600 hover:text-red-700"
                                    style={{cursor: 'pointer'}}
                                    disabled={material.release_count > 0 || material.receive_count > 0}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      ) : ''}
                    </table>
                  </div>
                  
                  {vessel.children.length  === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>검색 조건에 맞는 부품이 없습니다</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              ))}
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
                <Label htmlFor="edit_vessel">선박</Label>
                <Select 
                  value={editMaterial?.vessel_no} 
                  onValueChange={(value) => {
                    setEditMaterial((prev: any) => ({ ...prev, vessel_no: value }))
                    setInsertedVessel(value)
                  }}
                  disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="선박을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {vesselCodes.map((vessel) => (
                      <SelectItem key={vessel.vessel_no} value={vessel.vessel_no}>
                        {vessel.vessel_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_machine_name">장비</Label>
                <Select 
                  value={editMaterial?.machine_name}
                  onValueChange={(value) => { machineChanged('edit', value) }}
                  disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="장비를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableInsertedMachine?.map((machine) => (
                      <SelectItem key={machine.machine_name} value={machine.machine_name}>
                        {machine.machine_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_material_code">부품코드</Label>
                <Input
                  id="edit_material_code"
                  value={editMaterial?.material_code}
                  onChange={(e) => setEditMaterial((prev: any) => ({ ...prev, material_code: e.target.value }))}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="edit_material_group">부품구분</Label>
                <Input
                  id="edit_material_group"
                  value={editMaterial?.material_group}
                  onChange={(e) => setEditMaterial((prev: any) => ({ ...prev, material_group: e.target.value }))}
                  placeholder="부품구분을 입력하세요"
                />
              </div>
              <div>
                <Label htmlFor="edit_material_name">부품명</Label>
                <Input
                  id="edit_material_name"
                  value={editMaterial?.material_name}
                  onChange={(e) => setEditMaterial((prev: any) => ({ ...prev, material_name: e.target.value }))}
                  placeholder="부품명을 입력하세요"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_material_type">부품유형</Label>
                  <Select 
                    value={editMaterial?.material_type}
                    onValueChange={(value) => setEditMaterial((prev: any) => ({ ...prev, material_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="부품유형을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {materialTypes?.map((type) => (
                        <SelectItem key={type.code} value={type.code}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit_warehouse_no">창고 *</Label>
                  <Select
                    value={editMaterial.warehouse_no}
                    onValueChange={(value) => warehouseChanged('edit', value) }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="창고를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableWarehouse.map((warehouse) => (
                        <SelectItem key={warehouse.warehouse_no} value={warehouse.warehouse_no}>
                          {warehouse.warehouse_name} ({warehouse.warehouse_location})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_initial_stock">기초 재고</Label>
                  <Input
                    id="edit_initial_stock"
                    type="number"
                    value={editMaterial.initial_stock}
                    onChange={(e) => setEditMaterial((prev: any) => ({ ...prev, initial_stock: e.target.value }))}
                    placeholder="기초 재고를 입력하세요"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_standard_qty">최소재고</Label>
                  <Input
                    id="edit_standard_qty"
                    type="number"
                    value={editMaterial.standard_qty}
                    onChange={(e) => setEditMaterial((prev: any) => ({ ...prev, standard_qty: e.target.value }))}
                    placeholder="최소 보유재고를 입력하세요"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit_material_unit">단위</Label>
                  <Select 
                    value={editMaterial?.material_unit}
                    onValueChange={(value) => setEditMaterial((prev: any) => ({ ...prev, material_unit: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="단위을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {materialUnits?.map((type) => (
                        <SelectItem key={type.code} value={type.code}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit_drawing_no">도면번호</Label>
                  <Input
                    id="edit_drawing_no"
                    value={editMaterial?.drawing_no}
                    onChange={(e) => setEditMaterial((prev: any) => ({ ...prev, drawing_no: e.target.value }))}
                    placeholder="DWG No를 입력하세요"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} style={{cursor: 'pointer'}}>
                취소
              </Button>
              <Button 
                onClick={handleUpdateMaterial}
                disabled={!editMaterial?.vessel_no || 
                  !editMaterial?.machine_name || 
                  !editMaterial?.material_name || 
                  !editMaterial?.material_type || 
                  !editMaterial?.warehouse_no ||
                  !editMaterial?.material_unit ||
                  !editMaterial?.initial_stock ||
                  !editMaterial?.standard_qty}
                style={{cursor: 'pointer'}}
              >수정</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>엑셀 파일 업로드</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>• 먼저 템플릿을 다운로드하여 양식에 맞게 작성해주세요.</p>
                <p>• 엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.</p>
                <p>• 기존 부품 정보와 중복되는 내용은 업데이트됩니다.</p>
              </div>
              <div>
                <Label>파일 선택</Label>
                <Input type="file" accept=".xlsx,.xls" onChange={handleExcelUpload} className="cursor-pointer" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                취소
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
