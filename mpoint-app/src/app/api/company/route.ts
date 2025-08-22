import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

// Singleton Pattern für PrismaClient
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Debug-Funktion
async function checkPrismaConnection() {
  try {
    await prisma.$connect();
    console.log("Prisma connected successfully");

    // Verfügbare Modelle prüfen
    const models = Object.keys(prisma);
    console.log("Available Prisma models:", models.filter(m => !m.startsWith('$')));

    return true;
  } catch (error) {
    console.error("Prisma connection error:", error);
    return false;
  }
}


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const id = searchParams.get("id");

  // 1. Suche nach Unternehmen (search-Parameter)
  if (search && search.length >= 2) {
    const companies = await prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { branchDescription: { contains: search, mode: "insensitive" } },

        ]
      },
      include: {
        user: true // <-- Das ist wichtig!
      },
      take: 20
    });
    return NextResponse.json(companies);
  }

  // 2. Einzelnes Unternehmen nach ID
  if (id) {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        locationAdvantages: true,
        industryTags: true,
        secondaryNaceCodes: true,
        expansionPlans: true,
        certifications: true,
        complianceNeeds: true,
        qualityStandards: true,
        painPoints: true,
        searchingFor: true,
        offeringTo: true,
      }
    });
    return NextResponse.json(company);
  }

  // 3. Default: eigenes Unternehmen (wie bisher)
  try {
    // Debug: Prisma-Verbindung prüfen
    const isConnected = await checkPrismaConnection();
    if (!isConnected) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // User finden
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Company suchen mit allen Relations
    const company = await prisma.company.findFirst({
      where: { userId: user.id },
      include: {
        locationAdvantages: true,
        industryTags: true,
        secondaryNaceCodes: true,
        expansionPlans: true,
        certifications: true,
        complianceNeeds: true,
        qualityStandards: true,
        painPoints: true,
        searchingFor: true,
        offeringTo: true,
      }
    });

    if (!company) {
      // Noch kein Unternehmen erstellt
      return NextResponse.json(null);
    }

    // Company-Daten formatieren
    const companyData = {
      // Basis-Informationen
      id: company.id,
      name: company.name,
      legalForm: company.legalForm || "",
      foundedYear: company.foundedYear,
      registrationNumber: company.registrationNumber || "",

      // Größenklasse
      employeeCount: company.employeeCount,
      employeeRange: company.employeeRange,
      annualRevenue: company.annualRevenue,
      revenueRange: company.revenueRange,

      // Lokation
      street: company.street || "",
      zipCode: company.zipCode || "",
      district: company.district || "",
      locationAdvantages: company.locationAdvantages.map(la => la.value),

      // Branchen
      secondaryNaceCodes: company.secondaryNaceCodes.map(nc => nc.code),
      industryTags: company.industryTags.map(it => it.value),
      branchDescription: company.branchDescription || "",

      // Geschäftsmodell
      customerType: company.customerType,
      customerCount: company.customerCount,
      exportQuota: company.exportQuota,
      marketReach: company.marketReach,
      seasonality: company.seasonality,

      // Führung
      leadershipStructure: company.leadershipStructure,
      decisionSpeed: company.decisionSpeed,
      decisionMakers: company.decisionMakers,

      // Wachstum
      growthPhase: company.growthPhase,
      growthRate: company.growthRate,
      expansionPlans: company.expansionPlans.map(ep => ep.type),
      sustainabilityFocus: company.sustainabilityFocus,
      // NEU:
      digitalizationLevel: company.digitalizationLevel,
      itBudgetPercent: company.itBudgetPercent,

      // Compliance
      certifications: company.certifications.map(c => c.name),
      complianceNeeds: company.complianceNeeds.map(cn => cn.type),
      qualityStandards: company.qualityStandards.map(qs => qs.standard),

      // Matching
      painPoints: company.painPoints.map(pp => pp.point),
      currentChallenges: [], // Falls Sie das noch hinzufügen möchten
      searchingFor: company.searchingFor.map(sf => sf.category),
      offeringTo: company.offeringTo.map(ot => ot.category),
    };

    return NextResponse.json(companyData);

  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

// POST - Unternehmensdaten speichern/aktualisieren
export async function POST(request: NextRequest) {
  try {
    // Debug: Prisma-Verbindung prüfen
    const isConnected = await checkPrismaConnection();
    if (!isConnected) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // User finden
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Employee Range automatisch bestimmen
    const getEmployeeRange = (count: number) => {
      if (count === 1) return "SOLO";
      if (count <= 9) return "MICRO";
      if (count <= 49) return "SMALL";
      if (count <= 249) return "MEDIUM";
      return "LARGE";
    };

    // Revenue Range automatisch bestimmen
    const getRevenueRange = (revenue: number) => {
      if (revenue < 100000) return "MICRO";
      if (revenue < 1000000) return "SMALL";
      if (revenue < 10000000) return "MEDIUM";
      if (revenue < 50000000) return "LARGE";
      return "ENTERPRISE";
    };

    const employeeRange = getEmployeeRange(body.employeeCount);
    const revenueRange = getRevenueRange(body.annualRevenue || 0);
    const customerCount = body.customerCount || "VERY_SMALL";

    // Debug: Log the data being processed
    console.log("Processing company data for user:", user.id);

    // Prüfen ob Company bereits existiert
    let existingCompany;
    try {
      existingCompany = await prisma.company.findFirst({
        where: { userId: user.id }
      });
    } catch (error) {
      console.error("Error finding existing company:", error);
      // Wenn findUnique fehlschlägt, versuchen wir trotzdem fortzufahren
    }

    let company;

    if (existingCompany) {
      console.log("Updating existing company:", existingCompany.id);

      // Zuerst alle alten Relations löschen
      await prisma.$transaction([
        prisma.locationAdvantage.deleteMany({ where: { companyId: existingCompany.id } }),
        prisma.industryTag.deleteMany({ where: { companyId: existingCompany.id } }),
        prisma.secondaryNaceCode.deleteMany({ where: { companyId: existingCompany.id } }),
        prisma.expansionPlan.deleteMany({ where: { companyId: existingCompany.id } }),
        prisma.certification.deleteMany({ where: { companyId: existingCompany.id } }),
        prisma.complianceNeed.deleteMany({ where: { companyId: existingCompany.id } }),
        prisma.qualityStandard.deleteMany({ where: { companyId: existingCompany.id } }),
        prisma.painPoint.deleteMany({ where: { companyId: existingCompany.id } }),
        prisma.searchingFor.deleteMany({ where: { companyId: existingCompany.id } }),
        prisma.offeringTo.deleteMany({ where: { companyId: existingCompany.id } }),
      ]);

      // Update existing company
      company = await prisma.company.update({
        where: { id: existingCompany.id }, // <-- Fix: Nutze die eindeutige ID!
        data: {
          // Basis-Informationen
          name: body.name,
          legalForm: body.legalForm || null,
          foundedYear: body.foundedYear,
          registrationNumber: body.registrationNumber || null,

          // Größenklasse
          employeeCount: body.employeeCount,
          employeeRange: employeeRange as any,
          annualRevenue: body.annualRevenue || 0,
          revenueRange: revenueRange as any,

          // Lokation
          street: body.street || null,
          zipCode: body.zipCode || null,
          district: body.district || null,

          // Geschäftsmodell
          customerType: body.customerType as any,
          customerCount: customerCount as any,
          exportQuota: body.exportQuota || 0,
          marketReach: body.marketReach as any,
          seasonality: body.seasonality as any,

          // Führung
          leadershipStructure: body.leadershipStructure as any,
          decisionSpeed: body.decisionSpeed as any,
          decisionMakers: body.decisionMakers || 1,

          // Wachstum
          growthPhase: body.growthPhase as any,
          growthRate: body.growthRate || 0,
          sustainabilityFocus: body.sustainabilityFocus || 5,
          // NEU:
          digitalizationLevel: body.digitalizationLevel ?? 1,
          itBudgetPercent: body.itBudgetPercent ?? null,

          // Beschreibungen
          branchDescription: body.branchDescription || null,

          updatedAt: new Date(),

          // Relations neu erstellen
          locationAdvantages: {
            create: body.locationAdvantages?.map((value: string) => ({ value })) || []
          },
          industryTags: {
            create: body.industryTags?.map((value: string) => ({ value })) || []
          },
          secondaryNaceCodes: {
            create: body.secondaryNaceCodes?.map((code: string) => ({ code })) || []
          },
          expansionPlans: {
            create: body.expansionPlans?.map((type: string) => ({ type: type as any })) || []
          },
          certifications: {
            create: body.certifications?.map((name: string) => ({ name })) || []
          },
          complianceNeeds: {
            create: body.complianceNeeds?.map((type: string) => ({ type })) || []
          },
          qualityStandards: {
            create: body.qualityStandards?.map((standard: string) => ({ standard })) || []
          },
          painPoints: {
            create: body.painPoints?.map((point: string) => ({ point, priority: 5 })) || []
          },
          searchingFor: {
            create: body.searchingFor?.map((category: string) => ({ category, priority: 5 })) || []
          },
          offeringTo: {
            create: body.offeringTo?.map((category: string) => ({ category, priority: 5 })) || []
          },
        }
      });
    } else {
      console.log("Creating new company for user:", user.id);

      // Vor dem prisma.company.create:
      const {
        primaryNaceCode, // <-- entfernen!
        // ggf. weitere Felder, die nicht im Prisma-Model stehen
        ...companyData
      } = body;

      // Create new company
      company = await prisma.company.create({
        data: {
          userId: user.id,
          // Basis-Informationen
          name: body.name,
          legalForm: body.legalForm || null,
          foundedYear: body.foundedYear,
          registrationNumber: body.registrationNumber || null,

          // Größenklasse
          employeeCount: body.employeeCount,
          employeeRange: employeeRange as any,
          annualRevenue: body.annualRevenue || 0,
          revenueRange: revenueRange as any,

          // Lokation
          street: body.street || null,
          zipCode: body.zipCode || null,
          district: body.district || null,

          // Geschäftsmodell
          customerType: body.customerType as any,
          customerCount: customerCount as any,
          exportQuota: body.exportQuota || 0,
          marketReach: body.marketReach as any,
          seasonality: body.seasonality as any,

          // Führung
          leadershipStructure: body.leadershipStructure as any,
          decisionSpeed: body.decisionSpeed as any,
          decisionMakers: body.decisionMakers || 1,

          // Wachstum
          growthPhase: body.growthPhase as any,
          growthRate: body.growthRate || 0,
          sustainabilityFocus: body.sustainabilityFocus || 5,
          // NEU:
          digitalizationLevel: body.digitalizationLevel ?? 1,
          itBudgetPercent: body.itBudgetPercent ?? null,

          // Beschreibungen
          branchDescription: body.branchDescription || null,

          // Relations
          locationAdvantages: {
            create: body.locationAdvantages?.map((value: string) => ({ value })) || []
          },
          industryTags: {
            create: body.industryTags?.map((value: string) => ({ value })) || []
          },
          secondaryNaceCodes: {
            create: body.secondaryNaceCodes?.map((code: string) => ({ code })) || []
          },
          expansionPlans: {
            create: body.expansionPlans?.map((type: string) => ({ type: type as any })) || []
          },
          certifications: {
            create: body.certifications?.map((name: string) => ({ name })) || []
          },
          complianceNeeds: {
            create: body.complianceNeeds?.map((type: string) => ({ type })) || []
          },
          qualityStandards: {
            create: body.qualityStandards?.map((standard: string) => ({ standard })) || []
          },
          painPoints: {
            create: body.painPoints?.map((point: string) => ({ point, priority: 5 })) || []
          },
          searchingFor: {
            create: body.searchingFor?.map((category: string) => ({ category, priority: 5 })) || []
          },
          offeringTo: {
            create: body.offeringTo?.map((category: string) => ({ category, priority: 5 })) || []
          },
        }
      });
    }

    console.log("Company saved successfully:", company.id);

    return NextResponse.json({
      success: true,
      message: "Unternehmensprofil erfolgreich gespeichert",
      companyId: company.id
    });

  } catch (error) {
    console.error("Fehler beim Speichern:", error);

    // Detailliertere Fehlerinformationen
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
        type: process.env.NODE_ENV === 'development' ? (error as Error).name : undefined
      },
      { status: 500 }
    );
  }
}