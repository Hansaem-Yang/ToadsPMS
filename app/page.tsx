"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Ship } from "lucide-react"
import { User } from '@/types/user'; // ✅ interface import

export default function LoginPage() {
  const initialUser: User = {
    account_no: '',
    user_name: '',
    user_ename: '',
    email: '',
    password: '',
    password_check: '',
    position: '',
    user_auth: 'USER',
    ship_no: '',
    ship_name: '',
    use_yn: '',
    regist_date: '',
    regist_user: '',
    modify_date: '',
    modify_user: ''
  };

  const [credentials, setCredentials] = useState<User>(initialUser);

  useEffect(() => {
    const inputElement = document.getElementById('email') as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  }, [])

  const handleLogin = async () => {
    const res = await fetch('/api/common/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem('userInfo', JSON.stringify(data.user));
      
      // Redirect based on user type
      if (data.user.user_auth === "ADMIN" || data.user.user_auth === "USER") {
        window.location.href = "/admin/dashboard"
      } else {
        window.location.href = "/ship/dashboard"
      }
    } else {
      alert(data.message);
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {      
      event.preventDefault();

      if (!(!credentials?.email || !credentials?.password || (credentials?.user_auth === "VESSEL" && !credentials?.ship_no))) {
        handleLogin();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Ship className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">선박 유지보수 관리</CardTitle>
          <CardDescription>Ship Maintenance Management System</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">사용자명</Label>
            <Input
              id="email"
              type="text"
              placeholder="사용자명을 입력하세요"
              value={credentials?.email}
              onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={credentials?.password}
              onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
              onKeyDown={handleKeyDown}
            />
          </div>

          <Button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={!credentials?.email || !credentials?.password}
            style={{cursor: 'pointer'}}
          >
            로그인
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
