'use client'

import React from "react";
import HeroSection from "./components/home/HeroSection";
import StatsSection from "./components/home/StatsSection";
import FeaturesSection from "./components/home/FeaturesSection";
import HowItWorksSection from "./components/home/HowItWorksSection";
import TestimonialsSection from "./components/home/TestimonialsSection";
import CtaSection from "./components/home/CtaSection";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
        <HeroSection />

      {/* Stats Section */}
        <StatsSection/>

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