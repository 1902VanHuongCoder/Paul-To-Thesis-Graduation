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
import { baseUrl } from "@/lib/others/base-url"
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
    <Card className="py-6 shadow-lg rounded-xl border-0">
      <CardHeader className="flex flex-col items-stretch border-b-0 !pb-2 sm:flex-row">
      <div className="flex flex-1 flex-col justify-center gap-1 pb-3 sm:pb-0">
        <CardTitle className="text-2xl font-bold text-primary">Biểu đồ phát triển tài khoản người dùng</CardTitle>
        <CardDescription className="text-base text-primary/80">
        Hiển thị số lượng tài khoản mới theo từng tháng trong năm.
        </CardDescription>
      </div>
      <div className="flex gap-2 items-center">
        <div className="flex flex-row items-center gap-x-4">
        <label htmlFor="user-growth-year-select" className="text-xs text-primary mb-1">Năm</label>
        <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(Number(v))}>
          <SelectTrigger id="user-growth-year-select" className="w-24 border-primary/30 focus:ring-2 focus:ring-primary">
          <SelectValue placeholder="Năm" />
          </SelectTrigger>
          <SelectContent>
          {years.map(y => (
            <SelectItem key={y} value={y.toString()} className="hover:bg-primary/10">
            {y}
            </SelectItem>
          ))}
          </SelectContent>
        </Select>
        </div>
      </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-8">
      {loading ? (
        <div className="text-center py-16 text-primary font-medium animate-pulse">
        Đang tải dữ liệu...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
        <LineChart data={userData} margin={{ left: 12, right: 12, top: 24, bottom: 8 }}>
          <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4}/>
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.05}/>
          </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--primary-100, #c7d2fe)" />
          <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={32}
          tickFormatter={value => {
            const [, month] = value.split("-")
            return `Tháng ${month}`
          }}
          className="text-primary"
          />
          <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          width={60}
          tickFormatter={v => v.toLocaleString()}
          className="text-primary"
          />
          <Tooltip
          contentStyle={{ borderRadius: 12, background: "#fff", border: "1px solid var(--primary)" }}
          formatter={v => `${v} tài khoản`}
          labelFormatter={value => {
            const [, month] = value.split("-")
            return `Tháng ${month}`
          }}
          />
          <Line
          type="monotone"
          dataKey="count"
          stroke="var(--primary)"
          strokeWidth={3}
          dot={{ r: 5, stroke: "var(--primary)", strokeWidth: 2, fill: "#fff", filter: "drop-shadow(0 2px 4px #2563eb33)" }}
          activeDot={{ r: 8, fill: "var(--primary)", stroke: "#fff", strokeWidth: 3, filter: "drop-shadow(0 2px 8px #2563eb66)" }}
          fill="url(#colorUv)"
          isAnimationActive={true}
          />
        </LineChart>
        </ResponsiveContainer>
      )}
      </CardContent>
    </Card>
  )
}
