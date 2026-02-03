'use client'

import { useState, useEffect, forwardRef } from 'react'
import { Input } from '@/components/ui/input'

interface PhoneMaskProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    value?: string
    onChange?: (value: string) => void
    onBlur?: () => void
}

function formatPhone(value: string): string {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')

    // Limit to 13 digits (55 + 2 DDD + 9 number)
    const limited = digits.slice(0, 13)

    // Format: +55 (XX) XXXXX-XXXX
    if (limited.length === 0) return ''
    if (limited.length <= 2) return `+${limited}`
    if (limited.length <= 4) return `+${limited.slice(0, 2)} (${limited.slice(2)}`
    if (limited.length <= 9) return `+${limited.slice(0, 2)} (${limited.slice(2, 4)}) ${limited.slice(4)}`
    return `+${limited.slice(0, 2)} (${limited.slice(2, 4)}) ${limited.slice(4, 9)}-${limited.slice(9)}`
}

function unformatPhone(value: string): string {
    return value.replace(/\D/g, '')
}

export const PhoneMask = forwardRef<HTMLInputElement, PhoneMaskProps>(
    ({ value = '', onChange, className, placeholder = '+55 (00) 00000-0000', ...props }, ref) => {
        const [displayValue, setDisplayValue] = useState(() => formatPhone(value))

        useEffect(() => {
            setDisplayValue(formatPhone(value))
        }, [value])

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const inputValue = e.target.value
            const formatted = formatPhone(inputValue)
            setDisplayValue(formatted)

            // Return unformatted value (just digits)
            const unformatted = unformatPhone(formatted)
            onChange?.(unformatted)
        }

        return (
            <Input
                ref={ref}
                type="tel"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                placeholder={placeholder}
                className={className}
                {...props}
            />
        )
    }
)

PhoneMask.displayName = 'PhoneMask'
