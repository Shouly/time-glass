"use client"

import { useState, useEffect } from "react"
import { DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { ProductivityScoreChart, ProductivityScoreCard } from "@/components/productivity/productivity-score"
import { AppList } from "@/components/productivity/app-list"
import { getProductivityScore, ProductivityResponse } from "@/lib/api"
import { formatTimeSpent } from "@/lib/utils"
import { TrendingUp, Award, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default function ProductivityScorePage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -6),
    to: new Date(),
  })
  
  const [productivityData, setProductivityData] = useState<ProductivityResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<"day" | "week" | "month">("day")
  
  useEffect(() => {
    const fetchData = async () => {
      if (!dateRange?.from || !dateRange?.to) return
      
      setIsLoading(true)
      try {
        const data = await getProductivityScore({
          start_date: format(dateRange.from, "yyyy-MM-dd"),
          end_date: format(dateRange.to, "yyyy-MM-dd"),
          period
        })
        setProductivityData(data)
      } catch (error) {
        console.error("Error fetching productivity data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [dateRange, period])
  
  // 准备趋势图数据
  const trendData = productivityData?.trend
    ? productivityData.trend.dates.map((date, index) => ({
        date,
        score: productivityData.trend.scores[index],
        productive: productivityData.trend.productive_times[index] || 0,
        nonProductive: productivityData.trend.non_productive_times[index] || 0,
        neutral: productivityData.trend.neutral_times[index] || 0,
        total: productivityData.trend.total_times[index] || 0
      }))
    : []
  
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">生产力评分</h1>
          <p className="text-muted-foreground">
            基于您的应用使用情况计算生产力得分
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className="w-[300px]"
          />
          
          <Tabs value={period} onValueChange={(value) => setPeriod(value as "day" | "week" | "month")}>
            <TabsList>
              <TabsTrigger value="day">按天</TabsTrigger>
              <TabsTrigger value="week">按周</TabsTrigger>
              <TabsTrigger value="month">按月</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* 概览统计卡片 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">当前生产力得分</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "加载中..." : productivityData?.current?.score.toFixed(1) || "0.0"}
              </div>
              <p className="text-xs text-muted-foreground">
                {productivityData?.current?.score && productivityData?.trend?.avg_score && (
                  <span className={`inline-flex items-center ${
                    productivityData.current.score > productivityData.trend.avg_score
                      ? "text-green-500"
                      : "text-red-500"
                  }`}>
                    {productivityData.current.score > productivityData.trend.avg_score ? (
                      <>
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                        高于平均 {(productivityData.current.score - productivityData.trend.avg_score).toFixed(1)}
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                        低于平均 {(productivityData.trend.avg_score - productivityData.current.score).toFixed(1)}
                      </>
                    )}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均生产力得分</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "加载中..." : productivityData?.trend?.avg_score.toFixed(1) || "0.0"}
              </div>
              <p className="text-xs text-muted-foreground">
                在选定的时间范围内
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总工作时间</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "加载中..." : formatTimeSpent(productivityData?.current?.total_time_seconds || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                在 {dateRange?.from && dateRange?.to ? Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0} 天内
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>生产力趋势</CardTitle>
                <CardDescription>
                  查看生产力得分随时间的变化
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p>加载中...</p>
                  </div>
                ) : trendData.length > 0 ? (
                  <ProductivityScoreChart data={trendData} />
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <p>暂无数据</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <ProductivityScoreCard
              score={productivityData?.current?.score || 0}
              previousScore={productivityData?.trend?.scores[productivityData?.trend?.scores.length - 2]}
              productive={productivityData?.current?.productive_time_seconds || 0}
              nonProductive={productivityData?.current?.non_productive_time_seconds || 0}
              neutral={productivityData?.current?.neutral_time_seconds || 0}
              total={productivityData?.current?.total_time_seconds || 0}
            />
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>最高生产力应用</CardTitle>
              <CardDescription>
                提升您生产力的应用
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p>加载中...</p>
                </div>
              ) : productivityData?.top_productive_apps?.length ? (
                <AppList 
                  apps={productivityData.top_productive_apps} 
                  totalTime={productivityData.current.total_time_seconds} 
                />
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p>暂无数据</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>最低生产力应用</CardTitle>
              <CardDescription>
                降低您生产力的应用
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <p>加载中...</p>
                </div>
              ) : productivityData?.top_non_productive_apps?.length ? (
                <AppList 
                  apps={productivityData.top_non_productive_apps} 
                  totalTime={productivityData.current.total_time_seconds} 
                />
              ) : (
                <div className="h-[300px] flex items-center justify-center">
                  <p>暂无数据</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 