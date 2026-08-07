export function LogoMarquee() {
  const items = ["UI Design", "Best UX", "Video Editing", "WordPress"]

  return (
    <div className="overflow-hidden">
      <div className="relative overflow-hidden bg-black py-16 -rotate-[5deg] mt-32 mb-16 min-w-[120vw] -mx-[10vw] left-0">
        <div className="flex items-center gap-16 animate-marquee whitespace-nowrap">
          {[...items, ...items, ...items, ...items].map((item, index) => (
            <span key={index} className="text-white text-2xl md:text-4xl font-bold tracking-tight">
              {item}
              <span className="mx-8 text-[#FFC224]">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
