import { NextResponse } from "next/server";

export function middleware(request) {
  const authHeader = request.headers.get("authorization");

  const USER = process.env.ACCESS_USER;
  const PASS = process.env.ACCESS_PASS;

  // Helper: always respond with 401 so browser shows login popup
  const askForAuth = () =>
    new Response("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Private Area"',
      },
    });

  // No Authorization header → ask for credentials
  if (!authHeader) {
    return askForAuth();
  }

  const [scheme, encoded] = authHeader.split(" ");

  // Not Basic auth → ask again
  if (scheme !== "Basic" || !encoded) {
    return askForAuth();
  }

  // Decode "user:pass"
  const decoded = atob(encoded);
  const [user, pass] = decoded.split(":");

  // Correct credentials → let request continue
  if (user === USER && pass === PASS) {
    return NextResponse.next();
  }

  // Wrong credentials → ask again (not 403)
  return askForAuth();
}
