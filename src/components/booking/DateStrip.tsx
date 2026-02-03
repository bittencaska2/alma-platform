'use client'

import { cn, formatDateForStrip } from '@/lib/utils'
import { Card } from '@/components/ui/card'

interface DateOption {
    date: Date
    dayName: string
    dayNumber: number
    fullDate: string
    isAvailable: boolean
    hasSlotsAvailable: boolean
}

interface DateStripProps {
    availableDays: DateOption[]
    selectedDate: Date | null
    onSelectDate: (date: Date) => void
    className?: string
}

export function DateStrip({
    availableDays,
    selectedDate,
    onSelectDate,
    className
}: DateStripProps) {
    const isSelected = (date: Date) => {
        if (!selectedDate) return false
        return (
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear()
        )
    }

    return (
        <div className={cn("relative", className)}>
            {/* Scrollable date container */}
            <div
                className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
            >
                {availableDays.map((dayOption, index) => {
                    const selected = isSelected(dayOption.date)
                    const { dayName, dayNumber } = formatDateForStrip(dayOption.date)

                    return (
                        <Card
                            key={index}
                            onClick={() => dayOption.isAvailable && onSelectDate(dayOption.date)}
                            className={cn(
                                "flex-shrink-0 w-24 h-28 cursor-pointer transition-colors duration-200",
                                "flex flex-col items-center justify-center gap-2",
                                "border-2",
                                selected
                                    ? "bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-md"
                                    : dayOption.isAvailable
                                        ? "bg-white text-gray-700 border-gray-200 hover:border-[#C4B5FD] hover:bg-[#FAF5FF]"
                                        : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-60"
                            )}
                        >
                            <span
                                className={cn(
                                    "text-xs font-medium uppercase tracking-wide",
                                    selected ? "text-white/90" : "text-gray-500"
                                )}
                            >
                                {dayName}
                            </span>
                            <span
                                className={cn(
                                    "text-3xl font-semibold",
                                    selected ? "text-white" : "text-gray-900"
                                )}
                            >
                                {dayNumber}
                            </span>
                            {dayOption.hasSlotsAvailable && !selected && (
                                <span className="text-[10px] text-gray-400 font-medium">
                                    {/* Texto de disponibilidade removido - mais clean */}
                                </span>
                            )}
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
