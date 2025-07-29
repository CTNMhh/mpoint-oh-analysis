import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Profil-Vollständigkeit und Verbesserungsvorschläge
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        company: {
          include: {
            locationAdvantages: true,
            painPoints: true,
            searchingFor: true,
            offeringTo: true,
            expansionPlans: true,
          }
        }
      }
    });

    if (!user?.company[0]) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const company = user.company[0];

    // Verbesserungsvorschläge basierend auf fehlenden Daten
    const suggestions = [];

    if (!company.branchDescription || company.branchDescription.length < 50) {
      suggestions.push({
        category: "Geschäftsmodell",
        field: "branchDescription",
        title: "Branchenbeschreibung vervollständigen",
        description: "Eine detaillierte Beschreibung Ihrer Branche verbessert das Matching erheblich",
        impact: "high",
        points: 5
      });
    }

    if (company.painPoints.length < 3) {
      suggestions.push({
        category: "Matching",
        field: "painPoints",
        title: "Mehr Herausforderungen hinzufügen",
        description: "Je mehr Herausforderungen Sie definieren, desto besser können Lösungsanbieter Sie finden",
        impact: "high",
        points: 8
      });
    }

    if (company.searchingFor.length < 3) {
      suggestions.push({
        category: "Matching",
        field: "searchingFor",
        title: "Suchkriterien erweitern",
        description: "Definieren Sie präzise, was Sie suchen, um bessere Matches zu erhalten",
        impact: "high",
        points: 8
      });
    }

    if (company.offeringTo.length < 3) {
      suggestions.push({
        category: "Matching",
        field: "offeringTo",
        title: "Angebote detaillieren",
        description: "Je mehr Sie über Ihre Angebote mitteilen, desto eher werden Sie gefunden",
        impact: "high",
        points: 9
      });
    }


    if (company.locationAdvantages.length === 0) {
      suggestions.push({
        category: "Lokation",
        field: "locationAdvantages",
        title: "Standortvorteile beschreiben",
        description: "Standortvorteile können wichtige Entscheidungskriterien für Partner sein",
        impact: "medium",
        points: 3
      });
    }

    if (!company.annualRevenue || company.annualRevenue === 0) {
      suggestions.push({
        category: "Grunddaten",
        field: "annualRevenue",
        title: "Jahresumsatz angeben",
        description: "Umsatzangaben helfen bei der Größeneinschätzung für potentielle Partner",
        impact: "medium",
        points: 2
      });
    }




    if (!company.registrationNumber) {
      suggestions.push({
        category: "Grunddaten",
        field: "registrationNumber",
        title: "Handelsregisternummer ergänzen",
        description: "Die Handelsregisternummer erhöht die Vertrauenswürdigkeit Ihres Profils",
        impact: "low",
        points: 1
      });
    }

    // Kategorien für Übersicht
    const categories = {
      "Grunddaten": suggestions.filter(s => s.category === "Grunddaten"),
      "Geschäftsmodell": suggestions.filter(s => s.category === "Geschäftsmodell"),
      "Matching": suggestions.filter(s => s.category === "Matching"),
      "Wachstum": suggestions.filter(s => s.category === "Wachstum"),
      "Lokation": suggestions.filter(s => s.category === "Lokation"),
      "Qualität": suggestions.filter(s => s.category === "Qualität")
    };

    // Potential Points
    const potentialPoints = suggestions.reduce((sum, s) => sum + s.points, 0);
    const maxPossibleCompletion = company.profileCompleteness + (potentialPoints * 100 / 100); // Vereinfacht
    // Beispielhafte Berechnung (du kannst die Logik anpassen)
    const fields = [
      company.name,
      company.legalForm,
      company.foundedYear,
      company.registrationNumber,
      company.employeeCount,
      company.annualRevenue,
      company.street,
      company.zipCode,
      company.district,
      company.branchDescription,
      company.matchingScore,
      company.companyDescription,
      company.digitalizationLevel,
      company.itBudgetPercent,

      // ...weitere wichtige Felder...
    ];
    const filledFields = fields.filter(f => f && f !== "" && f !== 0).length;
    const completeness = fields.length > 0 ? filledFields / fields.length : 0;

    // Vollständigkeit final berechnen
    let finalCompletion = Math.min(100, Math.max(0, Math.round(completeness * 100)));

    // Wenn keine Vorschläge vorhanden sind, dann 100% setzen
    if (suggestions.length === 0) {
      finalCompletion = 100;
    }

    return NextResponse.json({
      currentCompletion: finalCompletion,
      potentialCompletion: 100,
      improvementPotential: Math.max(0, 100 - finalCompletion),
      suggestions,
      categorizedSuggestions: categories,
      summary: {
        totalSuggestions: suggestions.length,
        highImpact: suggestions.filter(s => s.impact === "high").length,
        mediumImpact: suggestions.filter(s => s.impact === "medium").length,
        lowImpact: suggestions.filter(s => s.impact === "low").length,
        potentialPoints
      }
    });

  } catch (error) {
    console.error("Error getting completion status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}