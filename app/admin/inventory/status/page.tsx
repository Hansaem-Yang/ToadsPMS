"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/inventory/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Ship, AlertTriangle } from "lucide-react"
import { Vessel } from '@/types/inventory/status/vessel'; // ✅ interface import
import { Inventory } from '@/types/inventory/status/inventory'; // ✅ interface import


export default function InventoryStatusPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<any>(null);  
  const [daily, setDaily] = useState<Vessel[]>([]);
  const [weekly, setWeekly] = useState<Vessel[]>([]);
  const [monthly, setMonthly] = useState<Vessel[]>([]);
  const [inventoryData, setInventoryData] = useState<Vessel[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly">("daily")

  const fetchInventory = () => {
    fetch(`/api/admin/inventory/status/${selectedPeriod}`)
      .then(res => res.json())
      .then(data => {
        switch(selectedPeriod) {
          case 'daily':
            setDaily(data);
            break;
          case 'weekly':
            setWeekly(data);
            break;
          case 'monthly':
            setMonthly(data);
            break;
        }
        setInventoryData(data);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    try {
      const user = requireAuth();
      setUserInfo(user);
      
      fetchInventory();
    } catch (error) {
      // Redirect handled by requireAuth
    }
  }, [])

  useEffect(() => {
    try {
      switch(selectedPeriod) {
        case 'daily':
          if (daily.length === 0) {
            fetchInventory();
          }
          else {
            setInventoryData(daily);
          }
          break;
        case 'weekly':
          if (weekly.length === 0) {
            fetchInventory();
          }
          else {
            setInventoryData(weekly);
          }
          break;
        case 'monthly':
          if (monthly.length === 0) {
            fetchInventory();
          }
          else {
            setInventoryData(monthly);
          }
          break;
      }
    } catch (error) {
      // Redirect handled by requireAuth
    }
  }, [selectedPeriod])

  if (!userInfo) return null

  const handleShortageClick = () => {
    router.push("/admin/inventory/shortage")
  }

  const handleLossClick = () => {
    router.push("/admin/inventory/loss")
  }

  const totalShortage = (items: Inventory[]): number => {
    return items.reduce((total, item) => {
      total += item.stock_qty < item.standard_qty ? item.standard_qty - item.stock_qty : 0;

      return total;
    }, 0)
  }
  
  const totalLoss = (items: Inventory[]): number => {
    return items.reduce((total, item) => {
      total += item.loss_qty;

      return total;
    }, 0)
  }
  
  let shortageCount = 0;
  let lossCount = 0;
  if(inventoryData.length > 0) {
    shortageCount = inventoryData.reduce((sum, vessel) => sum + totalShortage(vessel.children), 0)
    lossCount = inventoryData.reduce((sum, vessel) => sum + totalLoss(vessel.children), 0)
  }

  const getTableHeaders = () => {
    const headers = []
    headers.push(
      { key: "machine_name", label: "장비", align: "text-left" },
      { key: "material_code", label: "부품코드", align: "text-left" },
      { key: "receive_qty", label: "입고", align: "text-center" },
      { key: "release_qty", label: "출고", align: "text-center" },
      { key: "loss_qty", label: "손망실", align: "text-center" },
      { key: "stock_qty", label: "재고", align: "text-center" },
      { key: "material_unit", label: "단위", align: "text-center" },
      { key: "period", label: "기간", align: "text-center" },
    )
    return headers
  }

  const getTableCells = (item: any, index: number) => {
    const cells = []

    cells.push(
      <td key="machine_name" className="py-3 text-gray-600">
        {item.machine_name}
      </td>,
      <td key="material_code" className="py-3 text-gray-600">
        {item.material_code}
      </td>,
      <td key="receive_qty" className="py-3 text-center font-bold text-green-600">
        +{item.receive_qty}
      </td>,
      <td key="release_qty" className="py-3 text-center font-bold text-red-600">
        -{item.release_qty}
      </td>,
      <td key="loss_qty" className="py-3 text-center font-bold text-orange-600">
        -{item.loss_qty}
      </td>,
      <td key="stock_qty" className="py-3 text-center font-bold text-blue-600">
        {item.stock_qty}
      </td>,
      <td key="material_unit" className="py-3 text-center">
        {item.material_unit}
      </td>,
      <td key="period" className="py-3 text-center">
        {item.period}
      </td>,
    )

    return cells
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
                  <h2 className="text-2xl font-bold text-gray-900">재고 현황</h2>
                  <p className="text-gray-600">선박별, 장비별, 부품별 재고 현황을 확인합니다</p>
                </div>
                <div className="flex gap-2">
                  <Select
                    value={selectedPeriod}
                    onValueChange={(value: "daily" | "weekly" | "monthly") => setSelectedPeriod(value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">일일</SelectItem>
                      <SelectItem value="weekly">주간</SelectItem>
                      <SelectItem value="monthly">월간</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow border-red-200 bg-red-50"
                  onClick={handleShortageClick}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-600 font-medium">부족 부품</p>
                        <p className="text-2xl font-bold text-red-700">{shortageCount}개</p>
                        <p className="text-xs text-red-500">최소 보유 수량 미달</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow border-orange-200 bg-orange-50"
                  onClick={handleLossClick}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-600 font-medium">손망실 부품</p>
                        <p className="text-2xl font-bold text-orange-700">{lossCount}건</p>
                        <p className="text-xs text-orange-500">최근 손망실 발생</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {inventoryData.length > 0 && inventoryData.map(item => (
                  <Card key={item.vessel_name}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Ship className="w-5 h-5" />{item.vessel_name}
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
                            {item.children.map((item, index) => (
                              <tr key={index} className="border-b hover:bg-gray-50">
                                {getTableCells(item, index)}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {item.children.length  === 0 && (
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
        </div>
      </div>
    </div>
  )
}
