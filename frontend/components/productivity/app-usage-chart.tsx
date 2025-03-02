"use client"

import { formatPercentage, formatTimeSpent } from "@/lib/utils"
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps
} from "recharts"

interface AppUsageChartProps {
  data: {
    name: string
    value: number
    percentage: number
    color: string
    type?: string
  }[]
  totalTime: number
}

export function AppUsageChart({ data, totalTime }: AppUsageChartProps) {
  const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f43f5e"]

  const CustomTooltip = ({
    active,
    payload,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const app = payload[0]?.payload

      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{app.name}</p>
          <p className="text-sm">
            使用时间: {formatTimeSpent(app.value)}
          </p>
          <p className="text-sm">
            占比: {formatPercentage(app.value, totalTime)}
          </p>
          {app.type && (
            <p className="text-sm mt-1">
              类型: {app.type === "productive" ? "生产型" :
                app.type === "non_productive" ? "非生产型" : "中性"}
            </p>
          )}
        </div>
      )
    }

    return null
  }

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number
    cy: number
    midAngle: number
    innerRadius: number
    outerRadius: number
    percent: number
  }) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color || COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
} 