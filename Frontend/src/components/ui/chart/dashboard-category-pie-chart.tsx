"use client"

import * as React from "react"
import { Pie, PieChart, Cell, Label } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { fetchCategories } from "@/lib/category-apis"

const COLORS = [
	"#4F8A8B",
	"#F9A826",
	"#A93F55",
	"#3A6351",
	"#F76E11",
	"#6C3483",
	"#229954",
	"#CA6F1E",
]

type CategoryData = {
	category?: string
	categoryName?: string
	count?: number
	productCount?: number
}

export function DashboardCategoryPieChart() {
	const [categoryData, setCategoryData] = React.useState<CategoryData[]>([])
	const [loading, setLoading] = React.useState(true)

	React.useEffect(() => {
		const fetchCategoriesData = async () => {
			try {
				const data = await fetchCategories()
				const chartData = data.map((item: CategoryData) => ({
					categoryName: item.categoryName || item.category || "Khác",
					count: item.count || 0,
				}))
				setCategoryData(chartData)
			} catch (error) {
				console.error("Error fetching categories:", error)
			}
			setLoading(false)
		}
		fetchCategoriesData()
	}, [])

	const totalCategories = React.useMemo(() => {
		return categoryData.reduce((acc, curr) => acc + (curr.count || 0), 0)
	}, [categoryData])

	const maxCategory = React.useMemo(() => {
		return categoryData.reduce(
			(prev, curr) => (curr.count! > (prev?.count || 0) ? curr : prev),
			categoryData[0]
		)
	}, [categoryData])

	return (
		<Card className="flex flex-col shadow-lg border-0 bg-gradient-to-br from-white via-slate-50 to-slate-100">
			<CardHeader className="items-center pb-0">
				<CardTitle className="text-xl font-extrabold text-primary drop-shadow-sm">
					Thống kê sản phẩm trên danh mục
				</CardTitle>
				<CardDescription className="text-base text-muted-foreground">
					Số lượng sản phẩm trên mỗi danh mục được thể hiện qua biểu đồ tròn.
				</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 pb-0 flex flex-col items-center justify-center">
				<ChartContainer
					config={{
						pie: {
							label: "Pie Chart",
							icon: undefined,
							color: "#4F8A8B",
						},
					}}
					className="mx-auto aspect-square max-h-[250px] w-[250px] h-[250px] relative"
				>
					<PieChart>
						<ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
						<Pie
							data={categoryData}
							dataKey="count"
							nameKey="categoryName"
							innerRadius={60}
							outerRadius={80}
							strokeWidth={5}
							isAnimationActive={!loading}
						>
							{categoryData.map((entry, idx) => (
								<Cell
									key={`cell-${idx}`}
									fill={COLORS[idx % COLORS.length]}
									stroke={maxCategory?.categoryName === entry.categoryName ? "#222" : "#fff"}
									strokeWidth={maxCategory?.categoryName === entry.categoryName ? 4 : 2}
								/>
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
														className="fill-primary text-3xl font-extrabold"
													>
														{totalCategories}
													</tspan>
													<tspan
														x={viewBox.cx}
														y={(viewBox.cy || 0) + 24}
														className="fill-muted-foreground text-base"
													>
														Sản phẩm
													</tspan>
												</text>
											</g>
										)
									}
								}}
							/>
						</Pie>
					</PieChart>
					{/* {maxCategory && (
						<div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 bg-white/90 rounded-xl px-4 py-2 shadow-lg border border-primary flex flex-col items-center">
							<span className="text-xs text-muted-foreground">Danh mục nổi bật</span>
							<span className="font-bold text-primary">{maxCategory.categoryName}</span>
							<span className="text-sm font-semibold">{maxCategory.count} sản phẩm</span>
						</div>
					)} */}
				</ChartContainer>
			</CardContent>
			<CardFooter className="flex-col gap-2 text-sm">
				<div className="flex flex-wrap gap-3 mt-2 justify-center">
					{categoryData.map((cat, idx) => (
						<div
							key={cat.categoryName}
							className={`flex items-center gap-2 px-2 py-1 rounded-lg ${
								maxCategory?.categoryName === cat.categoryName
									? "bg-primary/10 border border-primary font-bold shadow"
									: "bg-muted"
							}`}
						>
							<span
								className="inline-block w-3 h-3 rounded-full border"
								style={{
									background: COLORS[idx % COLORS.length],
									borderColor: maxCategory?.categoryName === cat.categoryName ? "#4F8A8B" : "#fff",
								}}
							/>
							<span>{cat.categoryName}</span>
							<span className="text-muted-foreground">({cat.count})</span>
						</div>
					))}
				</div>
				<div className="text-muted-foreground leading-none mt-2 text-center">
					<span className="font-semibold text-primary">Tổng số sản phẩm: {totalCategories}</span>
				</div>
			</CardFooter>
		</Card>
	)
}

export default DashboardCategoryPieChart
