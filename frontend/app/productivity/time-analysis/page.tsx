"use client"

import { useState, useEffect } from "react"
import { DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { TimeUsageChart } from "@/components/productivity/time-usage-chart"
import { AppList } from "@/components/productivity/app-list"
import { getTimeUsage, TimeUsageResponse, AppUsageItem, UsageBreakdown } from "@/lib/api"
import { formatTimeSpent, secondsToHours } from "@/lib/utils"
import { Clock, Calendar, BarChart2, PieChart, ArrowUpRight } from "lucide-react"

// Define the structure for usage data
interface UsageData {
  productive: number;
  non_productive: number;
  neutral: number;
}

export default function TimeAnalysisPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -6),
    to: new Date(),
  })
  
  const [timeUsageData, setTimeUsageData] = useState<TimeUsageResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const fetchData = async () => {
      if (!dateRange?.from || !dateRange?.to) return
      
      setIsLoading(true)
      try {
        const data = await getTimeUsage({
          start_date: format(dateRange.from, "yyyy-MM-dd"),
          end_date: format(dateRange.to, "yyyy-MM-dd"),
        })
        setTimeUsageData(data)
      } catch (error) {
        console.error("Error fetching time usage data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [dateRange])
  
  // 准备每日使用数据
  const dailyData = timeUsageData?.summary?.daily_usage
    ? Object.entries(timeUsageData.summary.daily_usage).map(([date, usage]) => {
        const productive = secondsToHours(usage.productive || 0)
        const nonProductive = secondsToHours(usage.non_productive || 0)
        const neutral = secondsToHours(usage.neutral || 0)
        
        return {
          name: date,
          productive,
          nonProductive,
          neutral
        }
      })
    : []
  
  // 准备每小时使用数据
  const hourlyData = timeUsageData?.summary?.hourly_usage
    ? Object.entries(timeUsageData.summary.hourly_usage).map(([hour, usage]) => {
        const productive = secondsToHours(usage.productive || 0)
        const nonProductive = secondsToHours(usage.non_productive || 0)
        const neutral = secondsToHours(usage.neutral || 0)
        
        return {
          name: hour,
          productive,
          nonProductive,
          neutral
        }
      })
    : []
  
  // 准备应用使用数据
  const appUsageData: AppUsageItem[] = timeUsageData?.items
    ? Object.entries(
        timeUsageData.items.reduce((acc, item) => {
          const appName = item.app_name
          if (!acc[appName]) {
            acc[appName] = {
              app_name: appName,
              total_time_seconds: 0,
              percentage: 0,
              session_count: 0,
              avg_session_time: 0,
              productivity_type: item.category
            }
          }
          
          acc[appName].total_time_seconds += item.duration_seconds
          acc[appName].session_count += 1
          
          return acc
        }, {} as Record<string, AppUsageItem>)
      )
        .map(([_, app]) => ({
          ...app,
          percentage: (app.total_time_seconds / (timeUsageData.summary.total_time_seconds || 1)) * 100,
          avg_session_time: app.total_time_seconds / app.session_count
        }))
        .sort((a, b) => b.total_time_seconds - a.total_time_seconds)
        .slice(0, 10)
    : []
  
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">工作时间分析</h1>
          <p className="text-muted-foreground">
            分析您在不同应用和任务上花费的时间
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            className="w-[300px]"
          />
        </div>
        
        {/* 概览统计卡片 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总工作时间</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "加载中..." : formatTimeSpent(timeUsageData?.summary?.total_time_seconds || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500 inline-flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  较上周增长 12%
                </span>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">生产型时间</CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "加载中..." : formatTimeSpent(timeUsageData?.summary?.productive_time_seconds || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                占总时间的 {isLoading ? "..." : Math.round(((timeUsageData?.summary?.productive_time_seconds || 0) / (timeUsageData?.summary?.total_time_seconds || 1)) * 100)}%
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">非生产型时间</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "加载中..." : formatTimeSpent(timeUsageData?.summary?.non_productive_time_seconds || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                占总时间的 {isLoading ? "..." : Math.round(((timeUsageData?.summary?.non_productive_time_seconds || 0) / (timeUsageData?.summary?.total_time_seconds || 1)) * 100)}%
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活跃天数</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "加载中..." : Object.keys(timeUsageData?.summary?.daily_usage || {}).length}
              </div>
              <p className="text-xs text-muted-foreground">
                在选定的 {dateRange?.from && dateRange?.to ? Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0} 天中
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="daily" className="space-y-4">
          <TabsList>
            <TabsTrigger value="daily">每日使用</TabsTrigger>
            <TabsTrigger value="hourly">每小时使用</TabsTrigger>
            <TabsTrigger value="apps">应用使用</TabsTrigger>
          </TabsList>
          
          <TabsContent value="daily" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>每日时间使用</CardTitle>
                <CardDescription>
                  查看每天在不同类型活动上花费的时间
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p>加载中...</p>
                  </div>
                ) : dailyData.length > 0 ? (
                  <TimeUsageChart data={dailyData} type="daily" />
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <p>暂无数据</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="hourly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>每小时时间使用</CardTitle>
                <CardDescription>
                  查看一天中不同时段的时间使用情况
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p>加载中...</p>
                  </div>
                ) : hourlyData.length > 0 ? (
                  <TimeUsageChart data={hourlyData} type="hourly" />
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <p>暂无数据</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="apps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>应用使用排行</CardTitle>
                <CardDescription>
                  查看使用时间最长的应用
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <p>加载中...</p>
                  </div>
                ) : appUsageData.length > 0 ? (
                  <AppList 
                    apps={appUsageData} 
                    totalTime={timeUsageData?.summary?.total_time_seconds || 0} 
                  />
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <p>暂无数据</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 