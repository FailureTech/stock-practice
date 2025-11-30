import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get today's positions
        const { data: positions, error } = await supabase
            .from("positions")
            .select("*")
            .gte("created_at", today.toISOString())
            .lt("created_at", tomorrow.toISOString());

        if (error) throw error;

        // Calculate summary
        const buyPositions = positions?.filter(p => p.entry_type === "buy") || [];
        const shortPositions = positions?.filter(p => p.entry_type === "short") || [];

        const buyCount = buyPositions.length;
        const shortCount = shortPositions.length;

        // Calculate buy amount (total invested in buy trades)
        const buyAmount = buyPositions.reduce((sum, p) => {
            const price = parseFloat(p.purchase_price) || 0;
            const qty = parseFloat(p.quantity) || 0;
            return sum + (price * qty);
        }, 0);

        // Calculate short amount (total invested in short trades)
        const shortAmount = shortPositions.reduce((sum, p) => {
            const price = parseFloat(p.purchase_price) || 0;
            const qty = parseFloat(p.quantity) || 0;
            return sum + (price * qty);
        }, 0);

        // Calculate total amount
        const totalAmount = buyAmount + shortAmount;

        // Calculate total profit/loss
        const totalProfitLoss = positions?.reduce((sum, p) => {
            return sum + (parseFloat(p.profit_loss) || 0);
        }, 0) || 0;

        return Response.json({
            success: true,
            data: {
                buyCount,
                shortCount,
                buyAmount,
                shortAmount,
                totalAmount,
                totalProfitLoss,
            },
        });
    } catch (err) {
        console.error("Error fetching daily summary:", err.message);
        return Response.json({ error: err.message }, { status: 500 });
    }
}
