import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export const proxy = (request) => {
  if (getSessionCookie(request)) return NextResponse.next();
  const url = new URL("/login", request.url);
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
};

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*", "/checkout/:path*"] };
