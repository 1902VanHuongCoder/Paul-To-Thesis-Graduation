"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { baseUrl } from "@/lib/base-url"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select/select"


type UserGrowthData = {
  date: string // YYYY-MM
  count: number
}

export function UserGrowthLineChart() {
  const [userData, setUserData] = React.useState<UserGrowthData[]>([])
  const [years, setYears] = React.useState<number[]>([])
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear())
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      try {
        const res = await fetch(`${baseUrl}/api/users`)
        const users: { createdAt: string }[] = await res.json()
        // Get all years present in data
        const yearSet = new Set<number>()
        users.forEach(user => {
          const d = new Date(user.createdAt)
          yearSet.add(d.getFullYear())
        })
        setYears(Array.from(yearSet).sort((a, b) => a - b))
        // Aggregate by month for selected year
        const monthMap = new Map<string, number>()
        users.forEach(user => {
          const d = new Date(user.createdAt)
          if (d.getFullYear() === selectedYear) {
            const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`
            monthMap.set(key, (monthMap.get(key) || 0) + 1)
          }
        })
        // Always show 12 months
        const arr: UserGrowthData[] = []
        for (let m = 1; m <= 12; m++) {
          const key = `${selectedYear}-${m.toString().padStart(2, "0")}`
          arr.push({ date: key, count: monthMap.get(key) || 0 })
        }
        setUserData(arr)
      } catch (err) {
        console.error("Error fetching user data:", err)
        setUserData([])
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [selectedYear])

  return (
    <Card className="py-4">
      <CardHeader className="flex flex-col items-stretch border-b !pb-2 sm:flex-row ">
        <div className="flex flex-1 flex-col justify-center gap-1 pb-3 sm:pb-0">
          <CardTitle>Biểu đồ phát triển tài khoản người dùng</CardTitle>
          <CardDescription>
            Hiển thị số lượng tài khoản mới theo từng tháng trong năm.
          </CardDescription>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex flex-row items-center gap-x-4">
            <label htmlFor="user-growth-year-select" className="text-xs text-muted-foreground mb-1">Năm</label>
            <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(Number(v))}>
              <SelectTrigger id="user-growth-year-select" className="w-24"><SelectValue placeholder="Năm" /></SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        {loading ? (
          <div className="text-center py-10">Đang tải dữ liệu...</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={value => {
                  // value: YYYY-MM
                  const [, month] = value.split("-")
                  return `Tháng ${month}`
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={60}
                tickFormatter={v => v.toLocaleString()}
                // label={{ value: "Tài khoản mới", angle: -90, position: "outsideLeft", offset: 10 }}
              />
              <Tooltip
                formatter={v => `${v} tài khoản`}
                labelFormatter={value => {
                  const [, month] = value.split("-")
                  return `Tháng ${month}`
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4, stroke: "#2563eb", strokeWidth: 2, fill: "#fff" }}
                activeDot={{ r: 6, fill: "#2563eb" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
