"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, BarChart3, Package, History, AlertTriangle, Edit, Warehouse } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  userType: "ADMIN" | "USER" | "VESSEL"
}

export function Sidebar({ userType }: SidebarProps) {
  const pathname = usePathname()

  const adminMenuItems = [
    { href: "/admin/dashboard", label: "대시보드", icon: BarChart3 },
    { href: "/admin/inventory/status", label: "재고 현황", icon: Package },
    { href: "/admin/inventory/transactions", label: "입출고 내역", icon: History },
    { href: "/admin/inventory/shortage", label: "부족 부품", icon: AlertTriangle },
    { href: "/admin/inventory/material", label: "부품 관리", icon: Package },
  ]

  const userMenuItems = [
    { href: "/admin/dashboard", label: "대시보드", icon: BarChart3 },
    { href: "/admin/inventory/status", label: "재고 현황", icon: Package },
    { href: "/admin/inventory/transactions", label: "입출고 내역", icon: History },
    { href: "/admin/inventory/shortage", label: "부족 부품", icon: AlertTriangle },
    { href: "/admin/inventory/material", label: "부품 관리", icon: Package },
  ]

  const vesselMenuItems = [
    { href: "/ship/dashboard", label: "대시보드", icon: BarChart3 },
    { href: "/ship/inventory", label: "재고 관리", icon: Package },
    { href: "/ship/inventory/status", label: "재고 현황", icon: BarChart3 },
    { href: "/ship/inventory/receiving", label: "부품 입고", icon: TrendingUp },
    { href: "/ship/inventory/transactions", label: "입출고 내역", icon: History },
    { href: "/ship/inventory/initial-stock", label: "기초재고 등록", icon: Package },
    { href: "/ship/inventory/adjustment", label: "재고 조정", icon: Edit },
    { href: "/ship/inventory/loss", label: "손망실 처리", icon: AlertTriangle },
    { href: "/ship/inventory/warehouse", label: "창고 관리", icon: Warehouse },
  ]

  const menuItems = userType === "ADMIN" ? adminMenuItems : userType === "USER" ? userMenuItems : vesselMenuItems

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-50 border-r border-gray-200 h-full flex-shrink-0">
        <div className="w-64 bg-white shadow-sm border-r h-full">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">재고 관리</h1>
            <p className="text-sm text-gray-600">부품 재고 통합 관리</p>
          </div>
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </div>
  )
}
