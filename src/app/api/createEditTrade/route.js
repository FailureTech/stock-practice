import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
    try {
        const body = await req.json();
        const { id, stock, entryType, purchasePrice, target, stopLoss, quantity, profitLoss, learning } = body;

        // Basic validation
        if (!stock || !entryType) {
            return Response.json({ error: "stock and entryType are required" }, { status: 400 });
        }

        const tradeData = {
            stock,
            entry_type: entryType,
            purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
            target: target ? parseFloat(target) : null,
            stop_loss: stopLoss ? parseFloat(stopLoss) : null,
            quantity: quantity ? parseFloat(quantity) : null,
        };

        // Add profit_loss and learning if provided
        if (profitLoss !== undefined) {
            tradeData.profit_loss = parseFloat(profitLoss);
        }
        if (learning !== undefined) {
            tradeData.learning = learning;
        }

        let data, error;

        if (id) {
            // Update existing trade
            const { data: updatedData, error: updateError } = await supabase
                .from("positions")
                .update(tradeData)
                .eq("id", id)
                .select();

            data = updatedData;
            error = updateError;
        } else {
            // Insert new trade
            const { data: insertedData, error: insertError } = await supabase
                .from("positions")
                .insert([tradeData])
                .select();

            data = insertedData;
            error = insertError;
        }

        if (error) throw error;

        return Response.json({ success: true, data });
    } catch (err) {
        console.error("Error saving trade:", err.message);
        return Response.json({ error: err.message }, { status: 500 });
    }
}
