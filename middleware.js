import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isValidSession } from "@/lib/adminAuth";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const isAdminPage = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";

  if (isAdminPage || isAdminApi) {
    const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
    const valid = await isValidSession(cookie);
    if (!valid) {
      if (isAdminApi) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
