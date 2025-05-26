"use client"

import { useState, useEffect, useRef } from "react"
import { Check, X, ChevronDown } from "lucide-react"
import { getTargetLanguageOptions } from "@conversate/shared"

interface MultiLanguageSelectProps {
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder?: string
  maxSelections?: number
  className?: string
}

export function MultiLanguageSelect({ 
  value, 
  onValueChange, 
  placeholder = "Select languages to learn",
  maxSelections = 4,
  className 
}: MultiLanguageSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const options = getTargetLanguageOptions()
  const selectedLanguages = options.filter(lang => value.includes(lang.code))
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleSelect = (languageCode: string) => {
    if (value.includes(languageCode)) {
      onValueChange(value.filter(code => code !== languageCode))
    } else if (value.length < maxSelections) {
      onValueChange([...value, languageCode])
    }
  }

  const removeLanguage = (languageCode: string) => {
    onValueChange(value.filter(code => code !== languageCode))
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={className} ref={dropdownRef}>
      <div className="relative">
        <button
          type="button"
          className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1 w-full min-h-6">
            {selectedLanguages.length > 0 ? (
              selectedLanguages.map((language) => (
                <div
                  key={language.code}
                  className="flex items-center gap-1 bg-primary/10 text-primary rounded-md px-2 py-1 text-sm"
                >
                  <span>{language.name}</span>                  <button
                    type="button"
                    title={`Remove ${language.name}`}
                    className="h-4 w-4 p-0 hover:bg-primary/20 rounded-sm flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeLanguage(language.code)
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
        </button>
        
        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
            <div className="max-h-60 overflow-auto p-1">
              {options.map((language) => {
                const isSelected = value.includes(language.code)
                const isDisabled = !isSelected && value.length >= maxSelections
                
                return (
                  <button
                    key={language.code}
                    type="button"
                    className={`w-full flex items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground ${
                      isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    disabled={isDisabled}
                    onClick={() => !isDisabled && handleSelect(language.code)}
                  >
                    <span>{language.name} ({language.nativeName})</span>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
      
      {value.length >= maxSelections && (
        <p className="text-sm text-muted-foreground mt-1">
          Maximum {maxSelections} languages selected
        </p>
      )}
    </div>
  )
}