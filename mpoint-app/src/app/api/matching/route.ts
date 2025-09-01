import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, MatchType, MatchStatus, InteractionType } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const myCompanyId = request.nextUrl.searchParams.get("companyId");
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10");
  const excludeExisting = request.nextUrl.searchParams.get("excludeExisting") === "true";
  const layout = request.nextUrl.searchParams.get("layout"); // "netzwerk" optional
  
  if (!myCompanyId) {
    return NextResponse.json({ error: "companyId required" }, { status: 400 });
  }

  try {
    // 1. Hole mein Unternehmen mit allen relevanten Daten
    const myCompany = await prisma.company.findUnique({
      where: { id: myCompanyId },
      include: {
        user: true,
        industryTags: true,
        secondaryNaceCodes: true,
        searchingFor: true,
        offeringTo: true,
        painPoints: true,
        expansionPlans: true,
        certifications: true,
        locationAdvantages: true,
      },
    });

    if (!myCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // 2. Hole Matching-Präferenzen des Users
    const preferences = await prisma.matchingPreferences.findUnique({
      where: { userId: myCompany.userId }
    });

    // 3. Erstelle Basis-Query für andere Unternehmen
    let whereClause: any = { 
      id: { not: myCompanyId },
user: { is: { id: { not: undefined } } } 
    };

    // Filtere nach Präferenzen wenn vorhanden
    if (preferences) {
      if (preferences.preferredDistricts.length > 0) {
        whereClause.district = { in: preferences.preferredDistricts };
      }
      if (preferences.preferredSizes.length > 0) {
        whereClause.employeeRange = { in: preferences.preferredSizes };
      }
      if (preferences.preferredCustomerTypes.length > 0) {
        whereClause.customerType = { in: preferences.preferredCustomerTypes };
      }
    }

    // 4. Schließe bereits gematchte Unternehmen aus (optional)
    let excludeIds: string[] = [];
    if (excludeExisting) {
      const existingMatches = await prisma.match.findMany({
        where: {
          OR: [
            { senderCompanyId: myCompanyId },
            { receiverCompanyId: myCompanyId }
          ],
          status: { in: [MatchStatus.CONNECTED] } // Nur verbundene Matches
        },
        select: {
          senderCompanyId: true,
          receiverCompanyId: true
        }
      });

      excludeIds = existingMatches.map(m => 
        m.senderCompanyId === myCompanyId ? m.receiverCompanyId : m.senderCompanyId
      );

      if (excludeIds.length > 0) {
        whereClause.id = { 
          notIn: [...excludeIds, myCompanyId] 
        };
      }
    }

    // 5. Hole potentielle Match-Kandidaten
    const candidates = await prisma.company.findMany({
      where: whereClause,
      include: {
        user: true,
        industryTags: true,
        secondaryNaceCodes: true,
        searchingFor: true,
        offeringTo: true,
        painPoints: true,
        expansionPlans: true,
        certifications: true,
        locationAdvantages: true,
      },
      take: 200, // Mehr Kandidaten für bessere Auswahl
    });

    // 6. Erweiterte Score-Berechnung
    function calculateMatchScore(candidate: any) {
      if (!myCompany) {
        throw new Error("myCompany is null");
      }
      let score = 0;
      let matchReasons: string[] = [];
      let potentialSynergies: string[] = [];
      let commonInterests: string[] = [];
      let matchType: MatchType = MatchType.NETWORKING;

      // A. PRIMÄRE BUSINESS MATCHES (höchste Priorität)
      
      // Perfektes Angebot-Nachfrage Match
      const myOffers = myCompany.offeringTo.map((o: any) => ({
        category: o.category,
        details: o.details,
        priority: o.priority
      }));
      const candidateSearches = candidate.searchingFor.map((s: any) => ({
        category: s.category,
        details: s.details,
        priority: s.priority
      }));
      
      const mySearches = myCompany.searchingFor.map((s: any) => ({
        category: s.category,
        details: s.details,
        priority: s.priority
      }));
      const candidateOffers = candidate.offeringTo.map((o: any) => ({
        category: o.category,
        details: o.details,
        priority: o.priority
      }));

      // Ich biete was sie suchen
      let supplierMatch = false;
      myOffers.forEach((offer: any) => {
        candidateSearches.forEach((search: any) => {
          if (offer.category === search.category) {
            supplierMatch = true;
            score += 20 + (offer.priority + search.priority); // Basis + Prioritäten
            matchReasons.push(`Sie bieten "${offer.category}" - genau was gesucht wird!`);
            potentialSynergies.push(`Lieferanten-Kunden-Beziehung für ${offer.category}`);
          }
        });
      });

      // Sie bieten was ich suche
      let customerMatch = false;
      candidateOffers.forEach((offer: any) => {
        mySearches.forEach((search: any) => {
          if (offer.category === search.category) {
            customerMatch = true;
            score += 20 + (offer.priority + search.priority);
            matchReasons.push(`Bietet "${offer.category}" - genau was Sie suchen!`);
            potentialSynergies.push(`Möglicher Lieferant für ${offer.category}`);
          }
        });
      });

      // Bestimme Match-Typ basierend auf Matches
      if (supplierMatch && customerMatch) {
        matchType = MatchType.PARTNERSHIP;
        score += 15; // Bonus für beidseitiges Interesse
        matchReasons.push("Perfektes beidseitiges Match!");
      } else if (supplierMatch) {
        matchType = MatchType.SUPPLIER_CUSTOMER;
      } else if (customerMatch) {
        matchType = MatchType.SERVICE_PROVIDER;
      }

      // B. PAIN POINTS MATCHING (Probleme lösen)
      const myPainPoints = myCompany.painPoints.map((p: any) => p.point);
      const candidatePainPoints = candidate.painPoints.map((p: any) => p.point);
      
      // Gemeinsame Herausforderungen
      const commonPainPoints = myPainPoints.filter((p: string) => 
        candidatePainPoints.includes(p)
      );
      
      if (commonPainPoints.length > 0) {
        score += commonPainPoints.length * 5;
        commonInterests.push(...commonPainPoints.map((p: string) => `Gemeinsame Herausforderung: ${p}`));
        if (matchType === MatchType.NETWORKING) {
          matchType = MatchType.KNOWLEDGE_EXCHANGE;
        }
      }

      // C. GEOGRAFISCHE NÄHE (Hamburg-spezifisch)
      if (myCompany.district && candidate.district) {
        if (myCompany.district === candidate.district) {
          score += 15;
          matchReasons.push(`Gleicher Bezirk: ${myCompany.district}`);
          
          // Location Advantages
          const myLocAdvantages = myCompany.locationAdvantages.map((l: any) => l.value);
          const candidateLocAdvantages = candidate.locationAdvantages.map((l: any) => l.value);
          const commonLocAdvantages = myLocAdvantages.filter((l: string) => 
            candidateLocAdvantages.includes(l)
          );
          
          if (commonLocAdvantages.length > 0) {
            score += commonLocAdvantages.length * 2;
            commonInterests.push(...commonLocAdvantages.map((l: string) => `Standortvorteil: ${l}`));
          }
        } else {
          // Bonus für benachbarte Bezirke
          const neighboringDistricts: Record<string, string[]> = {
            "MITTE": ["ALTONA", "EIMSBUETTEL", "NORD", "HAFENCITY"],
            "ALTONA": ["MITTE", "EIMSBUETTEL", "HARBURG"],
            "EIMSBUETTEL": ["MITTE", "ALTONA", "NORD"],
            "NORD": ["MITTE", "EIMSBUETTEL", "WANDSBEK"],
            "WANDSBEK": ["NORD", "BERGEDORF"],
            "BERGEDORF": ["WANDSBEK", "HARBURG"],
            "HARBURG": ["ALTONA", "BERGEDORF"],
            "HAFENCITY": ["MITTE", "SPEICHERSTADT"],
            "SPEICHERSTADT": ["MITTE", "HAFENCITY"]
          };
          
          if (neighboringDistricts[myCompany.district]?.includes(candidate.district)) {
            score += 8;
            matchReasons.push("Benachbarte Bezirke");
          }
        }
      }

      // D. BRANCHEN & NACE-CODES
      // Primäre NACE-Code Übereinstimmung
      if (myCompany.primaryNaceCode && candidate.primaryNaceCode) {
        const myNace = myCompany.primaryNaceCode.substring(0, 2);
        const candidateNace = candidate.primaryNaceCode.substring(0, 2);
        
        if (myCompany.primaryNaceCode === candidate.primaryNaceCode) {
          score += 10;
          commonInterests.push("Identische Hauptbranche");
        } else if (myNace === candidateNace) {
          score += 5;
          commonInterests.push("Ähnliche Branche");
        }
      }

      // Industry Tags
      const myIndustries = myCompany.industryTags.map((t: any) => t.value);
      const candidateIndustries = candidate.industryTags.map((t: any) => t.value);
      const commonIndustries = myIndustries.filter((i: string) => 
        candidateIndustries.includes(i)
      );
      
      if (commonIndustries.length > 0) {
        score += Math.min(commonIndustries.length * 3, 12);
        commonInterests.push(...commonIndustries.map((i: string) => `Branche: ${i}`));
      }

      // E. UNTERNEHMENSGRÖSSE & STRUKTUR
      if (myCompany.employeeRange === candidate.employeeRange) {
        score += 5;
        matchReasons.push("Ähnliche Unternehmensgröße");
      } else {
        // Komplementäre Größen können auch interessant sein
        const sizeComplement = 
          (myCompany.employeeRange === "LARGE" && candidate.employeeRange === "SMALL") ||
          (myCompany.employeeRange === "SMALL" && candidate.employeeRange === "LARGE");
        
        if (sizeComplement) {
          score += 3;
          potentialSynergies.push("Große-Kleine Unternehmenspartnerschaft möglich");
        }
      }

      // F. WACHSTUM & EXPANSION
      if (myCompany.growthPhase === candidate.growthPhase) {
        score += 6;
        commonInterests.push(`Gleiche Wachstumsphase: ${myCompany.growthPhase}`);
      }

      // Expansion Plans
      const myExpansion = myCompany.expansionPlans.map((e: any) => e.type);
      const candidateExpansion = candidate.expansionPlans.map((e: any) => e.type);
      const commonExpansion = myExpansion.filter((e: string) => 
        candidateExpansion.includes(e)
      );
      
      if (commonExpansion.length > 0) {
        score += commonExpansion.length * 4;
        commonExpansion.forEach((e: string) => {
          potentialSynergies.push(`Gemeinsame Expansionspläne: ${e}`);
          if (e === "DIGITALIZATION" && matchType === MatchType.NETWORKING) {
            matchType = MatchType.COLLABORATION;
          }
        });
      }

      // G. DIGITALISIERUNG & INNOVATION
      const digitalizationDiff = Math.abs(myCompany.digitalizationLevel - candidate.digitalizationLevel);
      if (digitalizationDiff <= 1) {
        score += 4;
        commonInterests.push("Ähnlicher Digitalisierungsgrad");
      } else if (digitalizationDiff >= 5) {
        // Große Unterschiede können für Wissenstransfer interessant sein
        score += 2;
        potentialSynergies.push("Möglicher Digitalisierungs-Wissenstransfer");
        if (matchType === MatchType.NETWORKING) {
          matchType = MatchType.KNOWLEDGE_EXCHANGE;
        }
      }

      // H. NACHHALTIGKEIT
      const sustainabilityDiff = Math.abs(myCompany.sustainabilityFocus - candidate.sustainabilityFocus);
      if (sustainabilityDiff <= 1) {
        score += 3;
        commonInterests.push("Ähnlicher Nachhaltigkeitsfokus");
      }

      // I. ZERTIFIZIERUNGEN
      const myCerts = myCompany.certifications.map((c: any) => c.name);
      const candidateCerts = candidate.certifications.map((c: any) => c.name);
      const commonCerts = myCerts.filter((c: string) => candidateCerts.includes(c));
      
      if (commonCerts.length > 0) {
        score += commonCerts.length * 2;
        commonInterests.push(...commonCerts.map((c: string) => `Zertifizierung: ${c}`));
      }

      // J. KUNDEN & MARKT
      if (myCompany.customerType === candidate.customerType) {
        score += 4;
        commonInterests.push(`Gleicher Kundentyp: ${myCompany.customerType}`);
      }

      if (myCompany.marketReach === candidate.marketReach) {
        score += 3;
        commonInterests.push(`Gleiche Marktreichweite: ${myCompany.marketReach}`);
      }

      // K. PROFIL-QUALITÄT & AKTIVITÄT
      const profileQuality = [
        candidate.name,
        candidate.companyDescription,
        candidate.branchDescription,
        candidate.industryTags.length > 0,
        candidate.searchingFor.length > 0,
        candidate.offeringTo.length > 0,
        candidate.certifications.length > 0,
        candidate.employeeCount > 0,
        candidate.annualRevenue > 0,
        candidate.digitalizationLevel > 1
      ].filter(Boolean).length;

      score += Math.min(profileQuality, 5);

      // Aktivität (letzte Aktualisierung)
      const daysSinceUpdate = Math.floor(
        (Date.now() - new Date(candidate.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceUpdate <= 7) {
        score += 5;
        matchReasons.push("Kürzlich aktiv");
      } else if (daysSinceUpdate <= 30) {
        score += 2;
      }

      // L. ZUFÄLLIGER FAKTOR für Vielfalt
      score += Math.random() * 3;

      return {
        company: candidate,
        matchScore: Math.min(score, 100),
        matchType,
        matchReasons,
        commonInterests,
        potentialSynergies,
        lastActive: daysSinceUpdate
      };
    }

    // 7. Berechne Scores für alle Kandidaten
    const scoredMatches = candidates.map(calculateMatchScore);

    // 8. Sortiere und wähle die besten Matches
    scoredMatches.sort((a, b) => b.matchScore - a.matchScore);

    // 9. Intelligente Match-Auswahl
    let selectedMatches = [];
    
    // Nehme Top-Matches (Score > 30)
    const excellentMatches = scoredMatches.filter(m => m.matchScore > 30).slice(0, Math.ceil(limit * 0.6));
    selectedMatches.push(...excellentMatches);

    // Füge gute Matches hinzu (Score 20-30)
    if (selectedMatches.length < limit * 0.8) {
      const goodMatches = scoredMatches
        .filter(m => m.matchScore > 20 && m.matchScore <= 30)
        .slice(0, limit * 0.3);
      selectedMatches.push(...goodMatches);
    }

    // Füge diverse Match-Typen hinzu für Vielfalt
    const matchTypes = [
      MatchType.SUPPLIER_CUSTOMER,
      MatchType.PARTNERSHIP,
      MatchType.SERVICE_PROVIDER,
      MatchType.COLLABORATION,
      MatchType.KNOWLEDGE_EXCHANGE
    ];

    matchTypes.forEach(type => {
      const typeMatch = scoredMatches.find(m => 
        m.matchType === type && 
        !selectedMatches.find(s => s.company.id === m.company.id)
      );
      if (typeMatch && selectedMatches.length < limit) {
        selectedMatches.push(typeMatch);
      }
    });

    // Fülle auf mit den besten verbleibenden
    if (selectedMatches.length < limit) {
      const remaining = scoredMatches
        .filter(m => !selectedMatches.find(s => s.company.id === m.company.id))
        .slice(0, limit - selectedMatches.length);
      selectedMatches.push(...remaining);
    }

    // 10. Formatiere die Ausgabe
    const formattedMatches = await Promise.all(selectedMatches.map(async (match) => {
      // Prüfe, ob es einen offenen Match gibt (PENDING oder ACCEPTED_BY_SENDER)
      const existing = await prisma.match.findFirst({
        where: {
          senderCompanyId: myCompanyId,
          receiverCompanyId: match.company.id,
          status: { in: [MatchStatus.PENDING, MatchStatus.ACCEPTED_BY_SENDER] }
        },
        select: { status: true }
      });

      return {
        company: {
          id: match.company.id,
          name: match.company.name,
          legalForm: match.company.legalForm,
          district: match.company.district,
          employeeRange: match.company.employeeRange,
          customerType: match.company.customerType,
          marketReach: match.company.marketReach,
          growthPhase: match.company.growthPhase,
          digitalizationLevel: match.company.digitalizationLevel,
          sustainabilityFocus: match.company.sustainabilityFocus,
          description: match.company.companyDescription,
          branchDescription: match.company.branchDescription,
          industryTags: match.company.industryTags.map((t: any) => t.value),
          searchingFor: match.company.searchingFor.map((s: any) => ({
            category: s.category,
            details: s.details
          })),
          offeringTo: match.company.offeringTo.map((o: any) => ({
            category: o.category,
            details: o.details
          })),
          certifications: match.company.certifications.map((c: any) => c.name),
          painPoints: match.company.painPoints.map((p: any) => p.point),
          user: match.company.user
            ? {
                id: match.company.user.id,
                firstName: match.company.user.firstName,
                lastName: match.company.user.lastName,
                titel: match.company.user.titel
              }
            : undefined
        },
        matching: {
          score: Math.min(Math.round(match.matchScore), 100),
          percentage: Math.min(Math.round(match.matchScore), 100),
          type: match.matchType,
          reasons: match.matchReasons,
          commonInterests: match.commonInterests,
          potentialSynergies: match.potentialSynergies,
          lastActivedays: match.lastActive,
          isRecentlyActive: match.lastActive <= 7
        },
        matchStatus: existing?.status || null // <--- HIER hinzugefügt!
      };
    }));

    // 11. Logge Interaktion (optional)
    if (myCompany.user) {
      await prisma.interaction.create({
        data: {
          userId: myCompany.userId,
          companyId: myCompanyId,
          type: InteractionType.PROFILE_VIEW,
          details: {
            action: "matching_search",
            matchesFound: formattedMatches.length,
            topMatchScore: formattedMatches[0]?.matching.score || 0
          }
        }
      });
    }

    if (layout === "netzwerk") {
      const simplified = formattedMatches.map((m: any) => ({
        companyId: m.company.id,
        companyName: m.company.name,
        legalForm: m.company.legalForm,
        district: m.company.district,
        userId: m.company.user?.id,
        firstName: m.company.user?.firstName,
        lastName: m.company.user?.lastName,
        score: m.matching.score,
        percentage: m.matching.percentage,
        type: m.matching.type,
        status: m.matchStatus,
        reasons: m.matching.reasons?.slice(0, 5) || [],
        commonInterests: m.matching.commonInterests?.slice(0, 5) || [],
        potentialSynergies: m.matching.potentialSynergies?.slice(0, 3) || [],
        lastActivedays: m.matching.lastActivedays,
        isRecentlyActive: m.matching.isRecentlyActive,
      }));
      return NextResponse.json({ success: true, matches: simplified, meta: {
        totalCandidates: candidates.length,
        matchesReturned: simplified.length,
        searchCriteria: {
          excludedExisting: excludeExisting,
          limit: limit
        },
        timestamp: new Date().toISOString()
      } });
    }

    return NextResponse.json({
      success: true,
      matches: formattedMatches,
      meta: {
        totalCandidates: candidates.length,
        matchesReturned: formattedMatches.length,
        searchCriteria: {
          excludedExisting: excludeExisting,
          limit: limit
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Matching error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}