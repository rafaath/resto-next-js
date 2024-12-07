// middleware.ts
import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
    publicRoutes: [
        "/",
        "/sign-in",
        "/sign-up",
        "/api/auth/callback",
        "/:franchise/:branch/:table", // Allow initial table status check
    ],
    async afterAuth(auth, req) {
        // Handle static files and next internal routes
        if (req.nextUrl.pathname.startsWith('/_next') ||
            req.nextUrl.pathname.includes('/static/') ||
            req.nextUrl.pathname.includes('.')) {
            return NextResponse.next();
        }

        // Handle root path
        if (req.nextUrl.pathname === '/') {
            return NextResponse.next();
        }

        // Handle single segment or two segment paths (invalid routes)
        const segments = req.nextUrl.pathname.split('/').filter(Boolean);
        if (segments.length === 1 || segments.length === 2) {
            return NextResponse.next(); // Will show 404
        }

        // Check if it's an auth page
        const isAuthPage = req.nextUrl.pathname.startsWith('/sign-in') ||
            req.nextUrl.pathname.startsWith('/sign-up');

        // If user is signed in and tries to access auth page
        if (auth.userId && isAuthPage) {
            const redirectTo = req.nextUrl.searchParams.get('redirect_url');
            return NextResponse.redirect(new URL(redirectTo || '/', req.url));
        }

        // For table routes (F1/B1/T1 format)
        const tableRouteMatch = req.nextUrl.pathname.match(/^\/([^\/]+)\/([^\/]+)\/([^\/]+)$/);
        if (tableRouteMatch) {
            // Let the page component handle the auth state
            return NextResponse.next();
        }

        return NextResponse.next();
    }
});

export const config = {
    matcher: [
        "/((?!api|trpc|_next/static|_next/image|favicon.ico).*)",
    ],
};