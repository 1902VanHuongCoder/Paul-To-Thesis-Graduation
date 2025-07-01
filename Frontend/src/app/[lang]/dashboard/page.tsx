import React from 'react'
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge/badge"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { DashboardLineChart } from "@/components/ui/chart/dashboard-line-chart"
import formatVND from '@/lib/format-vnd'

const Page = () => {
    return (
        <div >
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <Card className='from-green-600 to-blue-500 bg-gradient-to-br text-white'>
                    <CardHeader>
                        <CardDescription className='text-white'>Doanh thu</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl space-x-2">
                            <span>{
                                formatVND(80000000) 
                            }</span><span className='text-sm'>VND</span>
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-white">
                                <IconTrendingUp />
                                +12.5%
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Doanh thu tăng trong tháng này <IconTrendingUp className="size-4" />
                        </div>
                        <div className='text-gray-300'>
                            Dựa trên số liệu bán hàng
                        </div>
                    </CardFooter>
                </Card>
                <Card className='from-blue-500  to-pink-500 bg-gradient-to-br text-white'>
                    <CardHeader>
                        <CardDescription className="text-white">Số lượt truy cập website</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            123.456
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-white">
                                <IconTrendingDown />
                                -20%
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Giảm 20% so với tháng trước <IconTrendingDown className="size-4" />
                        </div>
                        <div className="text-gray-300">
                            Dựa trên số liệu truy cập
                        </div>
                    </CardFooter>
                </Card>
                <Card className='from-yellow-500 to-red-500 bg-gradient-to-br text-white'>
                    <CardHeader>
                        <CardDescription className="text-white">Tài khoản mới</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            320
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-white">
                                <IconTrendingUp />
                                +12.5%
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Giữ chân người dùng mạnh mẽ <IconTrendingUp className="size-4" />
                        </div>
                        <div className="text-gray-300">
                            Dựa trên số tài khoản tạo mới trong tháng
                        </div>
                    </CardFooter>
                </Card>
            </div>
            <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min mt-6">
                <DashboardLineChart />
            </div>
        </div>
    )
}

export default Page