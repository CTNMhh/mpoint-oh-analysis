import React from 'react'
import Link from 'next/link'
import {
  FacebookIcon,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  ArrowRight
} from 'lucide-react'

const Footer = () => {
  return (
    <footer className="relative bg-[#232334] text-white">
      {/* Newsletter Section */}
      <div className="border-b" style={{ borderColor: 'oklab(0.999994 0.0000455678 0.0000200868 / 0.95)' }}>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-bold mb-4">
              Bleiben Sie auf dem Laufenden
            </h3>
            <p className="text-gray-400 mb-8 text-lg">
              Erhalten Sie die neuesten Updates zu Events, Matches und Business-Opportunities
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Ihre E-Mail-Adresse"
                className="flex-1 px-6 py-3 bg-[#2d2d44] border rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#e4191f] transition-colors"
                style={{ borderColor: 'oklab(0.999994 0.0000455678 0.0000200868 / 0.95)' }}
              />
              <button
                type="submit"
                className="bg-[#e4191f] hover:bg-[#b41e28] px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                Anmelden <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #e4191f, #b41e28)'
                }}>
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <h2 className="font-bold text-xl text-[#e4191f]">M-POINT</h2>
                <p className="text-sm text-gray-400">Business Matching 3.0</p>
              </div>
            </div>
            <p className="text-gray-400">
              Das moderne Unternehmernetzwerk für die Metropolregion Hamburg. 
              Vernetzen Sie sich mit über 350.000 Unternehmern.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-[#2d2d44] rounded-lg flex items-center justify-center hover:bg-[#e4191f] transition-colors">
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#2d2d44] rounded-lg flex items-center justify-center hover:bg-[#e4191f] transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#2d2d44] rounded-lg flex items-center justify-center hover:bg-[#e4191f] transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#2d2d44] rounded-lg flex items-center justify-center hover:bg-[#e4191f] transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-[#e4191f]">Plattform</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/discover" className="text-gray-300 hover:text-[#e4191f] transition-colors flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" /> Unternehmen entdecken
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-300 hover:text-[#e4191f] transition-colors flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" /> Events
                </Link>
              </li>
              <li>
                <Link href="/matches" className="text-gray-300 hover:text-[#e4191f] transition-colors flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" /> Meine Matches
                </Link>
              </li>
              <li>
                <Link href="/groups" className="text-gray-300 hover:text-[#e4191f] transition-colors flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" /> Gruppen
                </Link>
              </li>
              <li>
                <Link href="/mentoring" className="text-gray-300 hover:text-[#e4191f] transition-colors flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" /> Mentoring
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-[#e4191f]">Ressourcen</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-[#e4191f] transition-colors flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" /> Über uns
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-[#e4191f] transition-colors flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" /> Preise
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-[#e4191f] transition-colors flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" /> Blog
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-300 hover:text-[#e4191f] transition-colors flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" /> Hilfe Center
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-gray-300 hover:text-[#e4191f] transition-colors flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" /> API
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-6 text-[#e4191f]">Kontakt</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#e4191f] mt-1" />
                <div>
                  <p className="text-gray-300">
                    M-POINT GmbH<br />
                    Große Elbstraße 47<br />
                    22767 Hamburg
                  </p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#e4191f]" />
                <a href="tel:+494012345678" className="text-gray-300 hover:text-[#e4191f] transition-colors">
                  +49 (40) 123 456 78
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#e4191f]" />
                <a href="mailto:info@mpoint.biz" className="text-gray-300 hover:text-[#e4191f] transition-colors">
                  info@mpoint.biz
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t" style={{ borderColor: 'oklab(0.999994 0.0000455678 0.0000200868 / 0.95)' }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 M-POINT GmbH. Alle Rechte vorbehalten.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link href="/privacy" className="text-gray-300 hover:text-[#e4191f] text-sm transition-colors">
                Datenschutz
              </Link>
              <Link href="/terms" className="text-gray-300 hover:text-[#e4191f] text-sm transition-colors">
                AGB
              </Link>
              <Link href="/imprint" className="text-gray-300 hover:text-[#e4191f] text-sm transition-colors">
                Impressum
              </Link>
              <Link href="/cookies" className="text-gray-300 hover:text-[#e4191f] text-sm transition-colors">
                Cookie-Einstellungen
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#e4191f] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#b41e28] rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>
    </footer>
  )
}

export default Footer