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

const ROLE_LIMITS: Record<string, number> = {
  FREE: 1,
  BASIC: 2,
  PREMIUM: 5,
  ENTERPRISE: 100,
};

// GET - Unternehmensdaten laden
export async function GET(request: NextRequest) {
  try {
    const isConnected = await checkPrismaConnection();
    if (!isConnected) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prüfe, ob "mine=true" gesetzt ist
    const mine = request.nextUrl.searchParams.get("mine");
    if (mine === "true") {
      // Alle Unternehmen des Users laden
      const companies = await prisma.company.findMany({
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

      // Formatieren wie bisher
      const companyList = companies.map(company => ({
        id: company.id,
        name: company.name,
        legalForm: company.legalForm || "",
        foundedYear: company.foundedYear,
        registrationNumber: company.registrationNumber || "",
        employeeCount: company.employeeCount,
        employeeRange: company.employeeRange,
        annualRevenue: company.annualRevenue,
        revenueRange: company.revenueRange,
        street: company.street || "",
        zipCode: company.zipCode || "",
        district: company.district || "",
        locationAdvantages: company.locationAdvantages.map(la => la.value),
        secondaryNaceCodes: company.secondaryNaceCodes.map(nc => nc.code),
        industryTags: company.industryTags.map(it => it.value),
        branchDescription: company.branchDescription || "",
        customerType: company.customerType,
        customerCount: company.customerCount,
        exportQuota: company.exportQuota,
        marketReach: company.marketReach,
        seasonality: company.seasonality,
        leadershipStructure: company.leadershipStructure,
        decisionSpeed: company.decisionSpeed,
        decisionMakers: company.decisionMakers,
        growthPhase: company.growthPhase,
        growthRate: company.growthRate,
        expansionPlans: company.expansionPlans.map(ep => ep.type),
        sustainabilityFocus: company.sustainabilityFocus,
        digitalizationLevel: company.digitalizationLevel,
        itBudgetPercent: company.itBudgetPercent,
        certifications: company.certifications.map(c => c.name),
        complianceNeeds: company.complianceNeeds.map(cn => cn.type),
        qualityStandards: company.qualityStandards.map(qs => qs.standard),
        painPoints: company.painPoints.map(pp => pp.point),
        currentChallenges: [], // Falls du das Feld nutzt
        searchingFor: company.searchingFor.map(sf => sf.category),
        offeringTo: company.offeringTo.map(ot => ot.category),
      }));

      return NextResponse.json(companyList);
    }

    // EIN Unternehmen zurückgeben (wie bisher)
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
      return NextResponse.json(null);
    }

    const companyData = {
      id: company.id,
      name: company.name,
      legalForm: company.legalForm || "",
      foundedYear: company.foundedYear,
      registrationNumber: company.registrationNumber || "",
      employeeCount: company.employeeCount,
      employeeRange: company.employeeRange,
      annualRevenue: company.annualRevenue,
      revenueRange: company.revenueRange,
      street: company.street || "",
      zipCode: company.zipCode || "",
      district: company.district || "",
      locationAdvantages: company.locationAdvantages.map(la => la.value),
      secondaryNaceCodes: company.secondaryNaceCodes.map(nc => nc.code),
      industryTags: company.industryTags.map(it => it.value),
      branchDescription: company.branchDescription || "",
      customerType: company.customerType,
      customerCount: company.customerCount,
      exportQuota: company.exportQuota,
      marketReach: company.marketReach,
      seasonality: company.seasonality,
      leadershipStructure: company.leadershipStructure,
      decisionSpeed: company.decisionSpeed,
      decisionMakers: company.decisionMakers,
      growthPhase: company.growthPhase,
      growthRate: company.growthRate,
      expansionPlans: company.expansionPlans.map(ep => ep.type),
      sustainabilityFocus: company.sustainabilityFocus,
      digitalizationLevel: company.digitalizationLevel,
      itBudgetPercent: company.itBudgetPercent,
      certifications: company.certifications.map(c => c.name),
      complianceNeeds: company.complianceNeeds.map(cn => cn.type),
      qualityStandards: company.qualityStandards.map(qs => qs.standard),
      painPoints: company.painPoints.map(pp => pp.point),
      currentChallenges: [],
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

    // Unternehmens-Limit prüfen
    const companyCount = await prisma.company.count({ where: { userId: user.id } });
    const maxAllowed = ROLE_LIMITS[user.role];
    if (companyCount >= maxAllowed) {
      return NextResponse.json({
        error: `Mit deiner Rolle (${user.role}) kannst du maximal ${maxAllowed} Unternehmen anlegen.`
      }, { status: 403 });
    }

    // Employee Range automatisch bestimmen
    const getEmployeeRange = (count: number) => {
      if (count === 1) return "SOLO";
      if (count <= 9) return "MICRO";
      if (count <= 49) return "SMALL";
      if (count <= 249) return "MEDIUM";
      return "LARGE";
    };
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

    // Felder, die nicht ins Model gehören, entfernen
    const {
      primaryNaceCode, // <-- entfernen!
      ...companyData
    } = body;

    // Neues Unternehmen anlegen
    const company = await prisma.company.create({
      data: {
        userId: user.id,
        name: body.name,
        legalForm: body.legalForm || null,
        foundedYear: body.foundedYear,
        registrationNumber: body.registrationNumber || null,
        employeeCount: body.employeeCount,
        employeeRange: employeeRange as any,
        annualRevenue: body.annualRevenue || 0,
        revenueRange: revenueRange as any,
        street: body.street || null,
        zipCode: body.zipCode || null,
        district: body.district || null,
        customerType: body.customerType as any,
        customerCount: customerCount as any,
        exportQuota: body.exportQuota || 0,
        marketReach: body.marketReach as any,
        seasonality: body.seasonality as any,
        leadershipStructure: body.leadershipStructure as any,
        decisionSpeed: body.decisionSpeed as any,
        decisionMakers: body.decisionMakers || 1,
        growthPhase: body.growthPhase as any,
        growthRate: body.growthRate || 0,
        sustainabilityFocus: body.sustainabilityFocus || 5,
        digitalizationLevel: body.digitalizationLevel ?? 1,
        itBudgetPercent: body.itBudgetPercent ?? null,
        branchDescription: body.branchDescription || null,
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

    return NextResponse.json({ 
      success: true, 
      message: "Unternehmensprofil erfolgreich gespeichert",
      companyId: company.id
    });

  } catch (error) {
    console.error("Fehler beim Speichern:", error);
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