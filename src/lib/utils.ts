import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Business logic constants
export const CONSULTATION_PRICE = 160.00
export const PSYCHOLOGIST_SPLIT = 0.80
export const PLATFORM_SPLIT = 0.20
export const SOCIAL_DONATION_RATE = 0.01

export function calculateSplit(grossAmount: number) {
    return {
        gross: grossAmount,
        psychologistAmount: grossAmount * PSYCHOLOGIST_SPLIT,
        platformAmount: grossAmount * PLATFORM_SPLIT,
        socialDonation: grossAmount * SOCIAL_DONATION_RATE,
    }
}

export function getWeeksInMonth(year: number, month: number): number {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Calculate weeks based on Thursdays (standard week counting)
    const firstThursday = new Date(firstDay)
    firstThursday.setDate(firstDay.getDate() + ((4 - firstDay.getDay() + 7) % 7))

    const lastThursday = new Date(lastDay)
    lastThursday.setDate(lastDay.getDate() - ((lastDay.getDay() + 3) % 7))

    const weeks = Math.round((lastThursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1

    return weeks >= 5 ? 5 : 4
}

export function calculateMonthlyPackage(year: number, month: number) {
    const weeks = getWeeksInMonth(year, month)
    const total = CONSULTATION_PRICE * weeks

    return {
        weeks,
        pricePerSession: CONSULTATION_PRICE,
        totalAmount: total,
        socialDonation: total * SOCIAL_DONATION_RATE,
    }
}

/**
 * Calculate remaining sessions from a specific date to end of month
 * Counts how many occurrences of a specific weekday remain in the month
 */
export function calculateRemainingWeeksPackage(startDate: Date, sessionDayOfWeek: number) {
    const year = startDate.getFullYear()
    const month = startDate.getMonth()
    const lastDay = new Date(year, month + 1, 0)

    // Count remaining occurrences of the session day from startDate to end of month
    let count = 0
    const current = new Date(startDate)
    current.setHours(0, 0, 0, 0)

    while (current <= lastDay) {
        if (current.getDay() === sessionDayOfWeek) {
            count++
        }
        current.setDate(current.getDate() + 1)
    }

    const sessions = Math.max(1, count) // At least 1 session
    const total = CONSULTATION_PRICE * sessions

    return {
        sessions,
        pricePerSession: CONSULTATION_PRICE,
        totalAmount: total,
        socialDonation: total * SOCIAL_DONATION_RATE,
        monthName: startDate.toLocaleDateString('pt-BR', { month: 'long' }),
        renewalDate: new Date(year, month + 1, 1), // First day of next month
    }
}

export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value)
}

export function generateTimeSlots(startTime: string, endTime: string, durationMinutes: number = 50): string[] {
    const slots: string[] = []
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    let currentMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    while (currentMinutes + durationMinutes <= endMinutes) {
        const slotStartHour = Math.floor(currentMinutes / 60)
        const slotStartMin = currentMinutes % 60
        const slotEndMinutes = currentMinutes + durationMinutes
        const slotEndHour = Math.floor(slotEndMinutes / 60)
        const slotEndMin = slotEndMinutes % 60

        const start = `${String(slotStartHour).padStart(2, '0')}:${String(slotStartMin).padStart(2, '0')}`
        const end = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`

        slots.push(`${start}-${end}`)

        // Add 10 min break between sessions
        currentMinutes += durationMinutes + 10
    }

    return slots
}

/**
 * Get next N available days for booking, respecting min hours ahead rule
 * @param today Current date/time
 * @param psychologistAvailability Array of available weekdays
 * @param count How many days to return (default: 5)
 * @param minHoursAhead Minimum hours ahead for first available slot (default: 24)
 */
export function getNextAvailableDays(
    today: Date,
    psychologistAvailability: { day_of_week: string }[],
    count: number = 5,
    minHoursAhead: number = 24
): Date[] {
    const minDate = new Date(today.getTime() + minHoursAhead * 60 * 60 * 1000)

    const dayMap: { [key: string]: number } = {
        'sunday': 0,
        'monday': 1,
        'tuesday': 2,
        'wednesday': 3,
        'thursday': 4,
        'friday': 5,
        'saturday': 6
    }

    const availableWeekdays = psychologistAvailability.map(
        slot => dayMap[slot.day_of_week.toLowerCase()]
    ).filter((day): day is number => day !== undefined)

    const result: Date[] = []
    let currentDate = new Date(minDate)
    currentDate.setHours(0, 0, 0, 0)

    // Safety limit to prevent infinite loop
    let iterations = 0
    const maxIterations = 100

    while (result.length < count && iterations < maxIterations) {
        const weekday = currentDate.getDay()
        if (availableWeekdays.includes(weekday)) {
            result.push(new Date(currentDate))
        }
        currentDate.setDate(currentDate.getDate() + 1)
        iterations++
    }

    return result
}

/**
 * Calculate how many times a specific weekday occurs from a date until month end
 * Used for dynamic package pricing
 */
export function calculateRemainingSessionsInMonth(
    selectedDate: Date,
    selectedWeekday: number
): number {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const monthEnd = new Date(year, month + 1, 0)
    monthEnd.setHours(23, 59, 59, 999)

    let count = 0
    const current = new Date(selectedDate)
    current.setHours(0, 0, 0, 0)

    while (current <= monthEnd) {
        if (current.getDay() === selectedWeekday) {
            count++
        }
        current.setDate(current.getDate() + 1)
    }

    return count
}

/**
 * Format date for display in date strip
 * @param date Date to format
 * @returns Object with formatted day name and number
 */
export function formatDateForStrip(date: Date): { dayName: string; dayNumber: number; fullDate: string } {
    const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
    const dayNumber = date.getDate()
    const dayName = dayNames[date.getDay()]
    const fullDate = date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long'
    })

    return { dayName, dayNumber, fullDate }
}
