import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCryptoValue(value: number): string {
  if (value === 0) return "0"

  const str = value.toFixed(10).replace(/\.?0+$/, "") // Remove trailing zeros
  const parts = str.split(".")

  if (parts.length === 2 && parts[0] === "0") {
    const decimals = parts[1]
    const match = decimals.match(/^(0+)(.*)/)

    if (match) {
      const zeros = match[1].length
      const remaining = match[2]

      // Only use this format if there are 3 or more zeros
      if (zeros >= 3) {
        return `0.0(${zeros})${remaining}`
      }
    }
  }

  return str
}
