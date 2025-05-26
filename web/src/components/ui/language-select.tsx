"use client"

import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@conversate/ui"
import { getTargetLanguageOptions, getNativeLanguageOptions } from "@conversate/shared"

interface LanguageSelectProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  type: 'native' | 'target'
  className?: string
}

export function LanguageSelect({ 
  value, 
  onValueChange, 
  placeholder, 
  type,
  className 
}: LanguageSelectProps) {
  const options = type === 'native' ? getNativeLanguageOptions() : getTargetLanguageOptions()

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            {language.name} ({language.nativeName})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
