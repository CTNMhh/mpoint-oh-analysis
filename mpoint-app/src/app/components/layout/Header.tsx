"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, ChevronDown, Bell, User, Search, ShoppingCart } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useCart } from "@/context/CartContext";

const Header = () => {
  const { data: session, status } = useSession();
  const user = session?.user; // NextAuth User-Objekt
  const { cartCount } = useCart();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Scroll-Effekt für Header
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Klick außerhalb des Profil-Dropdowns schließt es
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileDropdownOpen]);

  // Bestimme, was angezeigt werden soll
  const showLoginButton = status === "unauthenticated";
  const showUserActions = status === "authenticated" && user;
  const showPlaceholder = status === "loading";

  // Abmelden-Handler
  function handleLogout() {
    signOut({ callbackUrl: "/login" }); // Leitet nach Logout auf /login weiter
    setIsMobileMenuOpen(false); // Mobile Menu schließen
  }

  // Mobile Menu schließen bei Link-Klick
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgb(228,25,31), rgb(180,30,40))",
              }}
            >
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <div>
              <h1 className="font-bold text-xl text-[rgb(228,25,31)]">
                M-POINT
              </h1>
              <p className="text-xs text-gray-600">Business Matching 3.0</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-[rgb(228,25,31)] font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/news"
              className="text-gray-700 hover:text-[rgb(228,25,31)] font-medium transition-colors"
            >
              News
            </Link>
            <Link
              href="/marketplace"
              className="text-gray-700 hover:text-[rgb(228,25,31)] font-medium transition-colors"
            >
              Börse
            </Link>
            <Link
              href="/events"
              className="text-gray-700 hover:text-[rgb(228,25,31)] font-medium transition-colors"
            >
              Events
            </Link>
            <Link
              href="/Matches/search"
              className="text-gray-700 hover:text-[rgb(228,25,31)] font-medium transition-colors"
            >
              Matching
            </Link>
            <Link
              href="/netzwerk"
              className="text-gray-700 hover:text-[rgb(228,25,31)] font-medium transition-colors"
            >
              Netzwerk
            </Link>
            <Link
              href="/pricing"
              className="text-gray-700 hover:text-[rgb(228,25,31)] font-medium transition-colors"
            >
              Preise
            </Link>
            <div className="relative group">
              <button className="text-gray-700 hover:text-[rgb(228,25,31)] font-medium transition-colors flex items-center gap-1">
                Mehr <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full mt-2 w-48 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link
                  href="/about"
                  className="block px-4 py-3 hover:bg-[rgb(228,25,31,0.07)] transition-colors"
                >
                  Über uns
                </Link>
                <Link
                  href="/support"
                  className="block px-4 py-3 hover:bg-[rgb(228,25,31,0.07)] transition-colors"
                >
                  Support
                </Link>
              </div>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Loading Placeholder */}
            {showPlaceholder && (
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            )}

            {/* Wenn NICHT eingeloggt: "Jetzt starten" Button */}
            {showLoginButton && (
              <div className="relative group">
                <button className="bg-[rgb(228,25,31)] hover:bg-[rgb(180,30,40)] text-white px-6 py-2.5 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2">
                  Jetzt starten
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link
                    href="/login"
                    className="block px-4 py-3 hover:bg-[rgb(228,25,31,0.07)] transition-colors text-gray-800"
                  >
                    Anmelden
                  </Link>
                  <Link
                    href="/register"
                    className="block px-4 py-3 hover:bg-[rgb(228,25,31,0.07)] transition-colors text-gray-800"
                  >
                    Registrieren
                  </Link>
                </div>
              </div>
            )}

            {/* Wenn eingeloggt: Such-, Benachrichtigungs- und Profil-Icons */}
            {showUserActions && (
              <>
                {/* Search */}
                <button className="p-2 hover:bg-[rgb(228,25,31,0.07)] rounded-lg transition-colors">
                  <Search className="w-5 h-5 text-gray-600" />
                </button>
                {/* Notifications */}
                <button className="p-2 hover:bg-[rgb(228,25,31,0.07)] rounded-lg transition-colors relative">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[rgb(228,25,31)] rounded-full"></span>
                </button>
                {/* Warenkorb-Icon */}
                <Link href="/cart" className="relative group">
                  <ShoppingCart className="w-6 h-6 text-gray-600" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                      {cartCount}
                    </span>
                  )}
                </Link>
                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen((v) => !v)}
                    className="flex items-center space-x-2 p-2 hover:bg-[rgb(228,25,31,0.07)] rounded-lg transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, rgb(228,25,31), rgb(180,30,40))",
                      }}
                    >
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  </button>
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl">
                      <div className="p-4 border-b">
                        <p className="font-semibold text-gray-900">
                          {`${user.firstName} ${user.lastName}`}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2 hover:bg-[rgb(228,25,31,0.07)] transition-colors"
                        >
                          Dashboard
                        </Link>
                        <Link
                          href="/company"
                          className="block px-4 py-2 hover:bg-[rgb(228,25,31,0.07)] transition-colors"
                        >
                          Mein Profil
                        </Link>
                        <Link
                          href="/settings"
                          className="block px-4 py-2 hover:bg-[rgb(228,25,31,0.07)] transition-colors"
                        >
                          Einstellungen
                        </Link>
                        <hr className="my-2" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 hover:bg-[rgb(228,25,31,0.07)] transition-colors text-[rgb(228,25,31)]"
                        >
                          Abmelden
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-[rgb(228,25,31)] transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-6 space-y-4">
              {/* Navigation Links */}
              <div className="space-y-2">
                <Link
                  href="/netzwerk"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 text-gray-700 hover:text-[rgb(228,25,31)] hover:bg-[rgb(228,25,31,0.07)] rounded-lg transition-colors"
                >
                  Netzwerk
                </Link>
                <Link
                  href="/Matches/search"
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 text-gray-700 hover:text-[rgb(228,25,31)] hover:bg-[rgb(228,25,31,0.07)] rounded-lg transition-colors"
                >
                  Matches
                </Link>
              </div>

              {/* User Section */}
              {showUserActions && user && (
                <div className="pt-4 border-t border-gray-200">
                  {/* User Info */}
                  <div className="px-4 py-3 bg-gray-50 rounded-lg mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg, rgb(228,25,31), rgb(180,30,40))",
                        }}
                      >
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {`${user.firstName} ${user.lastName}`}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* User Actions */}
                  <div className="space-y-2">
                    <Link
                      href="/dashboard"
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 text-gray-700 hover:text-[rgb(228,25,31)] hover:bg-[rgb(228,25,31,0.07)] rounded-lg transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/company"
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 text-gray-700 hover:text-[rgb(228,25,31)] hover:bg-[rgb(228,25,31,0.07)] rounded-lg transition-colors"
                    >
                      Mein Profil
                    </Link>
                    <Link
                      href="/settings"
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 text-gray-700 hover:text-[rgb(228,25,31)] hover:bg-[rgb(228,25,31,0.07)] rounded-lg transition-colors"
                    >
                      Einstellungen
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-[rgb(228,25,31)] hover:bg-[rgb(228,25,31,0.07)] rounded-lg transition-colors"
                    >
                      Abmelden
                    </button>
                  </div>
                </div>
              )}

              {/* Login/Register für nicht eingeloggte User */}
              {showLoginButton && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 text-center bg-[rgb(228,25,31)] text-white rounded-lg font-medium hover:bg-[rgb(180,30,40)] transition-colors"
                  >
                    Anmelden
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 text-center border border-[rgb(228,25,31)] text-[rgb(228,25,31)] rounded-lg font-medium hover:bg-[rgb(228,25,31,0.07)] transition-colors"
                  >
                    Registrieren
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;