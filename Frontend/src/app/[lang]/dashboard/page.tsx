import React from 'react'
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge/badge"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { DashboardLineChart } from "@/components/ui/chart/dashboard-line-chart"

const Page = () => {
  return (
    <div>
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <Card>
                  <CardHeader>
                      <CardDescription>Total Revenue</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                          $1,250.00
                      </CardTitle>
                      <CardAction>
                          <Badge variant="outline">
                              <IconTrendingUp />
                              +12.5%
                          </Badge>
                      </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                          Trending up this month <IconTrendingUp className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                          Visitors for the last 6 months
                      </div>
                  </CardFooter>
              </Card>
              <Card>
                  <CardHeader>
                      <CardDescription>New Customers</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                          1,234
                      </CardTitle>
                      <CardAction>
                          <Badge variant="outline">
                              <IconTrendingDown />
                              -20%
                          </Badge>
                      </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                          Down 20% this period <IconTrendingDown className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                          Acquisition needs attention
                      </div>
                  </CardFooter>
              </Card>
              <Card>
                  <CardHeader>
                      <CardDescription>Active Accounts</CardDescription>
                      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                          45,678
                      </CardTitle>
                      <CardAction>
                          <Badge variant="outline">
                              <IconTrendingUp />
                              +12.5%
                          </Badge>
                      </CardAction>
                  </CardHeader>
                  <CardFooter className="flex-col items-start gap-1.5 text-sm">
                      <div className="line-clamp-1 flex gap-2 font-medium">
                          Strong user retention <IconTrendingUp className="size-4" />
                      </div>
                      <div className="text-muted-foreground">
                          Engagement exceed targets
                      </div>
                  </CardFooter>
              </Card>
          </div>
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min">
              <DashboardLineChart />
          </div>
    </div>
  )
}

export default Page