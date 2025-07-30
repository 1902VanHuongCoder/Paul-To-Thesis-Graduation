"use client"

import * as React from "react"
import { Cell, Label, Pie, PieChart } from "recharts"

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
import { baseUrl } from "@/lib/others/base-url"

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
        console.log("Fetched comments:", comments);
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
        console.log( [
          { rating: "1 sao", count: counts[0], fill: chartConfig.star1.color },
          { rating: "2 sao", count: counts[1], fill: chartConfig.star2.color },
          { rating: "3 sao", count: counts[2], fill: chartConfig.star3.color },
          { rating: "4 sao", count: counts[3], fill: chartConfig.star4.color },
          { rating: "5 sao", count: counts[4], fill: chartConfig.star5.color },
        ]);
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
    <Card className="flex flex-col shadow-lg border-2 border-primary/30">
      <CardHeader className="items-center pb-0">
      <CardTitle className="text-primary text-xl font-extrabold tracking-wide">
        Biểu đồ bình luận & đánh giá tin tức
      </CardTitle>
      <CardDescription className="text-base text-muted-foreground">
        Số lượng bình luận theo từng mức đánh giá
      </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 flex flex-col items-center">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px] min-h-[250px] min-w-[250px] w-[250px] h-[250px]"
      >
        <PieChart width={250} height={250}>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="rating"
          innerRadius={60}
          outerRadius={100}
          strokeWidth={5}
          isAnimationActive
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <g>
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-primary text-4xl font-extrabold drop-shadow"
                      >
                        {total.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 28}
                        className="fill-muted-foreground text-lg"
                      >
                        Bình luận
                      </tspan>
                    </text>
                  </g>
                )
              }
            }}
          />
        </Pie>
        </PieChart>
      </ChartContainer>
      <div className="flex flex-wrap gap-4 mt-6 justify-center">
        {chartData.map((item) => (
        <div
          key={item.rating}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg shadow-sm border ${
          item.count === Math.max(...chartData.map(d => d.count)) && item.count > 0
            ? "bg-primary/10 border-primary font-bold scale-105"
            : "bg-muted"
          } transition-all`}
        >
          <span
          style={{
            display: "inline-block",
            width: 18,
            height: 18,
            borderRadius: 6,
            background: item.fill,
            border: "2px solid #fff",
            boxShadow: "0 0 0 1px #ccc",
          }}
          ></span>
          <span className="text-base">{item.rating}</span>
          <span className="ml-1 text-sm text-muted-foreground">
          {item.count}
          </span>
          {item.count === Math.max(...chartData.map(d => d.count)) && item.count > 0 && (
          <span className="ml-2 px-2 py-0.5 rounded bg-primary text-white text-xs font-semibold">
            Nổi bật
          </span>
          )}
        </div>
        ))}
      </div>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-base mt-2">
      <div className="flex items-center gap-2 leading-none font-semibold text-primary">
        Tổng số bình luận:{" "}
        <span className="text-2xl font-bold ml-1">{total.toLocaleString()}</span>
      </div>
      <div className="text-muted-foreground leading-none mt-1">
        Hiển thị phân bố bình luận theo đánh giá <span className="font-semibold text-primary">1-5 sao</span>
      </div>
      </CardFooter>
    </Card>
  )
}
