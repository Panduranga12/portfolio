"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Github, Facebook, Mail, ArrowRight, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function safeNext(value: string | null) { return value?.startsWith("/") && !value.startsWith("//") ? value : "/cart" }

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next: string | null }) {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"credentials" | "code">("credentials")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => { if (mode === "login") setEmail(window.localStorage.getItem("portfolio-auth-email") || "") }, [mode])

  const redirectTo = `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=${encodeURIComponent(safeNext(next))}`
  const finish = () => { window.localStorage.setItem("portfolio-auth-email", email); window.location.assign(safeNext(next)) }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("")
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message.toLowerCase().includes("confirm") ? "Please confirm your email before signing in." : "Invalid email or password.")
      else finish()
    } else if (step === "credentials") {
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
      if (error) setError(error.message.toLowerCase().includes("rate") ? "Too many attempts. Please try again later." : "We couldn&apos;t send that code. Check your email and try again.")
      else { setStep("code"); setMessage("Your verification code is on its way.") }
    } else {
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" })
      if (error) setError("That code is invalid or expired. Please request a new one.")
      else { const { error: passwordError } = await supabase.auth.updateUser({ password }); if (passwordError) setError("Please choose a stronger password."); else finish() }
    }
    setLoading(false)
  }

  async function oauth(provider: "google" | "github" | "facebook") { setLoading(true); setError(""); const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } }); if (error) { setError("That sign-in option is currently unavailable."); setLoading(false) } }

  return <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div className="mb-8"><p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-600">Arihant Katiyar / member area</p><h1 className="mt-3 font-serif text-5xl font-bold leading-none">{mode === "login" ? "Welcome back." : "Let&apos;s make it official."}</h1><p className="mt-4 text-base leading-relaxed text-gray-600">{mode === "login" ? "Sign in to check your orders and keep your creative journey moving." : "Create an account with your email, then confirm it with a one-time code."}</p></div>
    <div className="grid grid-cols-3 gap-3"><button onClick={() => oauth("google")} className="flex h-12 items-center justify-center rounded-xl border-2 border-black bg-white font-semibold transition hover:-translate-y-1 hover:bg-[#FFC224]" aria-label="Continue with Google">G</button><button onClick={() => oauth("github")} className="flex h-12 items-center justify-center rounded-xl border-2 border-black bg-white transition hover:-translate-y-1 hover:bg-[#8B5CF6]" aria-label="Continue with GitHub"><Github size={20}/></button><button onClick={() => oauth("facebook")} className="flex h-12 items-center justify-center rounded-xl border-2 border-black bg-white transition hover:-translate-y-1 hover:bg-[#FF6B7A]" aria-label="Continue with Facebook"><Facebook size={20}/></button></div>
    <div className="my-7 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-400"><span className="h-px flex-1 bg-gray-300"/>or email<span className="h-px flex-1 bg-gray-300"/></div>
    <form onSubmit={submit} className="space-y-4"><label className="block"><span className="mb-2 block font-semibold">Email address</span><div className="flex items-center rounded-xl border-2 border-black bg-white px-4 focus-within:ring-4 focus-within:ring-blue-200"><Mail size={18}/><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-14 w-full bg-transparent px-3 outline-none" placeholder="you@example.com" autoComplete="email" /></div></label>{step === "code" && mode === "signup" ? <><label className="block"><span className="mb-2 block font-semibold">Verification code</span><input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e => setCode(e.target.value)} className="h-14 w-full rounded-xl border-2 border-black bg-white px-4 text-2xl tracking-[0.4em] outline-none focus:ring-4 focus:ring-blue-200" placeholder="000000" /></label><label className="block"><span className="mb-2 block font-semibold">Set a password</span><input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-14 w-full rounded-xl border-2 border-black bg-white px-4 outline-none focus:ring-4 focus:ring-blue-200" placeholder="8+ characters" autoComplete="new-password" /></label></> : mode === "login" ? <label className="block"><span className="mb-2 block font-semibold">Password</span><input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-14 w-full rounded-xl border-2 border-black bg-white px-4 outline-none focus:ring-4 focus:ring-blue-200" placeholder="Your password" autoComplete="current-password" /></label> : null}<button disabled={loading} className="flex h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-black text-white font-bold transition hover:-translate-y-1 hover:bg-blue-600 disabled:opacity-60">{loading ? <Loader2 className="animate-spin" size={20}/> : <>{mode === "login" ? "Sign in" : step === "credentials" ? "Send verification code" : "Create account"}<ArrowRight size={18}/></>}</button></form>
    {message && <p className="mt-4 rounded-xl bg-[#FFC224] p-3 text-sm font-semibold">{message}</p>}{error && <p role="alert" className="mt-4 rounded-xl bg-[#FF6B7A] p-3 text-sm font-semibold text-black">{error}</p>}
    <p className="mt-7 text-center text-sm text-gray-600">{mode === "login" ? <>New here? <Link className="font-bold text-blue-600 underline" href={`/auth/sign-up${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Create an account</Link></> : <>Already have an account? <Link className="font-bold text-blue-600 underline" href={`/auth/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Sign in</Link></>}</p>
  </div>
}
