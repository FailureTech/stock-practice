"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"

interface SummaryData {
    buyCount: number
    shortCount: number
    totalProfitLoss: number
}

interface SummaryBarProps {
    refreshKey?: number
}

export function SummaryBar({ refreshKey }: SummaryBarProps) {
    const [summary, setSummary] = React.useState<SummaryData>({
        buyCount: 0,
        shortCount: 0,
        totalProfitLoss: 0,
    })
    const [loading, setLoading] = React.useState(true)

    const fetchSummary = React.useCallback(async () => {
        try {
            const res = await fetch("/api/dailySummary")
            if (res.ok) {
                const data = await res.json()
                if (data.success) {
                    setSummary(data.data)
                }
            }
        } catch (error) {
            console.error("Error fetching summary:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchSummary()
        // Refresh every 30 seconds
        const interval = setInterval(fetchSummary, 30000)
        return () => clearInterval(interval)
    }, [fetchSummary, refreshKey])

    return (
        <Card className="w-full">
            <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Buy Count</span>
                        <span className="text-2xl font-bold text-green-600">
                            {loading ? "..." : summary.buyCount}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Short Count</span>
                        <span className="text-2xl font-bold text-red-600">
                            {loading ? "..." : summary.shortCount}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Result of Day</span>
                        <span
                            className={`text-2xl font-bold ${summary.totalProfitLoss >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                        >
                            {loading
                                ? "..."
                                : `₹${summary.totalProfitLoss.toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}`}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
