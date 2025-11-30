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
            .lt("created_at", tomorrow.toISOString())
            .order("created_at", { ascending: false });

        if (error) throw error;

        return Response.json({
            success: true,
            data: positions || [],
        });
    } catch (err) {
        console.error("Error fetching today's trades:", err.message);
        return Response.json({ error: err.message }, { status: 500 });
    }
}
