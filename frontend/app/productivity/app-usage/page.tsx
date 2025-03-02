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
import { formatTimeSpent } from "@/lib/utils"
import { addDays, format } from "date-fns"
import { BarChart2, ChevronLeft, ChevronRight, Clock, PieChart, Search } from "lucide-react"
import { useState } from "react"
import { DateRange } from "react-day-picker"

// 模拟数据
const mockAppUsageData = {
  total_time_seconds: 28560, // 7小时56分钟
  apps: [
    {
      app_name: "Cursor",
      total_time_seconds: 19380, // 5小时23分钟
      percentage: 67.86,
      session_count: 12,
      avg_session_time: 1615,
      productivity_type: "productive",
      icon_path: "https://cursor.sh/apple-touch-icon.png"
    },
    {
      app_name: "Arc",
      total_time_seconds: 4080, // 1小时8分钟
      percentage: 14.29,
      session_count: 8,
      avg_session_time: 510,
      productivity_type: "productive",
      icon_path: "https://arc.net/favicon.ico"
    },
    {
      app_name: "iTerm",
      total_time_seconds: 2100, // 35分钟
      percentage: 7.35,
      session_count: 15,
      avg_session_time: 140,
      productivity_type: "productive",
      icon_path: "https://iterm2.com/favicon.ico"
    },
    {
      app_name: "DB Browser for SQLite",
      total_time_seconds: 1080, // 18分钟
      percentage: 3.78,
      session_count: 3,
      avg_session_time: 360,
      productivity_type: "productive"
    },
    {
      app_name: "Sublime Text",
      total_time_seconds: 240, // 4分钟
      percentage: 0.84,
      session_count: 2,
      avg_session_time: 120,
      productivity_type: "productive",
      icon_path: "https://www.sublimetext.com/favicon.ico"
    },
    {
      app_name: "系统设置",
      total_time_seconds: 120, // 2分钟
      percentage: 0.42,
      session_count: 1,
      avg_session_time: 120,
      productivity_type: "neutral"
    },
    {
      app_name: "钉钉",
      total_time_seconds: 60, // 1分钟
      percentage: 0.21,
      session_count: 2,
      avg_session_time: 30,
      productivity_type: "neutral",
      icon_path: "https://img.alicdn.com/imgextra/i4/O1CN01XQpsmx1EUAr9NAqja_!!6000000000354-73-tps-64-64.ico"
    },
    {
      app_name: "访达",
      total_time_seconds: 60, // 1分钟
      percentage: 0.21,
      session_count: 3,
      avg_session_time: 20,
      productivity_type: "neutral"
    },
    {
      app_name: "活动监视器",
      total_time_seconds: 40, // 40秒
      percentage: 0.14,
      session_count: 1,
      avg_session_time: 40,
      productivity_type: "neutral"
    }
  ],
  categories: [
    {
      category: "productive",
      total_time_seconds: 26880, // 7小时7分钟
      percentage: 94.12,
      apps: ["Cursor", "Arc", "iTerm", "DB Browser for SQLite", "Sublime Text"]
    },
    {
      category: "neutral",
      total_time_seconds: 1380, // 23分钟
      percentage: 4.83,
      apps: ["系统设置", "访达", "活动监视器", "钉钉"]
    },
    {
      category: "distracting",
      total_time_seconds: 39, // 39秒
      percentage: 0.14,
      apps: ["社交媒体"]
    }
  ]
};

// 模拟每日使用数据
const mockDailyData = [
  { day: "日", hours: 0 },
  { day: "一", hours: 7.2 },
  { day: "二", hours: 7.8 },
  { day: "三", hours: 8.1 },
  { day: "四", hours: 7.5 },
  { day: "五", hours: 8.9 },
  { day: "六", hours: 7.93 }
];

// 模拟每小时使用数据
const mockHourlyData = Array.from({ length: 24 }, (_, i) => {
  let minutes = 0;

  // 模拟工作时间段的使用情况
  if (i >= 9 && i <= 18) {
    minutes = Math.floor(Math.random() * 40) + 20;
  } else if (i >= 19 && i <= 22) {
    minutes = Math.floor(Math.random() * 20);
  }

  return {
    hour: `${i}时`,
    productive: i >= 12 && i <= 18 ? minutes : 0,
    neutral: i >= 9 && i <= 20 ? Math.floor(Math.random() * 5) : 0,
    social: i >= 12 && i <= 22 ? Math.floor(Math.random() * 2) : 0
  };
});

// 设置12-18点的数据更符合图片
mockHourlyData[12].productive = 45;
mockHourlyData[13].productive = 55;
mockHourlyData[14].productive = 55;
mockHourlyData[15].productive = 40;
mockHourlyData[16].productive = 50;
mockHourlyData[17].productive = 50;
mockHourlyData[18].productive = 20;
mockHourlyData[19].productive = 40;
mockHourlyData[20].productive = 15;

// 饼图数据
const pieChartData = [
  { name: "生产型应用", value: 26880, color: "#22c55e" },
  { name: "中性应用", value: 1380, color: "#3b82f6" },
  { name: "干扰型应用", value: 39, color: "#ef4444" }
];

export default function AppUsagePage() {
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: today,
    to: today,
  })

  const [appUsageData] = useState(mockAppUsageData)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")

  // 模拟日期切换
  const handleDateChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    // 在实际应用中，这里会触发数据重新加载
  }

  // 日期导航
  const handlePrevDay = () => {
    if (dateRange?.from) {
      const prevDay = addDays(dateRange.from, -1);
      setDateRange({
        from: prevDay,
        to: prevDay
      });
    }
  }

  const handleNextDay = () => {
    if (dateRange?.from) {
      const nextDay = addDays(dateRange.from, 1);
      const today = new Date();

      // 不允许选择未来日期
      if (nextDay <= today) {
        setDateRange({
          from: nextDay,
          to: nextDay
        });
      }
    }
  }

  // 过滤应用列表
  const getFilteredApps = () => {
    if (!appUsageData) return []

    let filtered = appUsageData.apps;

    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.app_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (activeTab === "productive") {
      filtered = filtered.filter(app => app.productivity_type === "productive")
    } else if (activeTab === "distracting") {
      filtered = filtered.filter(app => app.productivity_type === "DISTRACTING")
    } else if (activeTab === "neutral") {
      filtered = filtered.filter(app => app.productivity_type === "neutral")
    }

    return filtered;
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">应用使用分析</h1>
            <p className="text-muted-foreground">
              今天 21:05 更新
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
                    const date = new Date(value);
                    handleDateChange({ from: date, to: date });
                  }}
                >
                  <SelectTrigger className="w-[160px] h-10 border rounded-md">
                    <SelectValue>
                      {dateRange?.from ? (
                        dateRange.from.toDateString() === new Date().toDateString()
                          ? "今天"
                          : format(dateRange.from, "yyyy年M月d日")
                      ) : "选择日期"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={new Date().toISOString()}>今天</SelectItem>
                    <SelectItem value={addDays(new Date(), -1).toISOString()}>昨天</SelectItem>
                    <SelectItem value={addDays(new Date(), -2).toISOString()}>前天</SelectItem>
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
                {formatTimeSpent(appUsageData.total_time_seconds)}
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
                {formatTimeSpent(appUsageData.categories[0].total_time_seconds)}
              </div>
              <p className="text-xs text-muted-foreground">
                占总时间的 {Math.round(appUsageData.categories[0].percentage)}%
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
                {formatTimeSpent(appUsageData.categories[1].total_time_seconds)}
              </div>
              <p className="text-xs text-muted-foreground">
                占总时间的 {Math.round(appUsageData.categories[1].percentage)}%
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
                {formatTimeSpent(appUsageData.categories[2].total_time_seconds)}
              </div>
              <p className="text-xs text-muted-foreground">
                占总时间的 {Math.round(appUsageData.categories[2].percentage)}%
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="productive">效率与财务</TabsTrigger>
            <TabsTrigger value="neutral">其他</TabsTrigger>
            <TabsTrigger value="distracting">社交</TabsTrigger>
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
                  <DailyUsageBarChart data={mockDailyData} height={250} />
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
                    data={pieChartData}
                    totalTime={appUsageData.total_time_seconds}
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
                <HourlyUsageChart data={mockHourlyData} height={250} />
              </CardContent>
            </Card>
          </TabsContent>

          {["overview", "productive", "neutral", "distracting"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              <Card className="border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>
                      {tab === "overview" ? "显示App" :
                        tab === "productive" ? "效率与财务" :
                          tab === "neutral" ? "其他" : "干扰型"}
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
                        {getFilteredApps().map((app, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="py-3 flex items-center">
                              {app.icon_path ? (
                                <img src={app.icon_path} alt={app.app_name} className="w-8 h-8 mr-3 rounded-md shadow-sm" />
                              ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md shadow-sm flex items-center justify-center text-gray-500 mr-3">
                                  {app.app_name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div className="font-medium">{app.app_name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {app.productivity_type === "productive" ? "效率与财务" :
                                    app.productivity_type === "neutral" ? "其他" : "社交"}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 font-medium">{formatTimeSpent(app.total_time_seconds)}</td>
                            <td className="py-3">
                              <div className="flex items-center">
                                <div className="w-16 h-2 bg-gray-100 rounded-full mr-2">
                                  <div
                                    className={`h-full rounded-full ${app.productivity_type === "productive" ? "bg-green-500" :
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