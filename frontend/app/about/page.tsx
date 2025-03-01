import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">关于 Time Glass</h1>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">我们的使命</h2>
          <p className="mb-4">
            Time Glass 致力于帮助人们更好地管理和利用他们的时间。在这个快节奏的世界中，时间是最宝贵的资源，
            我们希望通过提供直观、易用的工具，帮助用户了解自己的时间去向，提高工作效率，实现更好的工作与生活平衡。
          </p>
          <p>
            我们相信，通过可视化时间使用情况和提供有针对性的建议，每个人都可以更有意识地使用时间，
            专注于真正重要的事情，减少时间浪费，提高生活质量。
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">核心功能</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>时间追踪 - 记录您在不同活动上花费的时间</li>
            <li>数据分析 - 通过图表和报告了解您的时间使用模式</li>
            <li>目标设定 - 设定时间管理目标并追踪进度</li>
            <li>提醒功能 - 帮助您保持专注和按时完成任务</li>
            <li>多平台支持 - 在任何设备上访问您的数据</li>
          </ul>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">联系我们</h2>
          <p>
            如果您有任何问题、建议或反馈，请随时联系我们：
            <br />
            <a href="mailto:contact@timeglass.app" className="text-primary hover:underline">
              contact@timeglass.app
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 