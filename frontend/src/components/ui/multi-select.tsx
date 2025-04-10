"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"

interface MultiSelectProps {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Виберіть опції",
  className,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current
    if (input) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (input.value === "" && selected.length > 0) {
          onChange(selected.slice(0, -1))
        }
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
  }

  // Fixed: Use capture phase for document click handler to ensure it runs before other handlers
  React.useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick, true)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick, true)
    }
  }, [])

  const selectables = options.filter((option) => !selected.includes(option.value))

  return (
    <div ref={containerRef} className={`relative ${className || ""}`}>
      <div
        className="flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-wrap gap-1">
          {selected.map((value) => {
            const option = options.find((o) => o.value === value)
            return option ? (
              <Badge key={value} variant="secondary" className="rounded-md px-1 py-0 text-xs">
                {option.label}
                <button
                  type="button"
                  className="ml-1 rounded-full outline-none hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUnselect(value)
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null
          })}
          <input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value)
              setOpen(true)
            }}
            onClick={(e) => {
              e.stopPropagation()
              setOpen(true)
            }}
            placeholder={selected.length === 0 ? placeholder : undefined}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px]"
          />
        </div>
        <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
      </div>
      {open && (
        <div className="absolute z-[999] w-full mt-1 rounded-md border bg-popover text-popover-foreground shadow-md">
          <Command className="overflow-visible bg-transparent">
            <CommandGroup className="max-h-[300px] overflow-auto p-1">
              {selectables.length > 0 ? (
                selectables
                  .filter(option => 
                    option.label.toLowerCase().includes(inputValue.toLowerCase()))
                  .map((option) => (
                    <CommandItem
                      key={option.value}
                      className="px-2 py-2 cursor-pointer hover:bg-accent aria-selected:bg-accent"
                      onMouseDown={(e) => {
                        // Fixed: Use mousedown instead of click to prevent focus issues
                        e.preventDefault();
                        const updatedSelected = [...selected, option.value];
                        console.log("Adding item to MultiSelect:", option.value);
                        console.log("Updated selected items:", updatedSelected);
                        onChange(updatedSelected);
                        setInputValue("");
                      }}
                      onSelect={() => {
                        // Keep this for keyboard navigation
                        const updatedSelected = [...selected, option.value];
                        console.log("Adding item to MultiSelect via keyboard:", option.value);
                        console.log("Updated selected items:", updatedSelected);
                        onChange(updatedSelected);
                        setInputValue("");
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        <Check className="h-4 w-4 opacity-0" />
                      </div>
                    </CommandItem>
                  ))
              ) : (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  {inputValue ? "Нічого не знайдено" : "Немає доступних елементів"}
                </div>
              )}
            </CommandGroup>
          </Command>
        </div>
      )}
    </div>
  )
}