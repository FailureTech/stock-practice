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
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

const formSchema = z.object({
    profitLoss: z.string().min(1, "Profit/Loss is required").refine(
        (val) => !isNaN(Number(val)),
        "Please enter a valid number"
    ),
    learning: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface Trade {
    id: string
    stock: string
    entry_type: string
    profit_loss?: number
    learning?: string
}

interface ProfitLossModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    trade: Trade
    onSuccess: () => void
}

export function ProfitLossModal({
    open,
    onOpenChange,
    trade,
    onSuccess,
}: ProfitLossModalProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            profitLoss: trade.profit_loss?.toString() || "",
            learning: trade.learning || "",
        },
    })

    React.useEffect(() => {
        if (open) {
            form.reset({
                profitLoss: trade.profit_loss?.toString() || "",
                learning: trade.learning || "",
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
                    stock: trade.stock,
                    entryType: trade.entry_type,
                    profitLoss: values.profitLoss,
                    learning: values.learning,
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Profit/Loss - {trade.stock}</DialogTitle>
                    <DialogDescription>
                        Add profit/loss and learning notes for this trade
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="profitLoss"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Profit/Loss (₹)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Enter profit or loss amount"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="learning"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Learning (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add your learnings from this trade..."
                                            className="min-h-[100px]"
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
                            <Button type="submit">Save</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
