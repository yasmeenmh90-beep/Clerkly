import type {
  Metadata,
} from "next"

import {
  Inter,
} from "next/font/google"

import "./globals.css"

import {
  AuthProvider,
} from "@/components/auth/AuthProvider"

import {
  AppShell,
} from "@/components/layout/AppShell"

import {
  ThemeProvider,
} from "@/components/ui/theme-provider"


const inter = Inter({
  subsets: ["latin"],
})


export const metadata: Metadata = {
  title: "Clerkly",
  description:
    "Secure AI-powered paperwork intake, approval, execution, and audit platform",
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppShell>
              {children}
            </AppShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}