"use client"

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import {
  BarChart,
  BarSeriesOption
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  GridComponentOption,
  TooltipComponentOption,
  LegendComponentOption
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { HourlyAppUsageSummary } from '@/lib/app-usage-api'

echarts.use([BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

type EChartsOption = echarts.ComposeOption<
  BarSeriesOption | GridComponentOption | TooltipComponentOption | LegendComponentOption
>

interface HourlyAppUsageChartProps {
  data: HourlyAppUsageSummary[]
  height?: number
  maxApps?: number
}

export function HourlyAppUsageChart({ data, height = 300, maxApps = 5 }: HourlyAppUsageChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    // 初始化图表
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current)
      }

      // 处理数据
      const hours = Array.from(new Set(data.map(item => item.hour))).sort()
      
      // 按应用名称分组并计算总使用时间
      const appUsageMap = new Map<string, { total: number, type: string }>()
      data.forEach(item => {
        if (!appUsageMap.has(item.app_name)) {
          appUsageMap.set(item.app_name, { 
            total: item.duration_minutes,
            type: item.productivity_type
          })
        } else {
          const current = appUsageMap.get(item.app_name)!
          appUsageMap.set(item.app_name, {
            total: current.total + item.duration_minutes,
            type: current.type
          })
        }
      })
      
      // 按总使用时间排序并取前N个应用
      const topApps = Array.from(appUsageMap.entries())
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, maxApps)
        .map(([name, data]) => ({ 
          name, 
          total: data.total,
          type: data.type
        }))
      
      // 为每个应用创建系列数据
      const series = topApps.map(app => {
        // 为每个小时创建数据点
        const hourData = hours.map(hour => {
          const hourItem = data.find(item => item.hour === hour && item.app_name === app.name)
          return hourItem ? hourItem.duration_minutes : 0
        })
        
        // 根据应用的生产力类型设置颜色
        let color
        switch (app.type) {
          case 'PRODUCTIVE':
            color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#22c55e' },
              { offset: 1, color: '#16a34a' }
            ])
            break
          case 'NEUTRAL':
            color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#2563eb' }
            ])
            break
          case 'DISTRACTING':
            color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#ef4444' },
              { offset: 1, color: '#dc2626' }
            ])
            break
          default:
            color = new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#94a3b8' },
              { offset: 1, color: '#64748b' }
            ])
        }
        
        return {
          name: app.name,
          type: 'bar' as const,
          stack: 'total',
          emphasis: {
            focus: 'series' as const
          },
          itemStyle: {
            color
          },
          data: hourData
        }
      })

      const option: EChartsOption = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params: any) => {
            let result = `<div style="padding: 8px;"><div style="font-weight: 500; margin-bottom: 4px;">${params[0].name}点</div>`
            
            // 按值从大到小排序
            const sortedParams = [...params].sort((a, b) => b.value - a.value)
            
            sortedParams.forEach((param: any) => {
              const color = param.color
              const name = param.seriesName
              const value = param.value
              
              if (value > 0) {
                result += `<div style="display: flex; align-items: center; margin-top: 3px;">
                  <span style="display: inline-block; width: 10px; height: 10px; background: ${color}; border-radius: 50%; margin-right: 5px;"></span>
                  <span style="font-size: 12px;">${name}: ${value} 分钟</span>
                </div>`
              }
            })
            
            result += '</div>'
            return result
          }
        },
        legend: {
          data: topApps.map(app => app.name),
          bottom: 0,
          type: 'scroll',
          itemWidth: 12,
          itemHeight: 12,
          textStyle: {
            fontSize: 12
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: hours,
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          },
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            interval: 2,
            fontSize: 11
          }
        },
        yAxis: {
          type: 'value',
          name: '分钟',
          nameTextStyle: {
            padding: [0, 0, 0, 0]
          },
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              type: 'dashed',
              color: '#eee'
            }
          }
        },
        series
      }

      chartInstance.current.setOption(option)
    }

    // 清理函数
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose()
        chartInstance.current = null
      }
    }
  }, [data, maxApps])

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize()
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div 
      ref={chartRef} 
      style={{ 
        height: `${height}px`, 
        width: '100%' 
      }}
    />
  )
} 