import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Admin sayfaları için ADMIN rolü gerekli
        if (path.startsWith("/admin") && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }

        // Manager sayfaları için ADMIN veya MANAGER rolü gerekli
        if (
            path.startsWith("/manager") &&
            token?.role !== "ADMIN" &&
            token?.role !== "MANAGER"
        ) {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }

        // Lecturer sayfaları için herhangi bir rol yeterli (giriş yapmış olmak)
        if (path.startsWith("/lecturer") && !token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/admin/:path*", "/manager/:path*", "/lecturer/:path*", "/dashboard/:path*"],
};
