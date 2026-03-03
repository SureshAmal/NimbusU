"use client"

import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export function TimePicker({
    value,
    onChange,
    className,
    placeholder = "Pick a time",
    disabled = false,
}: {
    value?: string // format: "HH:mm"
    onChange: (value: string) => void
    className?: string
    placeholder?: string
    disabled?: boolean
}) {
    const [open, setOpen] = React.useState(false)

    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"))

    const [selectedHour, selectedMinute] = value ? value.split(":") : ["", ""]

    const handleHourSelect = (h: string) => {
        onChange(`${h}:${selectedMinute || "00"}`)
    }

    const handleMinuteSelect = (m: string) => {
        onChange(`${selectedHour || "00"}:${m}`)
    }

    // Effect to scroll to the selected items when opened
    const hourRef = React.useRef<HTMLDivElement>(null)
    const minuteRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (open) {
            if (selectedHour && hourRef.current) {
                const index = parseInt(selectedHour)
                hourRef.current.scrollTo({ top: index * 32, behavior: "instant" })
            }
            if (selectedMinute && minuteRef.current) {
                const index = parseInt(selectedMinute)
                minuteRef.current.scrollTo({ top: index * 32, behavior: "instant" })
            }
        }
    }, [open, selectedHour, selectedMinute])

    const formatDisplayTime = (val: string) => {
        const [hStr, mStr] = val.split(":")
        const h = parseInt(hStr)
        const ampm = h >= 12 ? "PM" : "AM"
        const displayH = h % 12 || 12
        return `${displayH}:${mStr} ${ampm}`
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    <Clock className="mr-2 h-4 w-4" />
                    {value ? formatDisplayTime(value) : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
                <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hours</span>
                        <ScrollArea className="h-[200px] w-16 rounded-md border bg-muted/20" viewportRef={hourRef}>
                            <div className="flex flex-col p-1.5 gap-1">
                                {hours.map((h) => (
                                    <Button
                                        key={h}
                                        variant={selectedHour === h ? "default" : "ghost"}
                                        size="sm"
                                        className={cn("h-8 w-full p-0 flex-shrink-0 text-sm", selectedHour === h && "shadow-sm")}
                                        onClick={() => handleHourSelect(h)}
                                    >
                                        {h}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Minutes</span>
                        <ScrollArea className="h-[200px] w-16 rounded-md border bg-muted/20" viewportRef={minuteRef}>
                            <div className="flex flex-col p-1.5 gap-1">
                                {minutes.map((m) => (
                                    <Button
                                        key={m}
                                        variant={selectedMinute === m ? "default" : "ghost"}
                                        size="sm"
                                        className={cn("h-8 w-full p-0 flex-shrink-0 text-sm", selectedMinute === m && "shadow-sm")}
                                        onClick={() => handleMinuteSelect(m)}
                                    >
                                        {m}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
