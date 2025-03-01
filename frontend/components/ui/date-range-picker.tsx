"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DateRangePickerProps {
  className?: string
  onChange: (range: DateRange | undefined) => void
  value: DateRange | undefined
}

export function DateRangePicker({
  className,
  onChange,
  value,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handlePresetChange = (preset: string) => {
    const today = new Date()
    let from: Date
    let to: Date = today

    switch (preset) {
      case "today":
        from = today
        break
      case "yesterday":
        from = addDays(today, -1)
        to = addDays(today, -1)
        break
      case "last7days":
        from = addDays(today, -6)
        break
      case "last30days":
        from = addDays(today, -29)
        break
      case "thisMonth":
        from = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case "lastMonth":
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        to = new Date(today.getFullYear(), today.getMonth(), 0)
        break
      default:
        from = today
    }

    onChange({ from, to })
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "PPP", { locale: zhCN })} -{" "}
                  {format(value.to, "PPP", { locale: zhCN })}
                </>
              ) : (
                format(value.from, "PPP", { locale: zhCN })
              )
            ) : (
              <span>选择日期范围</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex items-center justify-between border-b p-3">
            <h3 className="text-sm font-medium">选择日期范围</h3>
            <div className="flex items-center space-x-2">
              <Select
                onValueChange={handlePresetChange}
                defaultValue="today"
              >
                <SelectTrigger className="h-8 w-[150px]">
                  <SelectValue placeholder="选择范围" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">今天</SelectItem>
                  <SelectItem value="yesterday">昨天</SelectItem>
                  <SelectItem value="last7days">过去7天</SelectItem>
                  <SelectItem value="last30days">过去30天</SelectItem>
                  <SelectItem value="thisMonth">本月</SelectItem>
                  <SelectItem value="lastMonth">上月</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            locale={zhCN}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
} 