import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const REFRESH_URL = `${process.env.NEXT_PUBLIC_API_GATEWAY}/auth/user/refresh-token`;

const AUTH_PAGES = ["/login", "/register"];
const PROTECTED_PREFIX = "/account"; // protect only these paths

export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  const accessToken = req.cookies.get("access_token_user")?.value;

  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));
  const isProtected = pathname.startsWith(PROTECTED_PREFIX);

  // -------------------------------------------
  // 0️⃣ If user is logged in → block login/register
  // -------------------------------------------
  if (isAuthPage && accessToken) {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // -------------------------------------------
  // 1️⃣ Allow public pages when logged out
  // -------------------------------------------
  if (!isProtected && !isAuthPage) {
    return NextResponse.next();
  }

  // -------------------------------------------
  // 2️⃣ Auth pages are allowed when logged out
  // -------------------------------------------
  if (isAuthPage && !accessToken) {
    return NextResponse.next();
  }

  // -------------------------------------------
  // 3️⃣ Protected pages require login
  // -------------------------------------------
  if (isProtected && !accessToken) {
    const refreshed = await tryRefresh(req);
    if (refreshed) return refreshed;

    // Refresh failed → redirect to login
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // -------------------------------------------
  // 4️⃣ User logged in → allow protected pages
  // -------------------------------------------
  return NextResponse.next();
}

async function tryRefresh(req: NextRequest) {
  try {
    const refreshRes = await fetch(REFRESH_URL, {
      method: "GET",
      credentials: "include",
      headers: { cookie: req.headers.get("cookie") ?? "" },
    });

    if (!refreshRes.ok) return null;

    const data = await refreshRes.json();

    const res = NextResponse.next();

    res.cookies.set("access_token_user", data.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 60 * 15,
    });

    return res;
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|public).*)"],
};
