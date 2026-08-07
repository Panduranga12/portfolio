import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NewsletterSignup() {
  return (
    <div className="bg-[#FFC224] border-[3px] border-black rounded-3xl p-6 md:p-10">
      <div className="max-w-3xl mx-auto text-center">
        <h3 className="text-2xl md:text-4xl font-bold text-black mb-3">Subscribe to My Newsletter</h3>
        <p className="text-black/75 text-base md:text-lg leading-relaxed mb-6">
          Stay updated with the latest web design trends, UI/UX tips, WordPress insights, creative inspiration, and new
          portfolio projects.
        </p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
          <Input
            type="email"
            required
            placeholder="Enter your email address"
            aria-label="Email address"
            className="h-14 bg-white border-[3px] border-black rounded-xl text-black placeholder:text-gray-500"
          />
          <Button type="submit" className="h-14 bg-black text-white hover:bg-black/90 rounded-xl px-8 font-semibold">
            Subscribe
          </Button>
        </form>
      </div>
    </div>
  )
}
