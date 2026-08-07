"use client"

import { useEffect, useState } from "react"
import { Mail, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

const roles = ["Web Designer", "Video Editor"]

export function HeroSection() {
  const [roleIndex, setRoleIndex] = useState(0)
  const [displayedRole, setDisplayedRole] = useState(roles[0])
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentRole = roles[roleIndex]
    const isComplete = displayedRole === currentRole
    const delay = isComplete && !isDeleting ? 1800 : isDeleting ? 70 : 110

    const timer = window.setTimeout(() => {
      if (!isDeleting && isComplete) {
        setIsDeleting(true)
      } else if (isDeleting && displayedRole.length === 0) {
        setIsDeleting(false)
        setRoleIndex((index) => (index + 1) % roles.length)
      } else {
        setDisplayedRole(
          isDeleting ? currentRole.slice(0, displayedRole.length - 1) : currentRole.slice(0, displayedRole.length + 1),
        )
      }
    }, delay)

    return () => window.clearTimeout(timer)
  }, [displayedRole, isDeleting, roleIndex])
  return (
    <section className="container mx-auto px-4 py-16 md:py-24">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h1 className="font-sans text-[42px] leading-[50px] md:text-[72px] font-bold md:leading-[85px]">
            I&apos;m <span className="bg-[#FF6B7A] text-white px-3 py-1 inline-block">Arihant Katiyar</span>, a{" "}
            <span className="bg-[#2F81F7] text-white px-3 py-1 inline-block min-w-[220px]">{displayedRole}<span className="ml-1 inline-block animate-pulse">|</span></span>{" "}
            from <span className="bg-[#2F81F7] text-white px-3 py-1 inline-block">India</span>
          </h1>

          <p className="font-mono text-[#393939] text-[16px] md:text-[18px] font-medium leading-[28px] md:leading-[30px] max-w-xl">
            I Design Websites with Finesse, crafting modern, responsive, and user-focused digital experiences that blend
            stunning visuals with seamless functionality.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-7 pt-4">
            <Button className="bg-[#0B0B0B] text-white hover:bg-black/90 rounded-lg py-5 px-8 md:py-[22px] md:px-[62px] text-base md:text-lg font-semibold h-auto w-full sm:w-auto sm:min-w-[240px]">
              <Mail className="w-5 h-5" />
              Get in touch
            </Button>
            <Button
              variant="outline"
              className="bg-white border-[3px] border-black hover:bg-gray-50 rounded-lg py-5 px-8 md:py-[22px] md:px-[62px] text-base md:text-lg font-semibold h-auto w-full sm:w-auto sm:min-w-[240px]"
            >
              <FolderOpen className="w-5 h-5" />
              View portfolio
            </Button>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <div className="relative w-full max-w-md aspect-square bg-[#FDB927] border-4 border-black rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <img
              src="/images/design-mode/63407fbdc2d4ac5270385fd4_home-he.png"
              alt="Illustrated character avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
