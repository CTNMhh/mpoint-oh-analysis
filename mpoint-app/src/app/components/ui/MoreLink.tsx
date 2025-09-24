import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface MoreLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function MoreLink({ href, children, className = "" }: MoreLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 text-[#e60000] font-medium hover:gap-3 transition-all duration-200 hover:text-red-700 ${className}`}
    >
      {children}
      <ArrowRight className="w-4 h-4" />
    </Link>
  );
}