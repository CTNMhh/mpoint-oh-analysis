import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Singleton für PrismaClient
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  const body = await request.json();
  const companyId = context.params.id;

  // district: "" → null
  const validDistrict = body.district && body.district !== "" ? body.district : null;

  try {
    const updated = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: body.name,
        legalForm: body.legalForm || null,
        foundedYear: body.foundedYear,
        registrationNumber: body.registrationNumber || null,
        employeeCount: body.employeeCount,
        employeeRange: body.employeeRange,
        annualRevenue: body.annualRevenue,
        revenueRange: body.revenueRange,
        street: body.street || null,
        zipCode: body.zipCode || null,
        district: validDistrict,
        locationAdvantages: {
          deleteMany: {}, // löscht alle alten
          create: body.locationAdvantages?.map((value: string) => ({ value })) || []
        },
        industryTags: {
          deleteMany: {},
          create: body.industryTags?.map((value: string) => ({ value })) || []
        },
        secondaryNaceCodes: {
          deleteMany: {},
          create: body.secondaryNaceCodes?.map((code: string) => ({ code })) || []
        },
        branchDescription: body.branchDescription || null,
        customerType: body.customerType,
        customerCount: body.customerCount,
        exportQuota: body.exportQuota,
        marketReach: body.marketReach,
        seasonality: body.seasonality,
        leadershipStructure: body.leadershipStructure,
        decisionSpeed: body.decisionSpeed,
        decisionMakers: body.decisionMakers,
        growthPhase: body.growthPhase,
        growthRate: body.growthRate,
        expansionPlans: {
          deleteMany: {},
          create: body.expansionPlans?.map((type: string) => ({ type })) || []
        },
        sustainabilityFocus: body.sustainabilityFocus,
        digitalizationLevel: body.digitalizationLevel,
        itBudgetPercent: body.itBudgetPercent,
        certifications: {
          deleteMany: {},
          create: body.certifications?.map((name: string) => ({ name })) || []
        },
        complianceNeeds: {
          deleteMany: {},
          create: body.complianceNeeds?.map((type: string) => ({ type })) || []
        },
        qualityStandards: {
          deleteMany: {},
          create: body.qualityStandards?.map((standard: string) => ({ standard })) || []
        },
        painPoints: {
          deleteMany: {},
          create: body.painPoints?.map((point: string) => ({ point, priority: 5 })) || []
        },
        searchingFor: {
          deleteMany: {},
          create: body.searchingFor?.map((category: string) => ({ category, priority: 5 })) || []
        },
        offeringTo: {
          deleteMany: {},
          create: body.offeringTo?.map((category: string) => ({ category, priority: 5 })) || []
        },
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Fehler beim Aktualisieren:", error);
    return NextResponse.json({ error: "Fehler beim Aktualisieren" }, { status: 500 });
  }
}