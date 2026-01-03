import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* -------------------------------------------------------
   CONFIG
------------------------------------------------------- */
const API_GATEWAY = process.env.NEXT_PUBLIC_API_GATEWAY!;
const REFRESH_URL = `${API_GATEWAY}/auth/seller/refresh-token`;

const AUTH_PAGES = [
  "/login",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
];

const DASHBOARD_PAGE = "/dashboard";
const PENDING_PAGE = "/onboarding";
const SUSPENDED_PAGE = "/suspended";

/* -------------------------------------------------------
   MAIN MIDDLEWARE
------------------------------------------------------- */
export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  /* -------------------------------------
     1️⃣ Detect access token (PRIMARY AUTH)
  ------------------------------------- */
  const hasAccessToken = req.cookies.has("access_token_seller");

  /* -------------------------------------
     2️⃣ Try refresh ONLY if needed
  ------------------------------------- */
  const refresh = hasAccessToken ? null : await tryRefresh(req);

  const isAuthenticated =
    hasAccessToken || refresh?.authenticated === true;

  /* -------------------------------------
     3️⃣ Resolve user status
  ------------------------------------- */
  const status =
    refresh?.status ??
    req.cookies.get("seller_status")?.value;

  const isAuthPage = AUTH_PAGES.some((p) =>
    pathname.startsWith(p)
  );

  /* -------------------------------------
     4️⃣ UNAUTHENTICATED
  ------------------------------------- */
  if (!isAuthenticated) {
    if (isAuthPage) {
      return NextResponse.next();
    }

    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  /* -------------------------------------
     5️⃣ AUTHENTICATED → BLOCK AUTH PAGES
  ------------------------------------- */
  if (isAuthPage) {
    return redirectByStatus(url, status, refresh);
  }

  /* -------------------------------------
     6️⃣ STATUS-BASED ROUTING
  ------------------------------------- */
  if (status === "PENDING" && !pathname.startsWith(PENDING_PAGE)) {
    url.pathname = PENDING_PAGE;
    return redirectWithCookies(url, refresh);
  }

  if (status === "SUSPENDED" && !pathname.startsWith(SUSPENDED_PAGE)) {
    url.pathname = SUSPENDED_PAGE;
    return redirectWithCookies(url, refresh);
  }

  if (
    status === "ACTIVE" &&
    (pathname.startsWith(PENDING_PAGE) ||
      pathname.startsWith(SUSPENDED_PAGE))
  ) {
    url.pathname = DASHBOARD_PAGE;
    return redirectWithCookies(url, refresh);
  }

  /* -------------------------------------
     7️⃣ ALLOW REQUEST
  ------------------------------------- */
  if (refresh?.response) return refresh.response;
  return NextResponse.next();
}

/* -------------------------------------------------------
   🔄 REFRESH HANDLER
------------------------------------------------------- */
async function tryRefresh(req: NextRequest) {
  try {
    const refreshRes = await fetch(REFRESH_URL, {
      method: "POST",
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
      credentials: "include",
    });

    if (!refreshRes.ok) return { authenticated: false };

    const res = NextResponse.next();

    /* 🔥 CRITICAL: forward refreshed cookies */
    const setCookie = refreshRes.headers.get("set-cookie");
    if (setCookie) {
      res.headers.append("set-cookie", setCookie);
    }

    const data = await refreshRes.json();

    return {
      authenticated: true,
      response: res,
      status: data.status,
    };
  } catch {
    return { authenticated: false };
  }
}

/* -------------------------------------------------------
   🔁 HELPERS
------------------------------------------------------- */
function redirectByStatus(
  url: URL,
  status?: string,
  refresh?: any
) {
  if (status === "PENDING") url.pathname = PENDING_PAGE;
  else if (status === "SUSPENDED") url.pathname = SUSPENDED_PAGE;
  else url.pathname = DASHBOARD_PAGE;

  return redirectWithCookies(url, refresh);
}

function redirectWithCookies(
  url: URL,
  refresh?: any
) {
  const res = NextResponse.redirect(url);

  /* Preserve cookies from refresh */
  if (refresh?.response) {
    refresh.response.headers.forEach((value: string, key: string) => {
      if (key.toLowerCase() === "set-cookie") {
        res.headers.append(key, value);
      }
    });
  }

  return res;
}

/* -------------------------------------------------------
   MATCHER
------------------------------------------------------- */
export const config = {
  matcher: ["/((?!_next|favicon.ico|public).*)"],
};
