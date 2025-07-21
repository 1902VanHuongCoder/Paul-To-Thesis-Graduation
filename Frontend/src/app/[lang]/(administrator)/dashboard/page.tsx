"use client";
import React, { useEffect, useState } from 'react'
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge/badge"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { DashboardBarChart } from "@/components/ui/chart/dashboard-bar-chart"
import formatVND from '@/lib/others/format-vnd'
import { UserGrowthLineChart } from '@/components/ui/chart/user-growth-line-chart';
import { NewsCommentRatingPieChart } from '@/components/ui/chart/dashboard-pie-chart';
import DashboardCategoryPieChart from '@/components/ui/chart/dashboard-category-pie-chart';
import { fetchAllOrders } from '@/lib/order-apis';
import { getAllUsers } from '@/lib/user-apis';
import { getAccessStats } from '@/lib/statistic-apis';

export interface DeliveryMethod {
    deliveryID: number;
    name: string;
    description?: string;
    basePrice: number;
    minOrderAmount?: number;
    region?: string;
    speed?: string;
    isActive: boolean;
    isDefault: boolean;

}

type OrderProduct = {
    quantity: number;
    price: number;
}

interface Product {
    productID: number;
    productName: string;
    images?: string[]; // or productImage?: string;
    OrderProduct?: OrderProduct; // Optional field for order-specific product details
}

interface Order {
    orderID: string;
    userID: string;
    totalPayment: number;
    totalQuantity: number;
    note?: string;
    fullName: string;
    phone: string;
    address: string;
    paymentMethod: string;
    deliveryID: number;
    cartID: number;
    discount?: number;
    deliveryCost?: number;
    orderStatus: string;
    createdAt: string;
    updatedAt: string;
    products: Product[];
    delivery: DeliveryMethod;
}

const Page = () => {
    const [currentRevenue, setCurrentRevenue] = useState(0);
    const [, setPrevRevenue] = useState(0);
    const [percent, setPercent] = useState(0);
    const [isIncrease, setIsIncrease] = useState(true);
    const [currentNewUsers, setCurrentNewUsers] = useState(0);
    const [, setPrevNewUsers] = useState(0);
    const [userPercent, setUserPercent] = useState(0);
    const [userIsIncrease, setUserIsIncrease] = useState(true);
    const [currentAccess, setCurrentAccess] = useState(0);
    const [, setPrevAccess] = useState(0);
    const [accessPercent, setAccessPercent] = useState(0);
    const [accessIsIncrease, setAccessIsIncrease] = useState(true);

    useEffect(() => {
        async function fetchRevenue() {
            const orders = await fetchAllOrders();
            const completedOrders: Order[] = orders.filter((o: Order) => o.orderStatus === "completed");
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
            const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
            // Revenue for current month
            const curRevenue = completedOrders.filter(o => {
                const d = new Date(o.createdAt);
                return d.getFullYear() === currentYear && (d.getMonth() + 1) === currentMonth;
            }).reduce((acc, o) => acc + o.totalPayment, 0);
            // Revenue for previous month
            const preRevenue = completedOrders.filter(o => {
                const d = new Date(o.createdAt);
                return d.getFullYear() === prevYear && (d.getMonth() + 1) === prevMonth;
            }).reduce((acc, o) => acc + o.totalPayment, 0);
            setCurrentRevenue(curRevenue);
            setPrevRevenue(preRevenue);
            if (preRevenue === 0 && curRevenue > 0) {
                setPercent(100);
                setIsIncrease(true);
            } else if (preRevenue === 0 && curRevenue === 0) {
                setPercent(0);
                setIsIncrease(true);
            } else {
                const p = ((curRevenue - preRevenue) / preRevenue) * 100;
                setPercent(Math.abs(Number(p.toFixed(1))));
                setIsIncrease(curRevenue >= preRevenue);
            }
        }
        fetchRevenue();
    }, []);
    useEffect(() => {
        async function fetchNewUsers() {
            const users = await getAllUsers();
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
            const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
            // Users created in current month
            const curUsers = users.filter((u: { createdAt: string }) => {
                const d = new Date(u.createdAt);
                return d.getFullYear() === currentYear && (d.getMonth() + 1) === currentMonth;
            }).length;
            // Users created in previous month
            const preUsers = users.filter((u: { createdAt: string }) => {
                const d = new Date(u.createdAt);
                return d.getFullYear() === prevYear && (d.getMonth() + 1) === prevMonth;
            }).length;
            setCurrentNewUsers(curUsers);
            setPrevNewUsers(preUsers);
            if (preUsers === 0 && curUsers > 0) {
                setUserPercent(100);
                setUserIsIncrease(true);
            } else if (preUsers === 0 && curUsers === 0) {
                setUserPercent(0);
                setUserIsIncrease(true);
            } else {
                const p = ((curUsers - preUsers) / preUsers) * 100;
                setUserPercent(Math.abs(Number(p.toFixed(1))));
                setUserIsIncrease(curUsers >= preUsers);
            }
        }
        fetchNewUsers();
    }, []);
    useEffect(() => {
        async function fetchAccessStats() {
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
            const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
            const stats = await getAccessStats();
            // If backend returns an array of stats for all months
            const statArr = Array.isArray(stats) ? stats : [stats];
            const curStat = statArr.find((s: { year: number, month: number }) => s.year === currentYear && s.month === currentMonth);
            const preStat = statArr.find((s: { year: number, month: number }) => s.year === prevYear && s.month === prevMonth);
            const curAccess = curStat ? curStat.accessCount : 0;
            const preAccess = preStat ? preStat.accessCount : 0;
            setCurrentAccess(curAccess);
            setPrevAccess(preAccess);
            if (preAccess === 0 && curAccess > 0) {
                setAccessPercent(100);
                setAccessIsIncrease(true);
            } else if (preAccess === 0 && curAccess === 0) {
                setAccessPercent(0);
                setAccessIsIncrease(true);
            } else {
                const p = ((curAccess - preAccess) / preAccess) * 100;
                setAccessPercent(Math.abs(Number(p.toFixed(1))));
                setAccessIsIncrease(curAccess >= preAccess);
            }
        }
        fetchAccessStats();
    }, []);

    return (
        <div >
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <Card className='from-green-600 to-blue-500 bg-gradient-to-br text-white'>
                    <CardHeader>
                        <CardDescription className='text-white'>Doanh thu</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl space-x-2">
                            <span>{formatVND(currentRevenue)}</span><span className='text-sm'>VND</span>
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-white">
                                {isIncrease ? <IconTrendingUp /> : <IconTrendingDown />}
                                {isIncrease ? '+' : '-'}{percent}%
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            {isIncrease ? 'Doanh thu tăng trong tháng này' : 'Doanh thu giảm trong tháng này'} {isIncrease ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
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
                            {currentAccess < 10 ? '0' : ''}{currentAccess}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-white">
                                {accessIsIncrease ? <IconTrendingUp /> : <IconTrendingDown />}
                                {accessIsIncrease ? '+' : '-'}{accessPercent}%
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            {accessIsIncrease ? 'Tăng lượt truy cập trong tháng này' : 'Giảm lượt truy cập trong tháng này'} {accessIsIncrease ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
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
                            {currentNewUsers < 10 ? '0' : ''}{currentNewUsers}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-white">
                                {userIsIncrease ? <IconTrendingUp /> : <IconTrendingDown />}
                                {userIsIncrease ? '+' : '-'}{userPercent}%
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            {userIsIncrease ? 'Tăng số tài khoản mới trong tháng này' : 'Giảm số tài khoản mới trong tháng này'} {userIsIncrease ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
                        </div>
                        <div className='text-gray-300'>
                            Dựa trên số tài khoản tạo mới trong tháng
                        </div>
                    </CardFooter>
                </Card>
            </div>
            <div className="min-h-[100vh] grid rounded-xl md:min-h-min mt-6 bg-white grid-rows-3 gap-4">
                <div className='grid grid-cols-[1fr_16px_1fr]'>
                    <NewsCommentRatingPieChart />
                    <div></div>
                    <DashboardCategoryPieChart />
                </div>
                <UserGrowthLineChart />
                <DashboardBarChart />
            </div>
        </div>
    )
}

export default Page