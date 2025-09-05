"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { requireAuth } from "@/lib/auth"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Package, BarChart3, AlertTriangle, History } from "lucide-react"

export default function InventoryStatisticsPage() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<any>(null)
  const [activeMenu, setActiveMenu] = useState("statistics")

  const menuItems = [
    { id: "dashboard", label: "대시보드", icon: BarChart3 },
    { id: "status", label: "재고 현황", icon: Package },
    { id: "transactions", label: "입출고 내역", icon: History },
    { id: "shortage", label: "부족 부품", icon: AlertTriangle },
    { id: "statistics", label: "통계", icon: BarChart3 },
    { id: "parts", label: "부품 관리", icon: Package },
  ]
    
  useEffect(() => {
    try {
      const user = requireAuth()
      setUserInfo(user)
    } catch (error) {
      // Redirect handled by requireAuth
    }
  }, [])

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userType={userInfo.user_auth} />
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
                  <h2 className="text-xl font-bold text-gray-900">통계</h2>
                  <p className="text-gray-600">재고 관련 통계 및 분석 정보를 확인합니다</p>
                </div>
              </div>

              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>통계 기능은 준비 중입니다</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
