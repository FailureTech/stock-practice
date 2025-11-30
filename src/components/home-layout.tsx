"use client"

import * as React from "react"
import { SummaryBar } from "./summary-bar"
import { StockForm } from "./stock-form"
import { TradesList } from "./trades-list"

interface Stock {
    symbol: string
    name: string
    isin: string
}

interface HomeLayoutProps {
    stocks: Stock[]
}

export function HomeLayout({ stocks }: HomeLayoutProps) {
    const [refreshKey, setRefreshKey] = React.useState(0)
    const tradesListRef = React.useRef<{ refresh: () => void }>(null)

    const handleTradeCreated = () => {
        setRefreshKey((prev) => prev + 1)
        // Refresh will happen automatically via key change
    }

    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1)
    }

    return (
        <div className="min-h-screen p-6 space-y-6">
            {/* Header with Title */}
            <header className="flex justify-center items-center">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white text-center">
                    Daily Stock Practise records
                </h1>
            </header>

            {/* Summary Bar */}
            <SummaryBar refreshKey={refreshKey} />

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trades List - Shows 2nd on mobile, right on desktop */}
                <div className="order-1 lg:order-2">
                    <TradesList key={refreshKey} stocks={stocks} onRefresh={handleRefresh} />
                </div>

                {/* Form - Shows 3rd on mobile, left on desktop */}
                <div className="order-2 lg:order-1">
                    <StockForm stocks={stocks} onTradeCreated={handleTradeCreated} />
                </div>
            </div>
        </div>
    )
}
