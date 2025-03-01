import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BarChart2, ArrowRight, Award, PieChart, Users, Zap, Monitor, TrendingUp, LineChart } from "lucide-react";
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
                  员工生产力分析平台
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  全面监控、深入分析、优化员工工作效率，提升企业整体生产力
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-1">
                    进入仪表盘 <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/productivity">
                  <Button size="lg" variant="outline" className="gap-1">
                    生产力分析
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px]">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] md:w-[300px] md:h-[300px] bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-[200px] h-[200px] md:w-[250px] md:h-[250px] bg-primary/20 rounded-full flex items-center justify-center">
                    <div className="w-[150px] h-[150px] md:w-[200px] md:h-[200px] bg-primary/30 rounded-full flex items-center justify-center">
                      <BarChart2 className="w-20 h-20 text-primary" />
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
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">全方位员工生产力分析</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                我们的平台提供多维度分析，帮助企业了解员工工作状态，优化资源配置
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
                {feature.link && (
                  <CardFooter>
                    <Link href={feature.link} className="text-sm text-primary flex items-center">
                      了解更多 <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full py-12 md:py-24 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm">企业收益</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">为什么选择我们的平台？</h2>
              <p className="max-w-[700px] text-muted-foreground">
                通过数据驱动的洞察，帮助企业做出更明智的决策，提高整体效率
              </p>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex flex-col items-start gap-2 rounded-lg border bg-background p-6 shadow-sm">
                <div className="p-2 rounded-md bg-primary/10">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-semibold">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
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
                准备好提升团队生产力了吗？
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                立即开始使用我们的员工生产力分析平台，发现优化机会，提高团队效率
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/dashboard">
                <Button size="lg" className="gap-1">
                  进入仪表盘 <ArrowRight className="h-4 w-4" />
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
    icon: <BarChart2 className="h-5 w-5 text-primary" />,
    title: "应用使用分析",
    description: "监控软件使用情况",
    content: "追踪员工使用各类应用的时间，识别高效工具和潜在的时间浪费源。",
    link: "/productivity/app-usage"
  },
  {
    icon: <Monitor className="h-5 w-5 text-primary" />,
    title: "UI监控",
    description: "实时界面活动追踪",
    content: "监控员工界面活动，了解工作流程中的瓶颈和低效环节。",
    link: "/ui-monitoring"
  },
  {
    icon: <TrendingUp className="h-5 w-5 text-primary" />,
    title: "趋势分析",
    description: "长期使用变化",
    content: "追踪团队和个人应用使用的长期变化趋势，评估管理决策和工作环境变化的影响。"
  },
  {
    icon: <Users className="h-5 w-5 text-primary" />,
    title: "团队对比",
    description: "跨团队应用使用比较",
    content: "比较不同团队和部门的应用使用指标，识别最佳实践和改进机会。"
  }
];

const benefits = [
  {
    icon: <Zap className="h-5 w-5 text-primary" />,
    title: "提高员工效率",
    description: "通过识别低效工作模式和时间浪费，帮助员工提高工作效率，平均可提升15-30%的生产力。"
  },
  {
    icon: <LineChart className="h-5 w-5 text-primary" />,
    title: "优化资源分配",
    description: "基于数据分析，合理分配工作任务和资源，减少瓶颈，提高整体团队产出。"
  },
  {
    icon: <PieChart className="h-5 w-5 text-primary" />,
    title: "降低软件成本",
    description: "分析软件使用情况，识别未充分利用的许可证，平均可节省10-20%的软件支出。"
  },
  {
    icon: <Users className="h-5 w-5 text-primary" />,
    title: "改善团队协作",
    description: "发现团队协作中的障碍，优化沟通渠道和工作流程，提高团队凝聚力。"
  },
  {
    icon: <Award className="h-5 w-5 text-primary" />,
    title: "客观绩效评估",
    description: "提供基于数据的客观绩效指标，帮助管理者进行公平、透明的员工评估。"
  },
  {
    icon: <TrendingUp className="h-5 w-5 text-primary" />,
    title: "持续改进",
    description: "通过长期数据分析，持续识别改进机会，建立不断优化的工作文化。"
  }
];
