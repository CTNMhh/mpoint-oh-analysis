"use client";
import Link from "next/link";
import { CheckCircle, XCircle, Star, Video, MessageCircle, Bookmark } from "lucide-react";
import { PrimaryLinkButton, GrayButton } from "@/app/components/ui/Button";

const plans = [
	{
		name: "Free",
		price: "0€",
		period: "monatlich",
		highlight: false,
		cta: "Jetzt kostenlos starten",
		features: [
			"10 Matches pro Tag",
			"5 gespeicherte Matches",
			"Basis-Matching",
			"Öffentliche Events",
			"E-Mail Support",
		],
		premium: [],
		limits: {
			matches: 10,
			superLikes: 0,
			saved: 5,
			video: false,
			pdf: false,
			analytics: false,
		},
	},
	{
		name: "Basic",
		price: "10€",
		period: "monatlich",
		highlight: false,
		cta: "Basic wählen",
		features: [
			"25 Matches pro Tag",
			"1 Super-Like pro Tag",
			"20 gespeicherte Matches",
			"Premium-Matching",
			"Exklusive Events",
			"Teamverwaltung",
			"E-Mail & Chat Support",
		],
		premium: [
			"Gezielte Suche & Filter",
			"Match-Boost (1x/Monat)",
		],
		limits: {
			matches: 25,
			superLikes: 1,
			saved: 20,
			video: false,
			pdf: false,
			analytics: false,
		},
	},
	{
		name: "Premium",
		price: "30€",
		period: "monatlich",
		highlight: true,
		cta: "Premium wählen",
		features: [
			"100 Matches pro Tag",
			"5 Super-Likes pro Tag",
			"Unbegrenzt gespeicherte Matches",
			"Alle Matching-Features",
			"Teilnahme & eigene Events",
			"Gruppen-Chats",
			"Priorisierter Support",
		],
		premium: [
			"Video-Calls & Aufzeichnung",
			"PDF-Export von Chats",
			"Analytics Dashboard",
			"Persona-Insights",
			"Business Intelligence",
		],
		limits: {
			matches: 100,
			superLikes: 5,
			saved: "Unbegrenzt",
			video: true,
			pdf: true,
			analytics: true,
		},
	},
	{
		name: "Enterprise",
		price: "Individuell",
		period: "",
		highlight: false,
		cta: "Kontakt aufnehmen",
		features: [
			"Unbegrenzte Matches & Super-Likes",
			"Unbegrenzte gespeicherte Matches",
			"Alle Premium-Features",
			"Eigne Events & API-Zugang",
			"Individuelle Beratung",
			"Business Intelligence",
			"Priorisierter Support",
		],
		premium: [
			"Individuelle Integrationen",
			"Erweiterte Marktanalysen",
			"SLA & Onboarding",
		],
		limits: {
			matches: "Unbegrenzt",
			superLikes: "Unbegrenzt",
			saved: "Unbegrenzt",
			video: true,
			pdf: true,
			analytics: true,
		},
	},
];

export default function PricingPage() {
	return (
		<main className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-16 pt-30 px-4">
			<div className="max-w-7xl mx-auto text-center mb-12">
				<h1 className="text-4xl font-extrabold text-gray-900 mb-4">
					Preise & Pakete
				</h1>
				<p className="text-lg text-gray-600">
					Wählen Sie das passende Paket für Ihr Unternehmen. Jederzeit kündbar. Keine
					versteckten Kosten.
				</p>
			</div>

			{/* Karten-Ansicht */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
				{plans.map((plan) => (
					<div
						key={plan.name}
						className={`rounded-2xl shadow-lg bg-white p-8 flex flex-col border-2 transition-all duration-300 ${
							plan.highlight
								? "border-[rgb(228,25,31)] scale-105 shadow-2xl"
								: "border-gray-100"
						}`}
					>
						<div className="mb-4">
							<h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
								{plan.name}
								{plan.highlight && (
									<Star className="w-5 h-5 text-yellow-400" />
								)}
							</h2>
							<div className="flex items-end justify-center mb-2">
								<span className="text-4xl font-extrabold text-gray-900">
									{plan.price}
								</span>
								{plan.period && (
									<span className="text-gray-500 ml-1 mb-1">
										/ {plan.period}
									</span>
								)}
							</div>
							<p className="text-gray-500 mb-4">{plan.features[0]}</p>
						</div>
						<ul className="mb-6 space-y-2 flex-1">
							{plan.features.map((feature, i) => (
								<li
									key={feature + i}
									className="flex items-center gap-2 text-gray-800"
								>
									<CheckCircle className="w-5 h-5 text-green-500" />
									{feature}
								</li>
							))}
							{plan.premium.length > 0 && (
								<div className="mt-2 space-y-2">
									{plan.premium.map((feature, i) => (
										<li
											key={feature + i}
											className="flex items-center gap-2 text-[rgb(228,25,31)] font-medium"
										>
											<Star className="w-4 h-4" />
											{feature}
										</li>
									))}
								</div>
							)}
						</ul>

						{/* Button-Komponenten mit gewünschten Styles */}
						{plan.highlight ? (
							<PrimaryLinkButton
								href="/register"
								size="lg"
								className="w-full"
							>
								{plan.cta}
							</PrimaryLinkButton>
						) : (
							<GrayButton
								href={plan.name === "Enterprise" ? "/contact" : "/register"}
								size="md"
								className="w-full"
							>
								{plan.cta}
							</GrayButton>
						)}
					</div>
				))}
			</div>

			<div className="max-w-3xl mx-auto mt-12 text-center text-gray-500 text-sm">
				Alle Preise zzgl. MwSt. | Sie haben besondere Anforderungen?{" "}
				<Link
					href="/contact"
					className="text-[rgb(228,25,31)] underline hover:text-red-700"
				>
					Kontaktieren Sie uns!
				</Link>
			</div>
		</main>
	);
}