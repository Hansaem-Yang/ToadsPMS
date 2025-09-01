"use client"

import { cn } from "@/lib/utils"
import { LayoutDashboard, Ship, Settings, Calendar, Wrench, ClipboardList, CheckSquare, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  userType: "ADMIN" | "USER" | "VESSEL"
}

export function Sidebar({ userType }: SidebarProps) {
  const pathname = usePathname()

  const adminMenuItems = [
    { href: "/admin/dashboard", label: "대시보드", icon: LayoutDashboard },
    { href: "/admin/ships", label: "선박 관리", icon: Ship },
    { href: "/admin/maintenance", label: "정비 현황", icon: Wrench },
    { href: "/admin/calendar", label: "작업 캘린더", icon: Calendar },
    { href: "/admin/users", label: "사용자 관리", icon: Users },
  ]

  const userMenuItems = [
    { href: "/admin/dashboard", label: "대시보드", icon: LayoutDashboard },
    { href: "/admin/ships", label: "선박 관리", icon: Ship },
    { href: "/admin/maintenance", label: "정비 현황", icon: Wrench },
    { href: "/admin/calendar", label: "작업 캘린더", icon: Calendar },
  ]

  const vesselMenuItems = [
    { href: "/ship/dashboard", label: "대시보드", icon: LayoutDashboard },
    { href: "/ship/equipment", label: "장비 관리", icon: Settings },
    { href: "/ship/maintenance", label: "정비 등록", icon: ClipboardList },
    { href: "/ship/execution", label: "정비 실행", icon: CheckSquare },
    { href: "/ship/calendar", label: "작업 캘린더", icon: Calendar },
  ]

  const menuItems = userType === "ADMIN" ? adminMenuItems : userType === "USER" ? userMenuItems : vesselMenuItems

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 h-full flex-shrink-0">
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
    </aside>
  )
}
