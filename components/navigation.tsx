'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from './providers'
import { Button } from './ui/button'
import { useRouter, usePathname } from 'next/navigation'
import {
  BookOpen,
  Trophy,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Plus,
  Award
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
  requiresAuth: boolean
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: <Home className="h-4 w-4" />, requiresAuth: true },
  { name: 'Create Course', href: '/course/create', icon: <Plus className="h-4 w-4" />, requiresAuth: true },
  { name: 'Library', href: '/library', icon: <BookOpen className="h-4 w-4" />, requiresAuth: true },
  { name: 'Achievements', href: '/achievements', icon: <Award className="h-4 w-4" />, requiresAuth: true },
]

export function Navigation() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    setIsMobileMenuOpen(false)
  }

  if (loading) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-muted animate-pulse rounded"></div>
              <div className="h-6 w-24 bg-muted animate-pulse rounded"></div>
            </div>
            <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-2 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavigation(user ? '/dashboard' : '/')}
            >
              <div className="h-8 w-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Tubertify
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {user && (
                <>
                  {navItems.map((item) => (
                    <motion.div
                      key={item.href}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant={pathname === item.href ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handleNavigation(item.href)}
                        className="flex items-center space-x-2"
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Button>
                    </motion.div>
                  ))}
                  <div className="w-px h-6 bg-border mx-2"></div>
                </>
              )}

              {user ? (
                <div className="flex items-center space-x-2">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleNavigation('/profile')}
                      className="flex items-center space-x-2"
                    >
                      <User className="h-4 w-4" />
                      <span className="hidden lg:inline">Profile</span>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="flex items-center space-x-2 text-destructive hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="hidden lg:inline">Sign Out</span>
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button onClick={() => handleNavigation('/')}>
                    Get Started
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <motion.div
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-b bg-background/95 backdrop-blur"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">
              {user && (
                <>
                  {navItems.map((item) => (
                    <motion.div
                      key={item.href}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 * navItems.indexOf(item) }}
                    >
                      <Button
                        variant={pathname === item.href ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => handleNavigation(item.href)}
                      >
                        {item.icon}
                        <span className="ml-2">{item.name}</span>
                      </Button>
                    </motion.div>
                  ))}
                  <div className="border-t my-4"></div>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleNavigation('/profile')}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </motion.div>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive hover:text-destructive"
                      onClick={handleSignOut}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </motion.div>
                </>
              )}
              {!user && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                >
                  <Button className="w-full" onClick={() => handleNavigation('/')}>
                    Get Started
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}