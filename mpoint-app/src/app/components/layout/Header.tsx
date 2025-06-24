'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, ChevronDown, Bell, User, Search } from 'lucide-react'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Scroll-Effekt für Header
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Klick außerhalb des Profil-Dropdowns schließt es
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false)
      }
    }
    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isProfileDropdownOpen])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgb(228,25,31), rgb(180,30,40))',
              }}
            >
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-[rgb(228,25,31)]">M-POINT</h1>
              <p className="text-xs text-gray-600">Business Matching 3.0</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/discover" className="text-gray-700 hover:text-[rgb(228,25,31)] font-medium transition-colors">
              Entdecken
            </Link>
            <Link href="/events" className="text-gray-700 hover:text-[rgb(228,25,31)] font-medium transition-colors">
              Events
            </Link>
            <Link href="/matches" className="text-gray-700 hover:text-[rgb(228,25,31)] font-medium transition-colors">
              Matches
            </Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-[rgb(228,25,31)] font-medium transition-colors flex items-center gap-1">
                Mehr <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full mt-2 w-48 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link href="/about" className="block px-4 py-3 hover:bg-[rgb(228,25,31,0.07)] transition-colors">
                  Über uns
                </Link>
                <Link href="/pricing" className="block px-4 py-3 hover:bg-[rgb(228,25,31,0.07)] transition-colors">
                  Preise
                </Link>
                <Link href="/support" className="block px-4 py-3 hover:bg-[rgb(228,25,31,0.07)] transition-colors">
                  Support
                </Link>
              </div>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 hover:bg-[rgb(228,25,31,0.07)] rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            {/* Notifications */}
            <button className="p-2 hover:bg-[rgb(228,25,31,0.07)] rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[rgb(228,25,31)] rounded-full"></span>
            </button>
            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileDropdownOpen((v) => !v)}
                className="flex items-center space-x-2 p-2 hover:bg-[rgb(228,25,31,0.07)] rounded-lg transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgb(228,25,31), rgb(180,30,40))',
                  }}
                >
                  <User className="w-4 h-4 text-white" />
                </div>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl">
                  <div className="p-4 border-b">
                    <p className="font-semibold text-gray-900">Max Mustermann</p>
                    <p className="text-sm text-gray-600">max@unternehmen.de</p>
                  </div>
                  <div className="py-2">
                    <Link href="/profile" className="block px-4 py-2 hover:bg-[rgb(228,25,31,0.07)] transition-colors">
                      Mein Profil
                    </Link>
                    <Link href="/company" className="block px-4 py-2 hover:bg-[rgb(228,25,31,0.07)] transition-colors">
                      Unternehmensprofil
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 hover:bg-[rgb(228,25,31,0.07)] transition-colors">
                      Einstellungen
                    </Link>
                    <hr className="my-2" />
                    <button className="block w-full text-left px-4 py-2 hover:bg-[rgb(228,25,31,0.07)] transition-colors text-[rgb(228,25,31)]">
                      Abmelden
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* CTA Button */}
            <Link
              href="/register"
              className="bg-[rgb(228,25,31)] hover:bg-[rgb(180,30,40)] text-white px-6 py-2.5 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              Jetzt starten
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="lg:hidden p-2 hover:bg-[rgb(228,25,31,0.07)] rounded-lg transition-colors"
            aria-label="Menü öffnen"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <div className="space-y-2">
              <Link href="/discover" className="block px-4 py-3 hover:bg-[rgb(228,25,31,0.07)] rounded-lg transition-colors">
                Entdecken
              </Link>
              <Link href="/events" className="block px-4 py-3 hover:bg-[rgb(228,25,31,0.07)] rounded-lg transition-colors">
                Events
              </Link>
              <Link href="/matches" className="block px-4 py-3 hover:bg-[rgb(228,25,31,0.07)] rounded-lg transition-colors">
                Matches
              </Link>
              <Link href="/about" className="block px-4 py-3 hover:bg-[rgb(228,25,31,0.07)] rounded-lg transition-colors">
                Über uns
              </Link>
              <div className="pt-4 space-y-2">
                <Link href="/login" className="block w-full text-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-[rgb(228,25,31,0.07)] transition-colors">
                  Anmelden
                </Link>
                <Link href="/register" className="block w-full text-center px-4 py-3 bg-[rgb(228,25,31)] hover:bg-[rgb(180,30,40)] text-white rounded-lg font-medium">
                  Registrieren
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header