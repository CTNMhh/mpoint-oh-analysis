import React from "react";

export default function AdminFooter() {
  return (
    <footer className="w-full bg-gray-900 text-white py-4 px-8 text-center">
      &copy; {new Date().getFullYear()} Admin Bereich – mpoint
    </footer>
  );
}