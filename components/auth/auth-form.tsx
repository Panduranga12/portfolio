"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Github, Facebook, Mail, ArrowRight, Loader2, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function safeNext(value: string | null) { return value?.startsWith("/") && !value.startsWith("//") ? value : "/cart" }
function passwordScore(value: string) { return [value.length >= 8, /[A-Z]/.test(value), /[0-9]/.test(value), /[^A-Za-z0-9]/.test(value)].filter(Boolean).length }

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next: string | null }) {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [mfaCode, setMfaCode] = useState("")
  const [step, setStep] = useState<"credentials" | "code" | "mfa">("credentials")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [cooldown, setCooldown] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => { if (mode === "login") setEmail(window.localStorage.getItem("portfolio-auth-email") || "") }, [mode])
  useEffect(() => { if (!cooldown) return; const timer = window.setInterval(() => setCooldown(value => Math.max(0, value - 1)), 1000); return () => window.clearInterval(timer) }, [cooldown])

  const redirectBase = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`
  const redirectTo = `${redirectBase}${redirectBase.includes("?") ? "&" : "?"}next=${encodeURIComponent(safeNext(next))}`
  const finish = () => { window.localStorage.setItem("portfolio-auth-email", email); window.location.assign(safeNext(next)) }
  async function oauth(provider: "google" | "github") {
    setLoading(true); setError("")
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
    if (error) setError(error.message.toLowerCase().includes("not enabled") ? `${provider === "google" ? "Google" : "GitHub"} sign-in is not enabled in Supabase yet.` : "That sign-in option is currently unavailable.")
    setLoading(false)
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (cooldown) return
    setLoading(true); setError(""); setMessage("")
    const gate = await fetch("/api/auth/rate-limit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) })
    if (!gate.ok) { setError("Too many attempts. Please try again later."); setCooldown(30); setLoading(false); return }
    if (mode === "login" && step === "credentials") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message.toLowerCase().includes("confirm") ? "Please confirm your email before signing in." : "Invalid email or password.")
      else {
        const admin = data.user?.app_metadata?.role === "admin" || data.user?.user_metadata?.role === "admin"
        setIsAdmin(admin)
        const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        const { data: factors } = await supabase.auth.mfa.listFactors()
        const totp = factors?.totp?.find(factor => factor.status === "verified")
        if (totp && assurance.data.nextLevel === "aal2" && assurance.data.currentLevel !== "aal2") {
          const challenge = await supabase.auth.mfa.challenge({ factorId: totp.id })
          if (challenge.error || !challenge.data?.challengeId) {
            await supabase.auth.signOut()
            setError("Unable to start two-factor verification. Please sign in again.")
            setLoading(false)
            return
          }
          window.sessionStorage.setItem("portfolio-mfa-factor-id", totp.id)
          window.sessionStorage.setItem("portfolio-mfa-challenge-id", challenge.data.challengeId)
          window.sessionStorage.setItem("portfolio-mfa-next", safeNext(next))
          window.location.assign("/auth/mfa")
          return
        }
        finish()
      }
    } else if (mode === "signup" && step === "credentials") {
      if (passwordScore(password) < 3) { setError("Choose a stronger password using 8+ characters, a number, and a symbol."); setLoading(false); return }
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } })
      if (error) {
        const details = error.message.toLowerCase()
        setError(details.includes("rate") || details.includes("too many") ? "Too many email attempts. Please wait a moment before trying again." : "Are you sure this is your right mail...? Check the address and try again.")
      }
      else { setStep("code"); setMessage("Your verification code is on its way.") }
    } else if (mode === "signup") {
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "signup" })
      if (error) setError("That code is invalid or expired. Please request a new one.")
      else if (passwordScore(password) < 3) setError("Choose a stronger password using 8+ characters, a number, and a symbol.")
      else { const { error: passwordError } = await supabase.auth.updateUser({ password }); if (passwordError) setError("Please choose a stronger password."); else finish() }
    } else {
      const { data: factors } = await supabase.auth.mfa.listFactors(); const totp = factors?.totp?.find(factor => factor.status === "verified")
      if (!totp) { setError("Two-factor authentication is not configured."); setLoading(false); return }
      const { error } = await supabase.auth.mfa.verify({ factorId: totp.id, challengeId: (await supabase.auth.mfa.challenge({ factorId: totp.id })).data.challengeId, code: mfaCode })
      if (error) setError("That authenticator code is invalid."); else finish()
    }
    setLoading(false)
  }

  const score = passwordScore(password)
  const backHref = mode === "signup" ? "/auth/login" : "/"
  const backLabel = mode === "signup" ? "Back to login" : "Back to home"

  return <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
    <Link href={backHref} className="mb-8 inline-flex items-center rounded-lg border-2 border-black bg-white px-3 py-2 text-sm font-bold transition hover:-translate-y-0.5 hover:bg-[#FFC224]">← {backLabel}</Link>
    <div className="mb-8"><p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-600">Arihant Katiyar / member area</p><h1 className="mt-3 font-serif text-5xl font-bold leading-none">{mode === "login" ? "Welcome back." : "Lets make it official"}</h1><p className="mt-4 text-base leading-relaxed text-gray-600">{mode === "login" ? "Sign in to check your orders and keep your creative journey moving." : "Create an account with your email, then confirm it with a one-time code."}</p></div>
    {step === "mfa" && <div className="mb-5 flex items-center gap-3 rounded-xl border-2 border-black bg-[#FFC224] p-4 text-sm font-semibold"><ShieldCheck size={22} /> Two-factor verification required.</div>}
    {isAdmin && <p className="mb-4 rounded-xl border-2 border-black bg-[#8B5CF6] p-3 text-sm font-bold">Admin account recognized. Protected permissions are enforced server-side.</p>}
    {step === "credentials" && <><div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => oauth("google")} className="flex h-12 items-center justify-center rounded-xl border-2 border-black bg-white font-semibold transition hover:-translate-y-1 hover:bg-[#FFC224]" aria-label="Continue with Google">Google</button><button type="button" onClick={() => oauth("github")} className="flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-black bg-white font-semibold transition hover:-translate-y-1 hover:bg-[#8B5CF6]" aria-label="Continue with GitHub"><Github size={18}/>GitHub</button></div><div className="my-7 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-400"><span className="h-px flex-1 bg-gray-300"/>or email<span className="h-px flex-1 bg-gray-300"/></div></>}
    <form onSubmit={submit} className="space-y-4"><label className="block"><span className="mb-2 block font-semibold">Email address</span><div className="flex items-center rounded-xl border-2 border-black bg-white px-4 focus-within:ring-4 focus-within:ring-blue-200"><Mail size={18}/><input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-14 w-full bg-transparent px-3 outline-none" placeholder="you@example.com" autoComplete="email" /></div></label>{step === "mfa" ? <label className="block"><span className="mb-2 block font-semibold">Authenticator code</span><input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={mfaCode} onChange={e => setMfaCode(e.target.value)} className="h-14 w-full rounded-xl border-2 border-black bg-white px-4 text-2xl tracking-[0.4em] outline-none" placeholder="000000" /></label> : step === "code" ? <><label className="block"><span className="mb-2 block font-semibold">Verification code</span><input required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e => setCode(e.target.value)} className="h-14 w-full rounded-xl border-2 border-black bg-white px-4 text-2xl tracking-[0.4em] outline-none" placeholder="000000" /></label><label className="block"><span className="mb-2 block font-semibold">Set a password</span><input required minLength={8} type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-14 w-full rounded-xl border-2 border-black bg-white px-4 outline-none" placeholder="8+ characters" autoComplete="new-password" />{password && <div className="mt-2 flex gap-1" aria-label={`Password strength ${score} of 4`}>{[1,2,3,4].map(level => <span key={level} className={`h-2 flex-1 rounded-full ${level <= score ? "bg-blue-600" : "bg-gray-200"}`} />)}</div>}</label></> : (mode === "login" || mode === "signup") ? <label className="block"><span className="mb-2 block font-semibold">Password</span><input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="h-14 w-full rounded-xl border-2 border-black bg-white px-4 outline-none" placeholder="Your password" autoComplete="current-password" /></label> : null}<button disabled={loading || Boolean(cooldown)} className="flex h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-black text-white font-bold transition hover:-translate-y-1 hover:bg-blue-600 disabled:opacity-60">{loading ? <Loader2 className="animate-spin" size={20}/> : <>{cooldown ? `Try again in ${cooldown}s` : step === "mfa" ? "Verify and continue" : mode === "login" ? "Sign in" : step === "code" ? "Verify and create account" : "Send verification code"}<ArrowRight size={18}/></>}</button></form>
    {message && <p className="mt-4 rounded-xl bg-[#FFC224] p-3 text-sm font-semibold">{message}</p>}{error && <p role="alert" className="mt-4 rounded-xl bg-[#FF6B7A] p-3 text-sm font-semibold text-black">{error}</p>}
    <p className="mt-7 text-center text-sm text-gray-600">{mode === "login" ? <>New here? <Link className="font-bold text-blue-600 underline" href={`/auth/sign-up${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Create an account</Link></> : <>Already have an account? <Link className="font-bold text-blue-600 underline" href={`/auth/login${next ? `?next=${encodeURIComponent(next)}` : ""}`}>Sign in</Link></>}</p>
  </div>
}
