"use client"

import React from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from "recharts"
import { formatTimeSpent } from "@/lib/utils"

interface ProductivityScoreProps {
  data: {
    date: string
    score: number
    productive: number
    nonProductive: number
    neutral: number
    total: number
  }[]
}

export function ProductivityScoreChart({ data }: ProductivityScoreProps) {
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const item = payload[0]?.payload
      
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm font-medium">
            生产力得分: {item.score}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-sm text-green-600">
              生产型: {formatTimeSpent(item.productive)}
            </p>
            <p className="text-sm text-red-600">
              非生产型: {formatTimeSpent(item.nonProductive)}
            </p>
            <p className="text-sm text-blue-600">
              中性: {formatTimeSpent(item.neutral)}
            </p>
            <p className="text-sm font-medium mt-1 border-t pt-1">
              总计: {formatTimeSpent(item.total)}
            </p>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 100]} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="score"
          name="生产力得分"
          stroke="#8b5cf6"
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

interface ProductivityScoreCardProps {
  score: number
  previousScore?: number
  productive: number
  nonProductive: number
  neutral: number
  total: number
}

export function ProductivityScoreCard({
  score,
  previousScore,
  productive,
  nonProductive,
  neutral,
  total
}: ProductivityScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    if (score >= 40) return "text-orange-600"
    return "text-red-600"
  }

  const getScoreChange = () => {
    if (!previousScore) return null
    
    const change = score - previousScore
    const isPositive = change > 0
    
    return (
      <div className={`flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? "+" : ""}{change.toFixed(1)}
        <span className="ml-1">
          {isPositive ? "↑" : "↓"}
        </span>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg border shadow-sm">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium">生产力得分</h3>
        {getScoreChange()}
      </div>
      
      <div className="mt-4 flex items-center justify-center">
        <div className="text-center">
          <div className={`text-5xl font-bold ${getScoreColor(score)}`}>
            {score.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500 mt-1">满分 100</div>
        </div>
      </div>
      
      <div className="mt-6 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">生产型</span>
          <span className="text-sm font-medium text-green-600">
            {formatTimeSpent(productive)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">非生产型</span>
          <span className="text-sm font-medium text-red-600">
            {formatTimeSpent(nonProductive)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">中性</span>
          <span className="text-sm font-medium text-blue-600">
            {formatTimeSpent(neutral)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t mt-2">
          <span className="text-sm font-medium">总计</span>
          <span className="text-sm font-medium">
            {formatTimeSpent(total)}
          </span>
        </div>
      </div>
    </div>
  )
} 