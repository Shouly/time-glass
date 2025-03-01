"use client"

import { useState, useEffect } from "react"
import { DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { AppUsageChart } from "@/components/productivity/app-usage-chart"
import { AppList } from "@/components/productivity/app-list"
import { getAppUsage, AppUsageResponse, AppUsageItem, AppCategoryUsage } from "@/lib/api"
import { formatTimeSpent, getProductivityColor } from "@/lib/utils"
import { Laptop, PieChart, BarChart2, Clock } from "lucide-react"

export default function AppUsagePage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -6),
    to: new Date(),
  })
  
  const [appUsageData, setAppUsageData] = useState<AppUsageResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  
  useEffect(() => {
    const fetchData = async () => {
      if (!dateRange?.from || !dateRange?.to) return
      
      setIsLoading(true)
      try {
        const data = await getAppUsage({
          start_date: format(dateRange.from, "yyyy-MM-dd"),
          end_date: format(dateRange.to, "yyyy-MM-dd"),
        })
        setAppUsageData(data)
      } catch (error) {
        console.error("Error fetching app usage data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [dateRange])
  
  // 准备饼图数据
  const getChartData = () => {
    if (!appUsageData) return []
    
    if (activeTab === "all") {
      return appUsageData.apps.slice(0, 10).map(app => ({
        name: app.app_name,
        value: app.total_time_seconds,
        percentage: app.percentage,
        color: app.productivity_type === "productive" ? "#22c55e" :
               app.productivity_type === "non_productive" ? "#ef4444" : "#3b82f6",
        type: app.productivity_type
      }))
    } else if (activeTab === "categories") {
      return appUsageData.categories.map(category => ({
        name: category.category === "productive" ? "生产型" :
              category.category === "non_productive" ? "非生产型" : 
              category.category === "neutral" ? "中性" : category.category,
        value: category.total_time_seconds,
        percentage: category.percentage,
        color: category.category === "productive" ? "#22c55e" :
               category.category === "non_productive" ? "#ef4444" : 
               category.category === "neutral" ? "#3b82f6" : "#94a3b8"
      }))
    }
    
    return []
  }
  
  // 过滤应用列表
  const getFilteredApps = (): AppUsageItem[] => {
    if (!appUsageData) return []
    
    if (activeTab === "productive") {
      return appUsageData.apps.filter(app => app.productivity_type === "productive")
    } else if (activeTab === "non_productive") {
      return appUsageData.apps.filter(app => app.productivity_type === "non_productive")
    } else if (activeTab === "neutral") {
      return appUsageData.apps.filter(app => app.productivity_type === "neutral")
    }
    
    return appUsageData.apps
  }
  
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">应用使用分析</h1>
          <p className="text-muted-foreground">
            分析您使用的应用程序和工具
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
              <CardTitle className="text-sm font-medium">总使用时间</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "加载中..." : formatTimeSpent(appUsageData?.total_time_seconds || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                在 {dateRange?.from && dateRange?.to ? Math.round((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0} 天内
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">使用的应用</CardTitle>
              <Laptop className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "加载中..." : appUsageData?.apps.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                不同的应用程序
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">生产型应用</CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "加载中..." : appUsageData?.apps.filter(app => app.productivity_type === "productive").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                占总应用的 {isLoading ? "..." : Math.round(((appUsageData?.apps.filter(app => app.productivity_type === "productive").length || 0) / (appUsageData?.apps.length || 1)) * 100)}%
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">应用类别</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "加载中..." : appUsageData?.categories.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                不同的应用类别
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">所有应用</TabsTrigger>
            <TabsTrigger value="categories">应用类别</TabsTrigger>
            <TabsTrigger value="productive">生产型</TabsTrigger>
            <TabsTrigger value="non_productive">非生产型</TabsTrigger>
            <TabsTrigger value="neutral">中性</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>应用使用分布</CardTitle>
                <CardDescription>
                  查看各应用使用时间占比
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2">
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p>加载中...</p>
                    </div>
                  ) : appUsageData?.apps.length ? (
                    <AppUsageChart 
                      data={getChartData()} 
                      totalTime={appUsageData.total_time_seconds} 
                    />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p>暂无数据</p>
                    </div>
                  )}
                </div>
                <div className="w-full md:w-1/2">
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p>加载中...</p>
                    </div>
                  ) : appUsageData?.apps.length ? (
                    <AppList 
                      apps={getFilteredApps().slice(0, 10)} 
                      totalTime={appUsageData.total_time_seconds} 
                    />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p>暂无数据</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>应用类别分布</CardTitle>
                <CardDescription>
                  查看不同类别应用的使用时间占比
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2">
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p>加载中...</p>
                    </div>
                  ) : appUsageData?.categories.length ? (
                    <AppUsageChart 
                      data={getChartData()} 
                      totalTime={appUsageData.total_time_seconds} 
                    />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p>暂无数据</p>
                    </div>
                  )}
                </div>
                <div className="w-full md:w-1/2">
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="h-[300px] flex items-center justify-center">
                        <p>加载中...</p>
                      </div>
                    ) : appUsageData?.categories.length ? (
                      appUsageData.categories.map((category, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-2 ${
                                category.category === "productive" ? "bg-green-500" :
                                category.category === "non_productive" ? "bg-red-500" :
                                category.category === "neutral" ? "bg-blue-500" : "bg-gray-500"
                              }`} />
                              <h4 className="font-medium">
                                {category.category === "productive" ? "生产型" :
                                 category.category === "non_productive" ? "非生产型" :
                                 category.category === "neutral" ? "中性" : category.category}
                              </h4>
                            </div>
                            <span className="font-medium">
                              {formatTimeSpent(category.total_time_seconds)}
                            </span>
                          </div>
                          <div className="mt-2">
                            <div className="text-xs text-gray-500">
                              包含 {category.apps.length} 个应用，占总时间的 {Math.round(category.percentage)}%
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-[300px] flex items-center justify-center">
                        <p>暂无数据</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {["productive", "non_productive", "neutral"].map((type) => (
            <TabsContent key={type} value={type} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {type === "productive" ? "生产型应用" :
                     type === "non_productive" ? "非生产型应用" : "中性应用"}
                  </CardTitle>
                  <CardDescription>
                    查看{type === "productive" ? "生产型" :
                         type === "non_productive" ? "非生产型" : "中性"}应用的使用情况
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-[300px] flex items-center justify-center">
                      <p>加载中...</p>
                    </div>
                  ) : getFilteredApps().length ? (
                    <AppList 
                      apps={getFilteredApps()} 
                      totalTime={appUsageData?.total_time_seconds || 0}
                      showCategory={false}
                    />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p>暂无数据</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
} 