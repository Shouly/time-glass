"use client"

import React from "react"
import Image from "next/image"
import { formatTimeSpent, formatPercentage } from "@/lib/utils"
import { AppUsageItem } from "@/lib/api"

interface AppListProps {
  apps: AppUsageItem[]
  totalTime: number
  showCategory?: boolean
}

export function AppList({ apps, totalTime, showCategory = true }: AppListProps) {
  const getProductivityBadge = (type?: string) => {
    if (!type) return null
    
    let badgeClass = ""
    let label = ""
    
    switch (type.toLowerCase()) {
      case "productive":
        badgeClass = "bg-green-100 text-green-800"
        label = "生产型"
        break
      case "non_productive":
        badgeClass = "bg-red-100 text-red-800"
        label = "非生产型"
        break
      case "neutral":
        badgeClass = "bg-blue-100 text-blue-800"
        label = "中性"
        break
      default:
        return null
    }
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${badgeClass}`}>
        {label}
      </span>
    )
  }
  
  return (
    <div className="space-y-1">
      {apps.map((app, index) => (
        <div 
          key={index}
          className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex-shrink-0 w-8 h-8 mr-3">
            {app.icon_path ? (
              <Image
                src={app.icon_path}
                alt={app.app_name}
                width={32}
                height={32}
                className="rounded"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                {app.app_name.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-sm truncate">{app.app_name}</h4>
                {showCategory && getProductivityBadge(app.productivity_type)}
              </div>
              <div className="text-sm font-medium">
                {formatTimeSpent(app.total_time_seconds)}
              </div>
            </div>
            
            <div className="mt-1 flex items-center">
              <div className="flex-grow h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    app.productivity_type === "productive" ? "bg-green-500" :
                    app.productivity_type === "non_productive" ? "bg-red-500" :
                    "bg-blue-500"
                  }`}
                  style={{ width: `${app.percentage}%` }}
                />
              </div>
              <span className="ml-2 text-xs text-gray-500">
                {formatPercentage(app.total_time_seconds, totalTime)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 