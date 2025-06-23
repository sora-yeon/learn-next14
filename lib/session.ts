import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "./constants";

interface SessionContent {
  id?: number;
}

export default async function getSession() {
  return await getIronSession<SessionContent>(await cookies(), {
    cookieName: SESSION_COOKIE_NAME,
    password: process.env.COOKIE_PASSWORD!, // 암호화
  });
}
