import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const REFRESH_URL = `${process.env.NEXT_PUBLIC_API_GATEWAY}auth/seller/refresh-token`;

const AUTH_PAGES = [
  "/login",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
];

const PENDING_PAGE = "/onboarding";
const SUSPENDED_PAGE = "/suspended";
const DASHBOARD_PAGE = "/dashboard";

export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // -------------------------------------
  // 1️⃣ Try refresh (returns { authenticated, response, status })
  // -------------------------------------
  const refresh = await tryRefresh(req);

  // -------------------------------------
  // 2️⃣ Extract status (from cookie OR refresh response)
  // -------------------------------------
  const status =
    req.cookies.get("seller_status")?.value;

  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // -------------------------------------
  // 3️⃣ Unauthenticated users
  // -------------------------------------
  if (!refresh.authenticated) {
    if (isAuthPage) return NextResponse.next(); // allow login pages

    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // -------------------------------------
  // 4️⃣ Authenticated → block auth pages
  // -------------------------------------
  if (isAuthPage) {
    // redirect based on status
    if (status === "PENDING") {
      url.pathname = PENDING_PAGE;
      return NextResponse.redirect(url);
    }
    if (status === "SUSPENDED") {
      url.pathname = SUSPENDED_PAGE;
      return NextResponse.redirect(url);
    }
    url.pathname = DASHBOARD_PAGE;
    return NextResponse.redirect(url);
  }

  // -------------------------------------
  // 5️⃣ PENDING users → ONLY onboarding allowed
  // -------------------------------------
  if (status === "PENDING" && !pathname.startsWith(PENDING_PAGE)) {
    url.pathname = PENDING_PAGE;
    return NextResponse.redirect(url);
  }

  // -------------------------------------
  // 6️⃣ SUSPENDED users → ONLY suspended page allowed
  // -------------------------------------
  if (status === "SUSPENDED" && !pathname.startsWith(SUSPENDED_PAGE)) {
    url.pathname = SUSPENDED_PAGE;
    return NextResponse.redirect(url);
  }

  // -------------------------------------
  // 7️⃣ ACTIVE users → block onboarding & suspended
  // -------------------------------------
  if (status === "ACTIVE") {
    console.log("ACTIVE user trying to access");
    if (pathname.startsWith(PENDING_PAGE) || pathname.startsWith(SUSPENDED_PAGE)) {
      url.pathname = DASHBOARD_PAGE;
      return NextResponse.redirect(url);
    }
  }

  // -------------------------------------
  // 8️⃣ Allow request with refreshed cookies
  // -------------------------------------
  return refresh.response ?? NextResponse.next();
}

// ======================================================
// 🔄 REFRESH TOKENS — CLEAN VERSION
// ======================================================
async function tryRefresh(req: NextRequest) {
  try {
    const refreshRes = await fetch(REFRESH_URL, {
      method: "GET",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    });

    if (!refreshRes.ok) return { authenticated: false };

    const data = await refreshRes.json();

    // Create response that contains updated cookies
    const res = NextResponse.next();

    res.cookies.set("access_token_seller", data.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 60 * 15, // 15 minutes
    });

    res.cookies.set("seller_status", data.status, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    return {
      authenticated: true,
      response: res,
      status: data.status,
    };
  } catch (err) {
    return { authenticated: false };
  }
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|public).*)"],
};
