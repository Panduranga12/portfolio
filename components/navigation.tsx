"use client"

import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function Navigation() {
  async function openCart(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    const { data: { user } } = await createClient().auth.getUser()
    window.location.assign(user ? "/cart" : "/auth/login?next=/cart")
  }
  return (
    <div className="container mx-auto px-4 pt-8 pb-4">
      <nav className="flex flex-wrap items-center justify-between gap-y-2 bg-white border-4 border-black rounded-xl px-3 py-3 max-w-2xl mx-auto shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-black flex-shrink-0 shadow-[0_0_14px_4px_rgba(217,255,45,0.45)]">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-3DUw3mRuGYrg613yJoCBvDoPu0TGi2.png" alt="Arihant Katiyar logo" className="w-full h-full object-cover" />
        </div>

        <div className="order-3 basis-full flex items-center justify-center gap-4 overflow-x-auto px-1 py-1 md:order-none md:basis-auto md:flex-1 md:py-0 md:px-3">
          <Link href="/" className="text-[17px] font-bold leading-[20px] hover:opacity-70 transition-opacity">Home</Link>
          <Link href="/services" className="text-[17px] font-bold leading-[20px] hover:opacity-70 transition-opacity">Services</Link>
          <Link href="/about" className="text-[17px] font-bold leading-[20px] hover:opacity-70 transition-opacity">About</Link>
          <Link href="/portfolio" className="text-[17px] font-bold leading-[20px] hover:opacity-70 transition-opacity">Portfolio</Link>
        </div>

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <a href="/cart" onClick={openCart} className="whitespace-nowrap text-[17px] font-bold leading-[20px] hover:opacity-70 transition-opacity">Cart(0)</a>
          <Link href="/auth/login" className="whitespace-nowrap rounded-sm border-2 border-black px-3 py-3 text-[15px] font-bold hover:bg-[#FFC224] transition-colors">Login / Sign up</Link>
          <Button aria-label="Contact Arihant" className="bg-black text-white hover:bg-black/90 rounded-sm px-4 h-12 min-w-[48px] flex-shrink-0">
            <Mail className="h-5 w-5" strokeWidth={2.5} />
          </Button>
        </div>
      </nav>
    </div>
  )
}
