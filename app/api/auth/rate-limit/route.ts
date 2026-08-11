import { NextResponse } from "next/server"

const attempts = new Map<string, { count: number; resetAt: number }>()

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "unknown"
  const key = `${email}:${request.headers.get("x-forwarded-for") ?? "local"}`
  const now = Date.now()
  const current = attempts.get(key)
  if (!current || current.resetAt < now) { attempts.set(key, { count: 1, resetAt: now + 60_000 }); return NextResponse.json({ ok: true }) }
  if (current.count >= 5) return NextResponse.json({ ok: false }, { status: 429 })
  current.count += 1
  return NextResponse.json({ ok: true })
}
