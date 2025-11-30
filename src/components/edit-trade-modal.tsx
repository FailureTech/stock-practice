"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { StockCombobox } from "./stock-combobox"

const formSchema = z.object({
    stock: z.string().min(1, "Please select a stock"),
    entryType: z.enum(["buy", "short"]),
    purchasePrice: z.string().min(1, "Purchase price is required").refine(
        (val) => !isNaN(Number(val)) && Number(val) > 0,
        "Please enter a valid price"
    ),
    target: z.string().min(1, "Target is required").refine(
        (val) => !isNaN(Number(val)) && Number(val) > 0,
        "Please enter a valid target"
    ),
    stopLoss: z.string().min(1, "Stop loss is required").refine(
        (val) => !isNaN(Number(val)) && Number(val) > 0,
        "Please enter a valid stop loss"
    ),
    quantity: z.string().min(1, "Quantity is required").refine(
        (val) => !isNaN(Number(val)) && Number(val) > 0 && Number(val) % 1 === 0,
        "Please enter a valid quantity"
    ),
})

type FormValues = z.infer<typeof formSchema>

interface Trade {
    id: string
    stock: string
    entry_type: string
    purchase_price?: number
    target?: number
    stop_loss?: number
    quantity?: number
    profit_loss?: number
    learning?: string
}

interface Stock {
    symbol: string
    name: string
    isin: string
}

interface EditTradeModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    trade: Trade
    onSuccess: () => void
    stocks?: Stock[]
}

export function EditTradeModal({
    open,
    onOpenChange,
    trade,
    onSuccess,
    stocks = [],
}: EditTradeModalProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            stock: trade.stock,
            entryType: (trade.entry_type as "buy" | "short") || "buy",
            purchasePrice: trade.purchase_price?.toString() || "",
            target: trade.target?.toString() || "",
            stopLoss: trade.stop_loss?.toString() || "",
            quantity: trade.quantity?.toString() || "",
        },
    })

    React.useEffect(() => {
        if (open) {
            form.reset({
                stock: trade.stock,
                entryType: trade.entry_type as "buy" | "short",
                purchasePrice: trade.purchase_price?.toString() || "",
                target: trade.target?.toString() || "",
                stopLoss: trade.stop_loss?.toString() || "",
                quantity: trade.quantity?.toString() || "",
            })
        }
    }, [open, trade, form])

    async function onSubmit(values: FormValues) {
        try {
            const res = await fetch("/api/createEditTrade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: trade.id,
                    stock: values.stock,
                    entryType: values.entryType,
                    purchasePrice: values.purchasePrice,
                    target: values.target,
                    stopLoss: values.stopLoss,
                    quantity: values.quantity,
                }),
            })

            if (!res.ok) {
                throw new Error("Failed to update trade")
            }

            const data = await res.json()
            if (data.success) {
                onSuccess()
            }
        } catch (error) {
            console.error("Error updating trade:", error)
            alert("Error updating trade")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Trade</DialogTitle>
                    <DialogDescription>
                        Update trade details
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="stock"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stock</FormLabel>
                                    <FormControl>
                                        {stocks.length > 0 ? (
                                            <StockCombobox
                                                stocks={stocks}
                                                value={field.value}
                                                onValueChange={field.onChange}
                                            />
                                        ) : (
                                            <Input {...field} disabled />
                                        )}
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="entryType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Entry Type</FormLabel>
                                    <FormControl>
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => field.onChange("buy")}
                                                className={`flex-1 px-4 py-3 cursor-pointer rounded-md font-medium transition-colors ${field.value === "buy"
                                                    ? "bg-green-500 text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    }`}
                                            >
                                                Buy
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => field.onChange("short")}
                                                className={`flex-1 px-4 py-3 cursor-pointer rounded-md font-medium transition-colors ${field.value === "short"
                                                    ? "bg-red-500 text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    }`}
                                            >
                                                Short
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="purchasePrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Purchase Price</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Enter purchase price"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="target"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Target</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Enter target price"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="stopLoss"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stop Loss</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Enter stop loss price"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="1"
                                            placeholder="Enter quantity"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Update</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
