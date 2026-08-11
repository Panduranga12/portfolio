"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function MfaPage() {
  const [qr, setQr] = useState("")
  const [factorId, setFactorId] = useState("")
  const [code, setCode] = useState("")
  const [message, setMessage] = useState("")
  const [challengeId, setChallengeId] = useState("")
  const [nextPath, setNextPath] = useState("/cart")
  useEffect(() => {
    const pendingFactorId = window.sessionStorage.getItem("portfolio-mfa-factor-id")
    const pendingChallengeId = window.sessionStorage.getItem("portfolio-mfa-challenge-id")
    const pendingNext = window.sessionStorage.getItem("portfolio-mfa-next")
    if (pendingFactorId && pendingChallengeId) {
      setFactorId(pendingFactorId)
      setChallengeId(pendingChallengeId)
      setNextPath(pendingNext || "/cart")
      setMessage("Enter the six-digit code from your authenticator app to finish signing in.")
    }
  }, [])
  async function enroll() {
    const { data, error } = await createClient().auth.mfa.enroll({ factorType: "totp", friendlyName: "Arihant authenticator" })
    if (error) setMessage("Please sign in before setting up two-factor authentication.")
    else { setQr(data?.totp.qr_code ?? ""); setFactorId(data?.id ?? ""); setMessage("Scan the QR code, then enter the six-digit code.") }
  }
  async function verify() {
    const supabase = createClient()
    if (challengeId && factorId) {
      const result = await supabase.auth.mfa.verify({ factorId, challengeId, code })
      if (result.error) return setMessage("That code is invalid.")
      window.sessionStorage.removeItem("portfolio-mfa-factor-id")
      window.sessionStorage.removeItem("portfolio-mfa-challenge-id")
      window.sessionStorage.removeItem("portfolio-mfa-next")
      window.location.assign(nextPath)
      return
    }
    const challenge = await supabase.auth.mfa.challenge({ factorId })
    if (challenge.error || !challenge.data?.challengeId) return setMessage("Could not start verification.")
    const result = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.data.challengeId, code })
    setMessage(result.error ? "That code is invalid." : "Two-factor authentication is enabled.")
  }
  return <main className="min-h-screen bg-[#F7F4EE] px-5 py-12 text-black"><div className="mx-auto max-w-lg rounded-[2rem] border-4 border-black bg-white p-8 shadow-[10px_10px_0_0_#000]"><p className="font-mono text-xs uppercase tracking-[0.25em] text-blue-600">Account security</p><h1 className="mt-3 font-serif text-5xl font-bold">Set up 2FA.</h1><p className="mt-4 leading-relaxed text-gray-600">Protect your account with a time-based authenticator code.</p>{qr && <img src={`data:image/svg+xml;utf8,${encodeURIComponent(qr)}`} alt="Authenticator QR code" className="mx-auto my-7 h-56 w-56 rounded-xl border-2 border-black p-3" />}<button onClick={enroll} className="mt-7 h-14 w-full rounded-xl border-2 border-black bg-black font-bold text-white">{qr ? "Regenerate QR code" : "Start setup"}</button>{qr && <><input inputMode="numeric" maxLength={6} value={code} onChange={e => setCode(e.target.value)} placeholder="000000" className="mt-4 h-14 w-full rounded-xl border-2 border-black px-4 text-center text-2xl tracking-[0.4em]" /><button onClick={verify} className="mt-4 h-14 w-full rounded-xl border-2 border-black bg-[#FFC224] font-bold">Verify authenticator</button></>}{message && <p className="mt-5 rounded-xl bg-[#8B5CF6] p-3 text-sm font-semibold">{message}</p>}</div></main>
}
