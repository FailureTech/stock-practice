import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return Response.json({ error: "id is required" }, { status: 400 });
        }

        const { error } = await supabase
            .from("positions")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return Response.json({ success: true });
    } catch (err) {
        console.error("Error deleting trade:", err.message);
        return Response.json({ error: err.message }, { status: 500 });
    }
}
