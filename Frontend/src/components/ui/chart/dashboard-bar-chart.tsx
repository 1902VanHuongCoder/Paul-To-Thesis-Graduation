"use client"

import * as React from "react"
import { CartesianGrid, Bar, BarChart, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { baseUrl } from "@/lib/base-url"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select/select"

interface Order {
  orderID: string
  totalPayment: number
  orderStatus: string
  createdAt: string
}

type RevenueData = {
  date: string
  revenue: number
}

const chartConfig = {
  week: {
    label: "Theo tuần",
    color: "var(--color-sky-500)",
  },
  month: {
    label: "Theo tháng",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function getWeekOfMonth(date: Date) {
  // Week of month: 1-based, weeks start on Monday
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const dayOfWeekOfFirst = firstDayOfMonth.getDay() === 0 ? 7 : firstDayOfMonth.getDay() // 1 (Mon) ... 7 (Sun)
  const offset = date.getDate() + dayOfWeekOfFirst - 2
  return Math.floor(offset / 7) + 1
}

function getWeekMonthKey(date: Date) {
  // Format: YYYY-MM-Wn (e.g., 2024-07-W1)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, "0")
  const week = getWeekOfMonth(date)
  return `${year}-${month}-W${week}`
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`
}

// function getYear(date: Date) {
//   return date.getFullYear();
// }

export function DashboardBarChart() {
  const [activeChart, setActiveChart] = React.useState<"week" | "month">("week")
  const [weekData, setWeekData] = React.useState<RevenueData[]>([])
  const [monthData, setMonthData] = React.useState<RevenueData[]>([])
  const [loading, setLoading] = React.useState(true)
  const [years, setYears] = React.useState<number[]>([])
  const [months, setMonths] = React.useState<number[]>([])
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = React.useState<number>(new Date().getMonth() + 1)

  React.useEffect(() => {
    async function fetchOrders() {
      setLoading(true)
      try {
        const res = await fetch(`${baseUrl}/api/order`)
        const orders: Order[] = await res.json()
        const completedOrders = orders.filter(
          (o) => o.orderStatus === "completed"
        )
        // Get all years and months present in data
        const yearSet = new Set<number>()
        const monthSet = new Set<number>()
        completedOrders.forEach(order => {
          const d = new Date(order.createdAt)
          yearSet.add(d.getFullYear())
          if (d.getFullYear() === selectedYear) {
            monthSet.add(d.getMonth() + 1)
          }
        })
        setYears(Array.from(yearSet).sort((a, b) => a - b))
        setMonths(Array.from(monthSet).sort((a, b) => a - b))
        // Aggregate by week (for selected year & month)
        const weekMap = new Map<string, number>()
        completedOrders.forEach((order) => {
          const d = new Date(order.createdAt)
          if (d.getFullYear() === selectedYear && d.getMonth() + 1 === selectedMonth) {
            const weekMonth = getWeekMonthKey(d)
            weekMap.set(weekMonth, (weekMap.get(weekMonth) || 0) + order.totalPayment)
          }
        })
        const weekArr: RevenueData[] = Array.from(weekMap.entries())
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => a.date.localeCompare(b.date))
        // Aggregate by month (for selected year)
        const monthMap = new Map<string, number>()
        completedOrders.forEach((order) => {
          const d = new Date(order.createdAt)
          if (d.getFullYear() === selectedYear) {
            const month = getMonthKey(d)
            monthMap.set(month, (monthMap.get(month) || 0) + order.totalPayment)
          }
        })
        const monthArr: RevenueData[] = Array.from(monthMap.entries())
          .map(([date, revenue]) => ({ date, revenue }))
          .sort((a, b) => a.date.localeCompare(b.date))
        setWeekData(weekArr)
        setMonthData(monthArr)
      } catch (err) {
        console.error("Error fetching orders:", err)
        setWeekData([])
        setMonthData([])
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [selectedYear, selectedMonth])

  const chartData = activeChart === "week" ? weekData : monthData
  // const total = chartData.reduce((acc, curr) => acc + curr.revenue, 0)

  // For week chart, always show 4 weeks (even if some are 0)
  const weekChartData = React.useMemo(() => {
    if (activeChart !== "week") return chartData;
    const arr: RevenueData[] = [];
    for (let w = 1; w <= 4; w++) {
      const key = `${selectedYear}-${selectedMonth.toString().padStart(2, "0")}-W${w}`;
      const found = chartData.find(d => d.date === key);
      arr.push({ date: key, revenue: found ? found.revenue : 0 });
    }
    return arr;
  }, [activeChart, chartData, selectedYear, selectedMonth]);

  // For month chart, show all months in selected year
  const monthChartData = React.useMemo(() => {
    if (activeChart !== "month") return monthData;
    const arr: RevenueData[] = [];
    for (let m = 1; m <= 12; m++) {
      const key = `${selectedYear}-${m.toString().padStart(2, "0")}`;
      const found = monthData.find(d => d.date === key);
      arr.push({ date: key, revenue: found ? found.revenue : 0 });
    }
    return arr;
  }, [activeChart, monthData, selectedYear]);

  return (
    <Card className="py-4 sm:py-0">
      <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
          <CardTitle>Biểu đồ doanh thu cửa hàng</CardTitle>
          <CardDescription>
            Hiển thị doanh thu theo theo tháng và cả năm.
          </CardDescription>
        </div>
        <div className="flex gap-2 items-center">
          <div className="flex flex-col">
            <label htmlFor="year-select" className="text-xs text-muted-foreground mb-1">Năm</label>
            <Select value={selectedYear.toString()} onValueChange={v => setSelectedYear(Number(v))}>
              <SelectTrigger id="year-select" className="w-24"><SelectValue placeholder="Năm" /></SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col">
            <label htmlFor="month-select" className="text-xs text-muted-foreground mb-1">Tháng</label>
            <Select value={selectedMonth.toString()} onValueChange={v => setSelectedMonth(Number(v))}>
              <SelectTrigger id="month-select" className="w-20"><SelectValue placeholder="Tháng" /></SelectTrigger>
              <SelectContent>
                {months.map(m => <SelectItem key={m} value={m.toString()}>{m.toString().padStart(2, "0")}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <button
            data-active={activeChart === "week"}
            className="data-[active=true]:bg-muted/50 flex flex-col justify-center gap-1 border-t px-4 py-2 text-left border-l sm:border-t-0 sm:border-l sm:px-6 sm:py-4"
            onClick={() => setActiveChart("week")}
          >
            <span className="text-muted-foreground text-xs">Mỗi tháng</span>
            <span className="text-lg leading-none font-bold sm:text-2xl">{weekChartData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}</span>
          </button>
          <button
            data-active={activeChart === "month"}
            className="data-[active=true]:bg-muted/50 flex flex-col justify-center gap-1 border-t px-4 py-2 text-left border-l sm:border-t-0 sm:border-l sm:px-6 sm:py-4"
            onClick={() => setActiveChart("month")}
          >
            <span className="text-muted-foreground text-xs">Cả năm</span>
            <span className="text-lg leading-none font-bold sm:text-2xl">{monthChartData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}</span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        {loading ? (
          <div className="text-center py-10">Đang tải dữ liệu...</div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <BarChart
              data={activeChart === "week" ? weekChartData : monthChartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  if (activeChart === "week") {
                    // value: 2024-07-W2
                    // Use regex to extract week number
                    const match = value.match(/^(\d{4})-(\d{2})-W(\d)$/);
                    if (match) {
                      const [, year, month, week] = match;
                      return `Tuần ${week}/${month}/${year}`;
                    }
                    return value;
                  } else {
                    const [year, month] = value.split("-")
                    return `${month}/${year}`
                  }
                }}
              />
              <YAxis
                
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={80}
                tickFormatter={v => v.toLocaleString() + " VND"}
                // label={{ value: "Doanh thu (VND)", angle: -90, position: "insideLeft", offset:-10 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[150px]"
                    nameKey="revenue"
                    labelFormatter={(value) => {
                      if (activeChart === "week") {
                        const [year, month, w] = value.split(/-|W/)
                        return `Tuần ${w}/${month}/${year}`
                      } else {
                        const [year, month] = value.split("-")
                        return `Tháng ${month}/${year}`
                      }
                    }}
                  />
                }
              />
              <Bar
                dataKey="revenue"
                fill={chartConfig[activeChart].color}
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
