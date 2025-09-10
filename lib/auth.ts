
import { User } from '@/types/user'; // ✅ interface import

export function getUserInfo(): User | null {
  if (typeof window === "undefined") return null

  const user = localStorage.getItem("userInfo")
  return user ? JSON.parse(user) : null
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("userInfo")
    window.location.href = "/"
  }
}

export function requireAuth(): User {
  const user = getUserInfo()

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
    throw new Error("Not authenticated")
  }

  if (user.user_auth && user.user_auth !== "ADMIN" && user.user_auth !== "USER") {
    throw new Error("Insufficient permissions")
  }

  return user
}

export function vesselRequireAuth(): User {
  const user = getUserInfo()

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
    throw new Error("Not authenticated")
  }

  if (user.user_auth && !(user.user_auth === "VESSEL" || user.user_auth === "VADMIN")) {
    throw new Error("Insufficient permissions")
  }

  return user
}