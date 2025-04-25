"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Calendar, Home, FileText, Menu, X, LayoutDashboard, User } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs"

const navItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Planner",
    href: "/planner",
    icon: Calendar,
  },
  {
    name: "My Plans",
    href: "/my-plans",
    icon: LayoutDashboard,
  },
  {
    name: "Docs",
    href: "/docs",
    icon: FileText,
  },
]

export default function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">ContentAI</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1 text-sm font-medium transition-colors hover:text-foreground/80",
                pathname === item.href ? "text-foreground" : "text-foreground/60",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <SignedOut>
            <Button variant="outline" size="sm" className="hidden md:flex" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button size="sm" className="hidden md:flex" asChild>
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </SignedOut>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t"
          >
            <div className="container py-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground/80 p-2 rounded-md",
                    pathname === item.href ? "bg-muted text-foreground" : "text-foreground/60",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-2 border-t">
                <SignedIn>
                  <div className="flex items-center gap-2 p-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Account</span>
                    <div className="ml-auto">
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  </div>
                </SignedIn>

                <SignedOut>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                  <Button size="sm" className="w-full" asChild>
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </SignedOut>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
