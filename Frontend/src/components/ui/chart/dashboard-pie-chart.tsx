"use client"

import * as React from "react"
import { Label, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

const chartConfig = {
  count: {
    label: "Số lượng bình luận",
  },
  star1: {
    label: "1 sao",
    color: "#eab308",
  },
  star2: {
    label: "2 sao",
    color: "#fde047",
  },
  star3: {
    label: "3 sao",
    color: "#a3e635",
  },
  star4: {
    label: "4 sao",
    color: "#38bdf8",
  },
  star5: {
    label: "5 sao",
    color: "#6366f1",
  },
} satisfies ChartConfig

export function NewsCommentRatingPieChart() {
  const [chartData, setChartData] = React.useState([
    { rating: "1 sao", count: 0, fill: chartConfig.star1.color },
    { rating: "2 sao", count: 0, fill: chartConfig.star2.color },
    { rating: "3 sao", count: 0, fill: chartConfig.star3.color },
    { rating: "4 sao", count: 0, fill: chartConfig.star4.color },
    { rating: "5 sao", count: 0, fill: chartConfig.star5.color },
  ])
  const [total, setTotal] = React.useState(0)

  React.useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${baseUrl}/api/comment`)
        const comments = await res.json()
        // Assume each comment has a 'rating' property (1-5)
        const counts = [0, 0, 0, 0, 0]
        comments.forEach((c: {rating: number}) => {
         
          if (c.rating >= 1 && c.rating <= 5) {
            counts[c.rating - 1]++
          }
        })
        setChartData([
          { rating: "1 sao", count: counts[0], fill: chartConfig.star1.color },
          { rating: "2 sao", count: counts[1], fill: chartConfig.star2.color },
          { rating: "3 sao", count: counts[2], fill: chartConfig.star3.color },
          { rating: "4 sao", count: counts[3], fill: chartConfig.star4.color },
          { rating: "5 sao", count: counts[4], fill: chartConfig.star5.color },
        ])
        setTotal(counts.reduce((a, b) => a + b, 0))
      } catch {
        setChartData([
          { rating: "1 sao", count: 0, fill: chartConfig.star1.color },
          { rating: "2 sao", count: 0, fill: chartConfig.star2.color },
          { rating: "3 sao", count: 0, fill: chartConfig.star3.color },
          { rating: "4 sao", count: 0, fill: chartConfig.star4.color },
          { rating: "5 sao", count: 0, fill: chartConfig.star5.color },
        ])
        setTotal(0)
      }
    }
    fetchData()
  }, [])

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Biểu đồ bình luận & đánh giá tin tức</CardTitle>
        <CardDescription>Số lượng bình luận theo từng mức đánh giá</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="rating"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Bình luận
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Tổng số bình luận: {total.toLocaleString()}
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {chartData.map((item) => (
            <div key={item.rating} className="flex items-center gap-1">
              <span
                style={{
                  display: "inline-block",
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  background: item.fill,
                  border: "1px solid #ccc",
                }}
              ></span>
              <span>{item.rating}</span>
            </div>
          ))}
        </div>
        <div className="text-muted-foreground leading-none">
          Hiển thị phân bố bình luận theo đánh giá 1-5 sao
        </div>
      </CardFooter>
    </Card>
  )
}
