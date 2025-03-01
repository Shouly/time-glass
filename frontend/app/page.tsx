import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">欢迎使用 Time Glass</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <Card>
            <CardHeader>
              <CardTitle>时间管理</CardTitle>
              <CardDescription>追踪和管理您的时间</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Time Glass 帮助您更有效地管理时间，提高工作效率。</p>
            </CardContent>
            <CardFooter>
              <Button>开始使用</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>数据分析</CardTitle>
              <CardDescription>了解您的时间使用情况</CardDescription>
            </CardHeader>
            <CardContent>
              <p>通过直观的图表和报告，分析您的时间使用模式。</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline">查看演示</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
