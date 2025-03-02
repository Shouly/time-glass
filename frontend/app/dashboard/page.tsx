import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  FileText,
  Globe,
  Laptop,
  PieChart,
  TrendingUp,
  Users
} from "lucide-react";

export default function Dashboard() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="container py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
            <p className="text-muted-foreground">
              查看您的时间使用情况和生产力分析
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="productivity">生产力</TabsTrigger>
              <TabsTrigger value="applications">应用使用</TabsTrigger>
              <TabsTrigger value="reports">报告</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* 概览统计卡片 */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">今日使用时间</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">5小时32分钟</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 inline-flex items-center">
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                        +12%
                      </span>{" "}
                      相比昨天
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">生产力得分</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">78%</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 inline-flex items-center">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        +5%
                      </span>{" "}
                      相比上周
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">专注时间</CardTitle>
                    <PieChart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3小时15分钟</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-red-500 inline-flex items-center">
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                        -8%
                      </span>{" "}
                      相比昨天
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">分心次数</CardTitle>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24次</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-500 inline-flex items-center">
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                        -15%
                      </span>{" "}
                      相比昨天
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* 时间使用图表 */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>时间使用趋势</CardTitle>
                    <CardDescription>
                      过去7天的时间使用情况
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                      <p className="text-muted-foreground">时间趋势图表</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>应用分布</CardTitle>
                    <CardDescription>
                      按应用类别的时间分布
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
                      <p className="text-muted-foreground">应用分布图表</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 最近活动 */}
              <Card>
                <CardHeader>
                  <CardTitle>最近活动</CardTitle>
                  <CardDescription>
                    您最近使用的应用和网站
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                        <div className="p-2 rounded-md bg-primary/10">
                          {activity.icon}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{activity.name}</p>
                          <p className="text-sm text-muted-foreground">{activity.category}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">{activity.duration}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="productivity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>生产力分析</CardTitle>
                  <CardDescription>
                    查看您的生产力指标和改进建议
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
                    <p className="text-muted-foreground">生产力分析内容将在此显示</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="applications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>应用使用情况</CardTitle>
                  <CardDescription>
                    查看您使用各个应用的时间统计
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
                    <p className="text-muted-foreground">应用使用统计将在此显示</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>报告</CardTitle>
                  <CardDescription>
                    查看和下载详细的时间使用报告
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md">
                    <p className="text-muted-foreground">报告内容将在此显示</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}

const recentActivities = [
  {
    icon: <Laptop className="h-4 w-4 text-primary" />,
    name: "Visual Studio Code",
    category: "开发工具",
    duration: "2小时15分钟"
  },
  {
    icon: <Globe className="h-4 w-4 text-primary" />,
    name: "Google Chrome",
    category: "网页浏览",
    duration: "1小时32分钟"
  },
  {
    icon: <FileText className="h-4 w-4 text-primary" />,
    name: "Microsoft Word",
    category: "文档编辑",
    duration: "45分钟"
  },
  {
    icon: <Users className="h-4 w-4 text-primary" />,
    name: "Zoom",
    category: "会议",
    duration: "30分钟"
  }
]; 