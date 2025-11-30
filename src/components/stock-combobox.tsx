"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandInput,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useDebounce } from "@/hooks/use-debounce"

interface Stock {
    symbol: string
    name: string
    isin: string
}

interface StockComboboxProps {
    stocks: Stock[]
    value?: string
    onValueChange: (value: string) => void
    label?: string
}

export function StockCombobox({
    stocks,
    value,
    onValueChange,
    label = "Stock",
}: StockComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const debouncedSearch = useDebounce(searchQuery, 150)

    const parentRef = React.useRef<HTMLDivElement>(null)
    const [isMounted, setIsMounted] = React.useState(false)

    // Track when component is mounted and popover is open
    React.useEffect(() => {
        if (open) {
            setIsMounted(true)
        }
    }, [open])

    // Reset search when popover closes
    React.useEffect(() => {
        if (!open) {
            setSearchQuery("")
        }
    }, [open])

    // Memoize filtered stocks
    const filteredStocks = React.useMemo(() => {
        if (!stocks || stocks.length === 0) {
            return []
        }

        if (!debouncedSearch.trim()) {
            return stocks
        }

        const query = debouncedSearch.toLowerCase().trim()
        return stocks.filter(
            (stock) =>
                stock.symbol?.toLowerCase().includes(query) ||
                stock.name?.toLowerCase().includes(query)
        )
    }, [stocks, debouncedSearch])

    // Virtual scrolling - only initialize when mounted and container is ready
    const virtualizer = useVirtualizer({
        count: filteredStocks.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 60,
        overscan: 10,
    })

    const selectedStock = stocks?.find((stock) => stock.symbol === value) || null

    // Reset scroll when search changes or popover opens
    React.useEffect(() => {
        if (parentRef.current && open && isMounted) {
            const timer = setTimeout(() => {
                if (parentRef.current) {
                    parentRef.current.scrollTop = 0
                }
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [debouncedSearch, open, isMounted])

    const handleSelect = (stockSymbol: string) => {
        onValueChange(stockSymbol === value ? "" : stockSymbol)
        setOpen(false)
        setSearchQuery("")
    }

    // Debug log
    React.useEffect(() => {
        if (open) {
            console.log("Stocks count:", stocks?.length || 0)
            console.log("Filtered count:", filteredStocks.length)
        }
    }, [open, stocks?.length, filteredStocks.length])

    const virtualItems = isMounted && parentRef.current ? virtualizer.getVirtualItems() : []
    const useVirtual = filteredStocks.length > 50 && isMounted && parentRef.current

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedStock
                        ? `${selectedStock.symbol} - ${selectedStock.name}`
                        : "Select stock..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command shouldFilter={false} className="rounded-lg border shadow-md">
                    <CommandInput
                        placeholder="Search stock..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <div
                        ref={parentRef}
                        className="overflow-auto"
                        style={{
                            maxHeight: "300px",
                            minHeight: "200px",
                        }}
                    >
                        {!stocks || stocks.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Loading stocks...
                            </div>
                        ) : filteredStocks.length === 0 ? (
                            <CommandEmpty>No stock found.</CommandEmpty>
                        ) : useVirtual && virtualItems.length > 0 ? (
                            // Virtual scrolling for large lists
                            <div
                                style={{
                                    height: `${virtualizer.getTotalSize()}px`,
                                    width: "100%",
                                    position: "relative",
                                }}
                            >
                                {virtualItems.map((virtualItem) => {
                                    const stock = filteredStocks[virtualItem.index]
                                    if (!stock) return null

                                    return (
                                        <div
                                            key={stock.symbol}
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: "100%",
                                                height: `${virtualItem.size}px`,
                                                transform: `translateY(${virtualItem.start}px)`,
                                            }}
                                        >
                                            <div
                                                className={cn(
                                                    "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                                    value === stock.symbol && "bg-accent"
                                                )}
                                                onClick={() => handleSelect(stock.symbol)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "h-4 w-4 shrink-0",
                                                        value === stock.symbol ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <div className="flex flex-col py-1">
                                                    <span className="font-medium">{stock.symbol}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {stock.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            // Simple render (fallback or for small lists)
                            filteredStocks.slice(0, 100).map((stock) => (
                                <div
                                    key={stock.symbol}
                                    className={cn(
                                        "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                        value === stock.symbol && "bg-accent"
                                    )}
                                    onClick={() => handleSelect(stock.symbol)}
                                >
                                    <Check
                                        className={cn(
                                            "h-4 w-4 shrink-0",
                                            value === stock.symbol ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col py-1">
                                        <span className="font-medium">{stock.symbol}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {stock.name}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Command>
            </PopoverContent>
        </Popover>
    )
}