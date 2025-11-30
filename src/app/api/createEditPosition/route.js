import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
    try {
        const body = await req.json();
        const { stock, entryType, purchasePrice, target, stopLoss, quantity } = body;

        // Basic validation
        if (!stock || !entryType) {
            return Response.json({ error: "stock and entryType are required" }, { status: 400 });
        }


        // Insert into Supabase
        const { data, error } = await supabase
            .from("positions")
            .insert([
                {
                    stock,
                    entry_type: entryType,
                    purchase_price: parseFloat(purchasePrice),
                    target: parseFloat(target),
                    stop_loss: parseFloat(stopLoss),
                    quantity: parseFloat(quantity),
                },
            ])
            .select();

        if (error) throw error;

        return Response.json({ success: true, data });
    } catch (err) {
        console.error("Error saving position:", err.message);
        return Response.json({ error: err.message }, { status: 500 });
    }
}
