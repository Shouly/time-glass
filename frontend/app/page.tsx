import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BarChart2, ArrowRight, Calendar, PieChart, Settings, Users, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
        <div className="container px-4 md:px-6 space-y-10 xl:space-y-16">
          <div className="grid gap-4 px-4 sm:px-6 md:px-10 md:grid-cols-2 md:gap-16">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Time Glass
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  智能时间管理与分析平台，帮助您更高效地利用每一分钟
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-1">
                    开始使用 <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/ui-monitoring">
                  <Button size="lg" variant="outline" className="gap-1">
                    查看监控数据
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px]">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] md:w-[300px] md:h-[300px] bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-[200px] h-[200px] md:w-[250px] md:h-[250px] bg-primary/20 rounded-full flex items-center justify-center">
                    <div className="w-[150px] h-[150px] md:w-[200px] md:h-[200px] bg-primary/30 rounded-full flex items-center justify-center">
                      <Clock className="w-20 h-20 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">核心功能</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">全方位时间管理解决方案</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Time Glass 提供多种功能，帮助您更好地理解和管理时间
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8 md:mt-16">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-md">
                <CardHeader>
                  <div className="p-2 w-fit rounded-md bg-primary/10 mb-2">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                准备好提升您的时间管理能力了吗？
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                立即开始使用 Time Glass，发现您的时间使用模式，提高工作效率
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/dashboard">
                <Button size="lg" className="gap-1">
                  开始使用 <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline">
                  了解更多
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const features = [
  {
    icon: <Clock className="h-5 w-5 text-primary" />,
    title: "时间追踪",
    description: "自动记录您的活动",
    content: "Time Glass 自动追踪您在不同应用和网站上花费的时间，无需手动记录。"
  },
  {
    icon: <BarChart2 className="h-5 w-5 text-primary" />,
    title: "数据分析",
    description: "深入了解时间使用情况",
    content: "通过直观的图表和报告，分析您的时间使用模式，发现提高效率的机会。"
  },
  {
    icon: <Calendar className="h-5 w-5 text-primary" />,
    title: "日程规划",
    description: "优化您的日程安排",
    content: "基于您的使用习惯，提供智能建议，帮助您更合理地安排时间。"
  },
  {
    icon: <PieChart className="h-5 w-5 text-primary" />,
    title: "分类统计",
    description: "按类别查看时间分配",
    content: "将您的活动自动分类，让您清楚了解时间花在了哪些类型的任务上。"
  },
  {
    icon: <Users className="h-5 w-5 text-primary" />,
    title: "团队协作",
    description: "提高团队效率",
    content: "团队版功能允许管理者了解团队时间分配，优化工作流程。"
  },
  {
    icon: <Zap className="h-5 w-5 text-primary" />,
    title: "生产力提升",
    description: "专注于重要任务",
    content: "设置目标和提醒，减少分心，提高工作专注度和生产力。"
  }
];
