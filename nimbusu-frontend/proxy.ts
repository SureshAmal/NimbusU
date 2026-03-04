import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/register"];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const accessToken = request.cookies.get("nimbusu_access")?.value;

    /* Allow public pages */
    if (publicPaths.some((p) => pathname.startsWith(p))) {
        /* If logged in, redirect to home */
        if (accessToken) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        return NextResponse.next();
    }

    /* Protect all other routes */
    if (!accessToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|api).*)",
    ],
};
