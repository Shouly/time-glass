"use client"

import { DailyUsageBarChart } from "@/components/charts/app-usage-bar-chart"
import { AppUsagePieChart } from "@/components/charts/app-usage-pie-chart"
import { HourlyUsageChart } from "@/components/charts/hourly-usage-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatPercentage, formatTimeSpent, getProductivityColor } from "@/lib/utils"
import { addDays, format, subDays } from "date-fns"
import { BarChart2, ChevronLeft, ChevronRight, Clock, PieChart, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { DateRange } from "react-day-picker"
import { AppUsageApi, ProductivitySummary, AppCategory, DailyAppUsage, ProductivityType, HourlyUsageSummary } from '@/lib/app-usage-api'

export default function AppUsagePage() {
  const today = new Date()
  const yesterday = subDays(today, 1)
  
  // 状态管理
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: yesterday,
    to: yesterday,
  })
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // 数据状态
  const [appCategories, setAppCategories] = useState<AppCategory[]>([])
  const [productivitySummary, setProductivitySummary] = useState<ProductivitySummary | null>(null)
  const [dailyUsage, setDailyUsage] = useState<DailyAppUsage[]>([])
  const [hourlyData, setHourlyData] = useState<HourlyUsageSummary[]>([])
  const [weeklyData, setWeeklyData] = useState<any[]>([])

  // 获取数据的函数
  const fetchData = async () => {
    if (!dateRange?.from || !dateRange?.to) return
    
    setIsLoading(true)
    try {
      // 获取生产力摘要
      const startDateStr = format(dateRange.from, 'yyyy-MM-dd')
      const endDateStr = format(dateRange.to, 'yyyy-MM-dd')
      
      // 使用API函数获取生产力摘要
      const summaryData = await AppUsageApi.getProductivitySummary(startDateStr, endDateStr)
      setProductivitySummary(summaryData)
      
      // 使用API函数获取每日应用使用情况
      const dailyData = await AppUsageApi.getDailyAppUsage(startDateStr, endDateStr)
      setDailyUsage(dailyData)
      
      // 使用API函数获取小时数据
      const hourlyData = await AppUsageApi.getHourlyUsage(startDateStr)
      setHourlyData(hourlyData)
      
      // 使用API函数获取应用分类
      const categoriesData = await AppUsageApi.getAppCategories()
      setAppCategories(categoriesData.items)
      
      // 获取周数据（过去7天）
      await fetchWeeklyData()
    } catch (error) {
      console.error('获取数据失败:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // 获取周数据
  const fetchWeeklyData = async () => {
    if (!dateRange?.from) return
    
    try {
      const endDate = dateRange.from
      const startDate = subDays(endDate, 6)
      
      // 使用API函数获取每日应用使用情况
      const data = await AppUsageApi.getDailyAppUsage(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
      )
      
      // 处理周数据
      const weekDays = ['日', '一', '二', '三', '四', '五', '六']
      const processedData = []
      
      // 按日期分组并计算总时间
      const groupedByDate = data.reduce((acc: any, item: DailyAppUsage) => {
        const date = item.date
        if (!acc[date]) {
          acc[date] = 0
        }
        acc[date] += item.total_minutes
        return acc
      }, {})
      
      // 转换为图表数据格式
      for (let i = 0; i < 7; i++) {
        const date = format(subDays(endDate, 6 - i), 'yyyy-MM-dd')
        const dayOfWeek = new Date(date).getDay()
        const hours = (groupedByDate[date] || 0) / 60
        
        processedData.push({
          day: weekDays[dayOfWeek],
          hours: parseFloat(hours.toFixed(1))
        })
      }
      
      setWeeklyData(processedData)
    } catch (error) {
      console.error('获取周数据失败:', error)
    }
  }

  // 日期变更处理
  const handleDateChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange)
  }

  // 日期导航
  const handlePrevDay = () => {
    if (dateRange?.from) {
      const prevDay = subDays(dateRange.from, 1)
      setDateRange({
        from: prevDay,
        to: prevDay
      })
    }
  }

  const handleNextDay = () => {
    if (dateRange?.from) {
      const nextDay = addDays(dateRange.from, 1)
      const today = new Date()

      // 不允许选择未来日期
      if (nextDay <= today) {
        setDateRange({
          from: nextDay,
          to: nextDay
        })
      }
    }
  }

  // 过滤应用列表
  const getFilteredApps = () => {
    if (!dailyUsage) return []

    // 按应用名称分组
    const appGroups = dailyUsage.reduce((acc: any, item: DailyAppUsage) => {
      const key = item.app_name
      if (!acc[key]) {
        acc[key] = {
          app_name: item.app_name,
          category_id: item.category_id,
          category_name: item.category_name,
          productivity_type: item.productivity_type,
          total_minutes: 0,
          session_count: 0 // 假设会话数据，实际应从后端获取
        }
      }
      acc[key].total_minutes += item.total_minutes
      acc[key].session_count += 1 // 简化处理，实际应从后端获取
      return acc
    }, {})
    
    // 转换为数组并计算百分比
    let apps = Object.values(appGroups)
    const totalMinutes = apps.reduce((sum: number, app: any) => sum + app.total_minutes, 0)
    
    apps = apps.map((app: any) => ({
      ...app,
      total_time_seconds: app.total_minutes * 60,
      percentage: (app.total_minutes / totalMinutes) * 100,
      avg_session_time: (app.total_minutes * 60) / app.session_count
    }))
    
    // 应用搜索过滤
    if (searchTerm) {
      apps = apps.filter((app: any) =>
        app.app_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 按标签过滤
    if (activeTab === "productive") {
      apps = apps.filter((app: any) => app.productivity_type === "PRODUCTIVE")
    } else if (activeTab === "neutral") {
      apps = apps.filter((app: any) => app.productivity_type === "NEUTRAL")
    } else if (activeTab === "distracting") {
      apps = apps.filter((app: any) => app.productivity_type === "DISTRACTING")
    }

    // 按使用时间排序
    return apps.sort((a: any, b: any) => b.total_minutes - a.total_minutes)
  }
  
  // 准备饼图数据
  const getPieChartData = () => {
    if (!productivitySummary) return []
    
    return [
      { name: "生产型应用", value: productivitySummary.productive_minutes * 60, color: "#22c55e" },
      { name: "中性应用", value: productivitySummary.neutral_minutes * 60, color: "#3b82f6" },
      { name: "干扰型应用", value: productivitySummary.distracting_minutes * 60, color: "#ef4444" }
    ]
  }
  
  // 数据加载
  useEffect(() => {
    fetchData()
  }, [dateRange])

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">应用使用分析</h1>
            <p className="text-muted-foreground">
              {isLoading ? "加载中..." : `${format(new Date(), 'yyyy-MM-dd HH:mm')} 更新`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevDay}
                className="h-8 w-8 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="relative">
                <Select
                  value={dateRange?.from?.toISOString()}
                  onValueChange={(value) => {
                    const date = new Date(value)
                    handleDateChange({ from: date, to: date })
                  }}
                >
                  <SelectTrigger className="w-[160px] h-10 border rounded-md">
                    <SelectValue>
                      {dateRange?.from ? (
                        dateRange.from.toDateString() === new Date().toDateString()
                          ? "今天"
                          : dateRange.from.toDateString() === yesterday.toDateString()
                            ? "昨天"
                            : format(dateRange.from, "yyyy年M月d日")
                      ) : "选择日期"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={new Date().toISOString()}>今天</SelectItem>
                    <SelectItem value={yesterday.toISOString()}>昨天</SelectItem>
                    <SelectItem value={subDays(new Date(), 2).toISOString()}>前天</SelectItem>
                    <div className="px-2 py-1.5 border-t">
                      <DateRangePicker
                        value={dateRange}
                        onChange={handleDateChange}
                        className="w-auto"
                        singleDay={true}
                      />
                    </div>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextDay}
                className="h-8 w-8 rounded-full"
                disabled={dateRange?.from && dateRange.from.toDateString() === new Date().toDateString()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 概览统计卡片 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总使用时间</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {productivitySummary ? formatTimeSpent(productivitySummary.total_minutes * 60) : "加载中..."}
              </div>
              <p className="text-xs text-muted-foreground">
                {dateRange?.from && dateRange.from.toDateString() === new Date().toDateString()
                  ? "今天"
                  : dateRange?.from ? format(dateRange.from, "yyyy年M月d日") : ""}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">生产型应用时间</CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                <BarChart2 className="h-4 w-4 text-green-600 dark:text-green-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {productivitySummary ? formatTimeSpent(productivitySummary.productive_minutes * 60) : "加载中..."}
              </div>
              <p className="text-xs text-muted-foreground">
                占总时间的 {productivitySummary ? Math.round(productivitySummary.productive_percentage) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">中性应用时间</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                <PieChart className="h-4 w-4 text-blue-600 dark:text-blue-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {productivitySummary ? formatTimeSpent(productivitySummary.neutral_minutes * 60) : "加载中..."}
              </div>
              <p className="text-xs text-muted-foreground">
                占总时间的 {productivitySummary ? Math.round(productivitySummary.neutral_percentage) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">干扰型应用时间</CardTitle>
              <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center">
                <Clock className="h-4 w-4 text-red-600 dark:text-red-300" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {productivitySummary ? formatTimeSpent(productivitySummary.distracting_minutes * 60) : "加载中..."}
              </div>
              <p className="text-xs text-muted-foreground">
                占总时间的 {productivitySummary ? Math.round(productivitySummary.distracting_percentage) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="productive">生产型</TabsTrigger>
            <TabsTrigger value="neutral">中性</TabsTrigger>
            <TabsTrigger value="distracting">干扰型</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* 每日使用图表 */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle>每日使用时间</CardTitle>
                  <CardDescription>
                    过去一周的应用使用时间分布
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DailyUsageBarChart data={weeklyData} height={250} />
                </CardContent>
              </Card>

              {/* 应用类别分布 */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle>应用类别分布</CardTitle>
                  <CardDescription>
                    按生产力类型划分的使用时间
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AppUsagePieChart
                    data={getPieChartData()}
                    totalTime={productivitySummary ? productivitySummary.total_minutes * 60 : 0}
                    height={250}
                  />
                </CardContent>
              </Card>
            </div>

            {/* 每小时使用图表 */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle>每小时使用分布</CardTitle>
                <CardDescription>
                  一天中不同时段的应用使用情况
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HourlyUsageChart data={hourlyData} height={250} />
              </CardContent>
            </Card>
          </TabsContent>

          {["overview", "productive", "neutral", "distracting"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              <Card className="border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>
                      {tab === "overview" ? "所有应用" :
                        tab === "productive" ? "生产型应用" :
                          tab === "neutral" ? "中性应用" : "干扰型应用"}
                    </CardTitle>
                    <CardDescription>
                      {tab === "overview" ? "所有应用的使用情况" :
                        tab === "productive" ? "提高工作效率的应用" :
                          tab === "neutral" ? "工作辅助类应用" : "可能分散注意力的应用"}
                    </CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Input
                      type="text"
                      placeholder="搜索应用..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rounded-full border-0 bg-muted/50 focus-visible:ring-1 focus-visible:ring-offset-0"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 font-medium">应用</th>
                          <th className="text-left py-3 font-medium">使用时间</th>
                          <th className="text-left py-3 font-medium">占比</th>
                          <th className="text-left py-3 font-medium">会话数</th>
                          <th className="text-left py-3 font-medium">平均会话时长</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredApps().map((app: any, index: number) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="py-3 flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md shadow-sm flex items-center justify-center text-gray-500 mr-3">
                                {app.app_name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium">{app.app_name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {app.category_name || (
                                    app.productivity_type === "PRODUCTIVE" ? "生产型" :
                                    app.productivity_type === "NEUTRAL" ? "中性" : "干扰型"
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 font-medium">{formatTimeSpent(app.total_time_seconds)}</td>
                            <td className="py-3">
                              <div className="flex items-center">
                                <div className="w-16 h-2 bg-gray-100 rounded-full mr-2">
                                  <div
                                    className={`h-full rounded-full ${
                                      app.productivity_type === "PRODUCTIVE" ? "bg-green-500" :
                                      app.productivity_type === "DISTRACTING" ? "bg-red-500" : "bg-blue-500"
                                    }`}
                                    style={{ width: `${app.percentage}%` }}
                                  />
                                </div>
                                <span>{app.percentage.toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="py-3">{app.session_count}</td>
                            <td className="py-3">{formatTimeSpent(app.avg_session_time)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
} 