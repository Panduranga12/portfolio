import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function CartPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?next=/cart")
  const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (assurance.data.currentLevel !== "aal2" && assurance.data.nextLevel === "aal2") redirect("/auth/mfa?next=/cart")
  return <main className="min-h-screen bg-background px-6 py-24"><div className="mx-auto max-w-3xl rounded-3xl border-4 border-black bg-white p-10 shadow-[8px_8px_0_0_#000]"><p className="font-mono text-sm uppercase tracking-[0.2em] text-blue-600">Private area</p><h1 className="mt-3 font-serif text-5xl font-bold">Your orders</h1><p className="mt-4 text-lg text-gray-600">You&apos;re signed in as {user.email}. Your order history will appear here.</p></div></main>
}
