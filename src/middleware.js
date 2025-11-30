import { NextResponse } from "next/server";

export function middleware(request) {
    const authHeader = request.headers.get("authorization");

    // These stay ONLY on the server (not exposed to client)
    const USER = process.env.ACCESS_USER;
    const PASS = process.env.ACCESS_PASS;

    // If no Authorization header → ask for credentials
    if (!authHeader) {
        return new Response("Authentication required", {
            status: 401,
            headers: {
                "WWW-Authenticate": 'Basic realm="Private Area"',
            },
        });
    }

    // Expect header like: "Basic base64(user:pass)"
    const [scheme, encoded] = authHeader.split(" ");

    if (scheme !== "Basic" || !encoded) {
        return new Response("Invalid auth", { status: 400 });
    }

    // Edge Runtime has `atob` built-in, no Node Buffer needed
    const decoded = atob(encoded);
    const [user, pass] = decoded.split(":");

    if (user === USER && pass === PASS) {
        // Correct credentials → allow request to continue
        return NextResponse.next();
    }

    return new Response("Forbidden", { status: 403 });
}
