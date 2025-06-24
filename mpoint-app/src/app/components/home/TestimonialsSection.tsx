import React from "react";

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Was unsere Mitglieder sagen
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Erfolgsgeschichten aus unserem Netzwerk
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-700 mb-6">
              "Durch M-POINT habe ich innerhalb von nur zwei Wochen drei neue Kooperationspartner gefunden. Die Qualität der Kontakte ist außergewöhnlich gut!"
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full"></div>
              <div>
                <p className="font-semibold text-gray-900">Sarah Schmidt</p>
                <p className="text-sm text-gray-600">CEO, TechInnovate GmbH</p>
              </div>
            </div>
          </div>
          {/* Testimonial 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-700 mb-6">
              "Die Events von M-POINT sind perfekt organisiert. Ich habe dort nicht nur Geschäftspartner, sondern auch Mentoren und Freunde gefunden."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full"></div>
              <div>
                <p className="font-semibold text-gray-900">Michael Weber</p>
                <p className="text-sm text-gray-600">Gründer, Green Solutions</p>
              </div>
            </div>
          </div>
          {/* Testimonial 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <p className="text-gray-700 mb-6">
              "Das KI-Matching hat mir Unternehmen vorgeschlagen, an die ich nie gedacht hätte. Die Zusammenarbeit läuft hervorragend!"
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full"></div>
              <div>
                <p className="font-semibold text-gray-900">Lisa Müller</p>
                <p className="text-sm text-gray-600">Marketing Director, MediaPro</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}