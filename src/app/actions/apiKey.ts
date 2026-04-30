"use server";

import { cookies } from "next/headers";

export async function setApiKeyAction(key: string) {
  const cookieStore = await cookies();
  cookieStore.set("bou_user_api_key", key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export async function removeApiKeyAction() {
  const cookieStore = await cookies();
  cookieStore.delete("bou_user_api_key");
}

export async function getHasApiKeyAction() {
  const cookieStore = await cookies();
  return cookieStore.has("bou_user_api_key");
}
