// middleware.ts
import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
    publicRoutes: [
        "/sign-in",
        "/sign-up",
        "/api/auth/callback",
        "/",
        "/:franchise/:branch/:table", // Allow initial table status check
    ],
    async afterAuth(auth, req) {
        // Handle static files and next internal routes
        if (req.nextUrl.pathname.startsWith('/_next') ||
            req.nextUrl.pathname.includes('/static/') ||
            req.nextUrl.pathname.includes('.')) {
            return NextResponse.next();
        }

        // Check if it's an auth page
        const isAuthPage = req.nextUrl.pathname.startsWith('/sign-in') ||
            req.nextUrl.pathname.startsWith('/sign-up');

        // If user is signed in and tries to access auth page
        if (auth.userId && isAuthPage) {
            // Get the redirect URL from query params
            const redirectTo = req.nextUrl.searchParams.get('redirect_url');
            return NextResponse.redirect(new URL(redirectTo || '/', req.url));
        }

        // Check if it's a table route
        const tableRouteMatch = req.nextUrl.pathname.match(/^\/([^\/]+)\/([^\/]+)\/([^\/]+)$/);
        if (tableRouteMatch) {
            // No need to redirect here, let the page component handle the auth state
            return NextResponse.next();
        }

        return NextResponse.next();
    }
});

export const config = {
    matcher: [
        // Match all paths except static files and API routes
        "/((?!api|trpc|_next/static|_next/image|favicon.ico).*)",
    ],
};