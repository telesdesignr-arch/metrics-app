import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, expectedSessionValue } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const correctPassword = process.env.APP_PASSWORD || "";

  if (!correctPassword) {
    return NextResponse.json(
      { error: "APP_PASSWORD não configurada no servidor." },
      { status: 500 }
    );
  }

  if (password !== correctPassword) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, await expectedSessionValue(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 dias
  });

  return response;
}
