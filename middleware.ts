import { NextRequest, NextResponse } from "next/server";
import getSession from "./lib/session";

interface Routes {
  [key: string]: boolean;
}

const publicOnlyUrls: Routes = {
  "/": true,
  "/login": true,
  "/sms": true,
  "/create-account": true,
};

// 모든 서버 리소스에 request가 들어올 때 middleware가 동작한다.
// https://nextjs.org/docs/app/api-reference/edge
export async function middleware(request: NextRequest) {
  // edge runtime. (경량 nodejs)
  //   매우 빠르고 동적으로 개인화시킨 데이터를 전달할 수 있음
  // 대부분의 node.js API를 사용할 수 없음.

  const session = await getSession();
  const exists = publicOnlyUrls[request.nextUrl.pathname];
  if (!session.id) {
    if (!exists) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else if (exists) {
    return NextResponse.redirect(new URL("/products", request.url));
  }
}

// https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"], // middleware가 API에서만 동작하고 싶으면
};
