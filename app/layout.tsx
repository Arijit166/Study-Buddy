import Providers from "./providers"
import type React from "react"
import type { Metadata } from "next"
import { Roboto, Fira_Code } from "next/font/google" // Example fonts
import { Analytics } from "@vercel/analytics/react" // Updated import
import { Toaster } from "sonner"
import "./globals.css"

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] })
const firaCode = Fira_Code({ subsets: ["latin"] }) // monospace example

export const metadata: Metadata = {
  title: "AI Study Buddy",
  description: "Your AI-powered study companion for smarter learning",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${roboto.className} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}
