
"use client"

import * as React from "react"
import { format } from "date-fns"
import { arSA } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePickerWithRange({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full sm:w-[260px] justify-start text-left font-normal bg-white focus:border-app-gold",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="ml-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y", { locale: arSA })} -{" "}
                  {format(date.to, "LLL dd, y", { locale: arSA })}
                </>
              ) : (
                format(date.from, "LLL dd, y", { locale: arSA })
              )
            ) : (
              <span>اختر نطاقاً زمنياً</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            locale={arSA}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
