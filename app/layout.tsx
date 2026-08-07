import type React from "react"
import type { Metadata } from "next"

import "./globals.css"

import { Caudex, Dosis, PT_Serif_Caption } from "next/font/google"

const dosis = Dosis({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dosis",
})

const caudex = Caudex({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-caudex",
})

const ptSerifCaption = PT_Serif_Caption({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pt-serif-caption",
})

export const metadata: Metadata = {
  title: "Paperfolio - Portfolio Landing Page",
  description: "A playful portfolio landing page",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body
        className={`${dosis.variable} ${caudex.variable} ${ptSerifCaption.variable} font-sans antialiased overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  )
}
