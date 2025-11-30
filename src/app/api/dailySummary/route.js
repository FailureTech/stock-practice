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
        const buyCount = positions?.filter(p => p.entry_type === "buy").length || 0;
        const shortCount = positions?.filter(p => p.entry_type === "short").length || 0;
        const totalProfitLoss = positions?.reduce((sum, p) => {
            return sum + (parseFloat(p.profit_loss) || 0);
        }, 0) || 0;

        return Response.json({
            success: true,
            data: {
                buyCount,
                shortCount,
                totalProfitLoss,
            },
        });
    } catch (err) {
        console.error("Error fetching daily summary:", err.message);
        return Response.json({ error: err.message }, { status: 500 });
    }
}
