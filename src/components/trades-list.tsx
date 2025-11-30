"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, TrendingUp } from "lucide-react"
import { ProfitLossModal } from "./profit-loss-modal"
import { EditTradeModal } from "./edit-trade-modal"

interface Trade {
    id: string
    stock: string
    entry_type: string
    purchase_price?: number
    quantity?: number
    profit_loss?: number
    learning?: string
    target?: number
    stop_loss?: number
    created_at?: string
}

interface Stock {
    symbol: string
    name: string
    isin: string
}

interface TradesListProps {
    onRefresh?: () => void
    stocks?: Stock[]
}

export function TradesList({ onRefresh, stocks = [] }: TradesListProps) {
    const [trades, setTrades] = React.useState<Trade[]>([])
    const [loading, setLoading] = React.useState(true)
    const [profitLossModalOpen, setProfitLossModalOpen] = React.useState(false)
    const [editModalOpen, setEditModalOpen] = React.useState(false)
    const [selectedTrade, setSelectedTrade] = React.useState<Trade | null>(null)

    const fetchTrades = React.useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch("/api/getTodayTrades")
            if (res.ok) {
                const data = await res.json()
                if (data.success) {
                    setTrades(data.data || [])
                }
            }
        } catch (error) {
            console.error("Error fetching trades:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchTrades()
    }, [fetchTrades])


    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this trade?")) {
            return
        }

        try {
            const res = await fetch(`/api/deleteTrade?id=${id}`, {
                method: "DELETE",
            })
            if (res.ok) {
                fetchTrades()
            }
        } catch (error) {
            console.error("Error deleting trade:", error)
            alert("Error deleting trade")
        }
    }

    const handleProfitLossClick = (trade: Trade) => {
        setSelectedTrade(trade)
        setProfitLossModalOpen(true)
    }

    const handleEditClick = (trade: Trade) => {
        setSelectedTrade(trade)
        setEditModalOpen(true)
    }

    const amount = (trade: Trade) => {
        return (trade.purchase_price || 0) * (trade.quantity || 0)
    }

    const formatTime = (dateString?: string) => {
        if (!dateString) return ""
        try {
            const date = new Date(dateString)
            return date.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            })
        } catch {
            return ""
        }
    }

    return (
        <>
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Today&apos;s Trades</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading...
                        </div>
                    ) : trades.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No trades today
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
                            {trades.map((trade) => (
                                <div
                                    key={trade.id}
                                    className="border rounded-lg p-4 hover:bg-accent transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold">{trade.stock}</h3>
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-medium ${trade.entry_type === "buy"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                        }`}
                                                >
                                                    {trade.entry_type.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Amount: ₹
                                                {amount(trade).toLocaleString("en-IN", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </div>
                                            {trade.created_at && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Added at: {formatTime(trade.created_at)}
                                                </div>
                                            )}
                                            {trade.profit_loss !== null &&
                                                trade.profit_loss !== undefined && (
                                                    <div
                                                        className={`text-sm font-medium mt-1 ${trade.profit_loss >= 0
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                            }`}
                                                    >
                                                        P/L: ₹
                                                        {trade.profit_loss.toLocaleString("en-IN", {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        })}
                                                    </div>
                                                )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleProfitLossClick(trade)}
                                                title="Add Profit/Loss"
                                            >
                                                <TrendingUp className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditClick(trade)}
                                                title="Edit Trade"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(trade.id)}
                                                title="Delete Trade"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedTrade && (
                <>
                    <ProfitLossModal
                        open={profitLossModalOpen}
                        onOpenChange={setProfitLossModalOpen}
                        trade={selectedTrade}
                        onSuccess={() => {
                            fetchTrades()
                            setProfitLossModalOpen(false)
                            onRefresh?.()
                        }}
                    />
                    <EditTradeModal
                        open={editModalOpen}
                        onOpenChange={setEditModalOpen}
                        trade={selectedTrade}
                        stocks={stocks}
                        onSuccess={() => {
                            fetchTrades()
                            setEditModalOpen(false)
                            onRefresh?.()
                        }}
                    />
                </>
            )}
        </>
    )
}
