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
					   const data = await fetchCategories();
					   // Use count property from Category model to show number of products per category
					   const chartData = data.map((item: CategoryData) => ({
							   categoryName: item.categoryName || item.category || "Khác",
							   count: item.count || 0,
					   }));
					   setCategoryData(chartData);
			   } catch (error) {
					   console.error("Error fetching categories:", error);
			   }
			   setLoading(false);
	   };
	   fetchCategoriesData();
	}, [])

	const totalCategories = React.useMemo(() => {
		return categoryData.reduce((acc, curr) => acc + (curr.count || 0), 0)
	}, [categoryData])

	return (
		<Card className="flex flex-col">
			<CardHeader className="items-center pb-0">
				<CardTitle>Thống kê sản phẩm trên danh mục</CardTitle>
				<CardDescription>
					Số lượng sản phẩm trên mỗi danh mục được thể hiện qua biểu đồ tròn. 
				</CardDescription>
			</CardHeader>
			<CardContent className="flex-1 pb-0">
				<ChartContainer
					config={{
						pie: {
							label: "Pie Chart",
							icon: undefined,
							color: "#4F8A8B",
						},
					}}
					className="mx-auto aspect-square max-h-[250px] w-[250px] h-[250px]"
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
								<Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
							))}
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
													{totalCategories}
												</tspan>
												<tspan
													x={viewBox.cx}
													y={(viewBox.cy || 0) + 24}
													className="fill-muted-foreground"
												>
													Sản phẩm
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
				<div className="flex flex-wrap gap-3 mt-2">
					{categoryData.map((cat, idx) => (
						<div key={cat.categoryName} className="flex items-center gap-2">
							<span
								className="inline-block w-3 h-3 rounded-full"
								style={{ background: COLORS[idx % COLORS.length] }}
							/>
							<span>{cat.categoryName}</span>
							<span className="text-muted-foreground">({cat.count})</span>
						</div>
					))}
				</div>
				<div className="text-muted-foreground leading-none mt-2">
					Tổng số sản phẩm: {totalCategories}
				</div>
			</CardFooter>
		</Card>
	)
}

export default DashboardCategoryPieChart
