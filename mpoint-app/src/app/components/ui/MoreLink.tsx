import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface MoreLinkProps {
  href: string;
  children?: React.ReactNode;
  className?: string;
}

export function MoreLink({
  href,
  children = "Mehr erfahren",
  className = ""
}: MoreLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 text-[#e60000] font-medium hover:gap-3 transition-all ${className}`}
    >
      {children} <ArrowRight className="w-4 h-4" />
    </Link>
  );
}