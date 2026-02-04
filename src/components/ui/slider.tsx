"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'defaultValue'> {
    value?: number[]
    defaultValue?: number[]
    onValueChange?: (value: number[]) => void
    max?: number
    step?: number
}



function Slider({ className, value, defaultValue, onValueChange, max = 100, step = 1, disabled, ...props }: SliderProps) {
    const currentValue = value ? value[0] : (defaultValue ? defaultValue[0] : 0)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value)
        if (onValueChange) {
            onValueChange([val])
        }
    }

    // Calculate percentage for the fill track effect
    const percentage = (currentValue / max) * 100

    return (
        <div className={cn("relative flex w-full items-center", className)}>
            <input
                type="range"
                min={0}
                max={max}
                step={step}
                value={currentValue}
                onChange={handleChange}
                disabled={disabled}
                className={cn(
                    "w-full h-2 rounded-full appearance-none cursor-pointer z-20 relative",
                    "focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                    disabled && "opacity-50 cursor-not-allowed",
                    // Webkit thumb styles
                    "[&::-webkit-slider-thumb]:appearance-none",
                    "[&::-webkit-slider-thumb]:h-5",
                    "[&::-webkit-slider-thumb]:w-5",
                    "[&::-webkit-slider-thumb]:rounded-full",
                    "[&::-webkit-slider-thumb]:border-2",
                    "[&::-webkit-slider-thumb]:border-primary",
                    "[&::-webkit-slider-thumb]:bg-background",
                    "[&::-webkit-slider-thumb]:shadow-sm",
                    "[&::-webkit-slider-thumb]:transition-colors",
                    "[&::-webkit-slider-thumb]:hover:border-primary/80",
                    "[&::-webkit-slider-thumb]:cursor-pointer",
                    // Firefox thumb styles
                    "[&::-moz-range-thumb]:h-5",
                    "[&::-moz-range-thumb]:w-5",
                    "[&::-moz-range-thumb]:rounded-full",
                    "[&::-moz-range-thumb]:border-2",
                    "[&::-moz-range-thumb]:border-primary",
                    "[&::-moz-range-thumb]:bg-background",
                    "[&::-moz-range-thumb]:shadow-sm",
                    "[&::-moz-range-thumb]:transition-colors",
                    "[&::-moz-range-thumb]:hover:border-primary/80",
                    "[&::-moz-range-thumb]:cursor-pointer"
                )}
                style={{
                    background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percentage}%, hsl(var(--primary) / 0.2) ${percentage}%, hsl(var(--primary) / 0.2) 100%)`
                }}
                {...props}
            />
        </div>
    )
}

export { Slider }
