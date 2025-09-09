import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        legalForm: true,
        district: true,
        foundedYear: true,
        primaryNaceCode: true,
        employeeRange: true,
        customerType: true,
        marketReach: true,
        branchDescription: true,
        companyDescription: true,
        painPoints: true,
        searchingFor: true,
        certifications: true,
        qualityStandards: true,
        exportQuota: true,
        growthPhase: true,
        growthRate: true,
        sustainabilityFocus: true,
        decisionSpeed: true,
        leadershipStructure: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}