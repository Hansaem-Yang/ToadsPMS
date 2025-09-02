"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminInventoryPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/admin/inventory/status")
  }, [router])

  return null
}
