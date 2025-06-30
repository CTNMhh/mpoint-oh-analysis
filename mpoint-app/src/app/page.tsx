"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import HeroSection from "./components/home/HeroSection";
import FeaturesSection from "./components/home/FeaturesSection";
import HowItWorksSection from "./components/home/HowItWorksSection";
import StatsSection from "./components/home/StatsSection";
import TestimonialsSection from "./components/home/TestimonialsSection";
import CtaSection from "./components/home/CtaSection";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect eingeloggte Benutzer zum Dashboard
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  // Zeige Loading während der Session-Prüfung
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(228,25,31)]"></div>
      </div>
    );
  }

  // Zeige die normale Startseite für nicht eingeloggte Benutzer
  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <HeroSection />

        {/* Stats Section */}
        <StatsSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* How it works Section */}
        <HowItWorksSection />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* CTA Section */}
        <CtaSection />
        {/* Floating animation keyframes */}
        <style>
          {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}
        </style>
      </main>
    );
  }

  // Während der Weiterleitung
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(228,25,31)]"></div>
    </div>
  );
}