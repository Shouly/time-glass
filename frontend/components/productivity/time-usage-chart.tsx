"use client"

import React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from "recharts"
import { secondsToHours, formatTimeSpent } from "@/lib/utils"

interface TimeUsageChartProps {
  data: {
    name: string
    productive: number
    nonProductive: number
    neutral: number
  }[]
  type: "daily" | "hourly"
}

export function TimeUsageChart({ data, type }: TimeUsageChartProps) {
  const formatXAxis = (value: string) => {
    if (type === "hourly") {
      return `${value}时`
    }
    return value
  }

  const formatYAxis = (value: number) => {
    return `${value}小时`
  }

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const productive = payload[0]?.value || 0
      const nonProductive = payload[1]?.value || 0
      const neutral = payload[2]?.value || 0
      const total = productive + nonProductive + neutral

      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{type === "hourly" ? `${label}时` : label}</p>
          <p className="text-sm text-green-600">
            生产型: {formatTimeSpent(productive * 3600)}
          </p>
          <p className="text-sm text-red-600">
            非生产型: {formatTimeSpent(nonProductive * 3600)}
          </p>
          <p className="text-sm text-blue-600">
            中性: {formatTimeSpent(neutral * 3600)}
          </p>
          <p className="text-sm font-medium mt-1 border-t pt-1">
            总计: {formatTimeSpent(total * 3600)}
          </p>
        </div>
      )
    }

    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
        stackOffset="none"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tickFormatter={formatXAxis} />
        <YAxis tickFormatter={formatYAxis} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          name="生产型"
          dataKey="productive"
          stackId="a"
          fill="#22c55e"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          name="非生产型"
          dataKey="nonProductive"
          stackId="a"
          fill="#ef4444"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          name="中性"
          dataKey="neutral"
          stackId="a"
          fill="#3b82f6"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
} 