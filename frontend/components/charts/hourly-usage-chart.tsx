"use client"

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface HourlyUsageChartProps {
  data: Array<{
    hour: string
    productive: number
    neutral: number
    distracting: number
  }>
  height?: number
}

export function HourlyUsageChart({ data, height = 300 }: HourlyUsageChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    // 初始化图表
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current)
      }

      const option: any = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: (params: any) => {
            let result = `<div style="padding: 8px;"><div style="font-weight: 500; margin-bottom: 4px;">${params[0].name}</div>`
            
            params.forEach((param: any) => {
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
          data: ['效率与财务', '其他', '干扰'],
          bottom: 0,
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
          data: data.map(item => item.hour),
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
        series: [
          {
            name: '效率与财务',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              color: '#22c55e'
            },
            data: data.map(item => item.productive)
          },
          {
            name: '其他',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              color: '#3b82f6'
            },
            data: data.map(item => item.neutral)
          },
          {
            name: '干扰',
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series'
            },
            itemStyle: {
              color: '#ef4444'
            },
            data: data.map(item => item.distracting)
          }
        ]
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
  }, [data])

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