"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { StockCombobox } from "@/components/stock-combobox"

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

interface Stock {
    symbol: string
    name: string
    isin: string
}

interface StockFormProps {
    stocks: Stock[]
    onTradeCreated?: () => void
}

export function StockForm({ stocks, onTradeCreated }: StockFormProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            stock: "",
            entryType: undefined,
            purchasePrice: "",
            target: "",
            stopLoss: "",
            quantity: "",
        },
    })

    async function onSubmit(values: FormValues) {
        try {
            const res = await fetch("/api/createEditTrade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });
            if (!res.ok) {
                throw new Error("Failed to create trade");
            }
            const data = await res.json();
            if (data.success) {
                alert("Trade created successfully");
                form.reset();
                onTradeCreated?.();
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error("Error creating trade:", error);
            alert("Error creating trade ");
            form.reset();
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Stock Entry Form</CardTitle>
                <CardDescription>
                    Enter your stock trading details below
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Stock Selection */}
                        <FormField
                            control={form.control}
                            name="stock"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Stock</FormLabel>
                                    <FormControl>
                                        <StockCombobox
                                            stocks={stocks}
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Entry Type */}
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

                        {/* Purchase Price */}
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
                                    <FormDescription>
                                        The price at which you bought the stock
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Target */}
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

                        {/* Stop Loss */}
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

                        {/* Quantity */}
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

                        <Button type="submit" className="w-full">
                            Submit
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
