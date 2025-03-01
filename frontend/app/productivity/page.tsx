import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, BarChart2, Award, ArrowRight } from "lucide-react"

export default function ProductivityPage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">员工生产力分析</h1>
          <p className="text-muted-foreground">
            全面了解您的工作时间分配和生产力情况
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="mt-4">工作时间分析</CardTitle>
              <CardDescription>
                追踪员工在不同应用和任务上花费的时间
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                查看每日、每周和每月的时间使用报告，了解时间分配情况，识别工作模式和趋势。
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/productivity/time-analysis" className="flex items-center justify-between">
                  查看分析
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <BarChart2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="mt-4">应用使用分析</CardTitle>
              <CardDescription>
                识别最常用的应用程序和工具
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                分析应用程序使用情况，了解员工使用哪些工具，优化软件许可证分配，提高工作效率。
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/productivity/app-usage" className="flex items-center justify-between">
                  查看分析
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="mt-4">生产力评分</CardTitle>
              <CardDescription>
                基于应用分类计算生产力得分
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                通过预设的应用分类（生产型/非生产型），计算生产力得分，跟踪生产力趋势，提供改进建议。
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/productivity/score" className="flex items-center justify-between">
                  查看评分
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>员工生产力分析平台</CardTitle>
              <CardDescription>
                全面了解员工工作习惯和生产力
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  我们的员工生产力分析平台提供了全面的工具，帮助您了解员工的工作习惯和生产力情况。通过收集和分析员工在不同应用和任务上花费的时间，我们可以帮助您：
                </p>
                
                <ul className="list-disc pl-6 space-y-2">
                  <li>识别工作中的时间浪费和效率低下的环节</li>
                  <li>优化软件许可证分配，确保资源得到充分利用</li>
                  <li>了解员工的工作模式和生产力趋势</li>
                  <li>提供数据支持的改进建议，提高整体工作效率</li>
                  <li>帮助员工更好地管理时间，提高工作满意度</li>
                </ul>
                
                <p>
                  通过我们的平台，您可以获取实时数据和深入分析，做出更明智的决策，提高团队的生产力和效率。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}