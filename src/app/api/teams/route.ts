import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Language } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language") || "FR";

    const teams = await prisma.team.findMany({
      include: {
        translations: true,
        _count: {
          select: {
            members: true,
            publications: true,
          },
        },
      },
      orderBy: {
        slug: "asc",
      },
    });

    // Formatter les données pour le frontend avec les deux langues
    const formattedTeams = teams.map((team: any) => {
      const frTranslation = team.translations.find(
        (t: any) => t.language === "FR"
      );
      const enTranslation = team.translations.find(
        (t: any) => t.language === "EN"
      );
      const currentTranslation =
        team.translations.find((t: any) => t.language === language) ||
        frTranslation;

      return {
        id: team.id,
        slug: team.slug,
        image: team.image,
        // Current language (for display)
        name: currentTranslation?.name || "Équipe sans nom",
        description: currentTranslation?.description,
        valueAdded: currentTranslation?.valueAdded,
        keywords: currentTranslation?.keywords || [],
        domains: currentTranslation?.domains || [],
        technologies: currentTranslation?.technologies || [],
        expertises: currentTranslation?.expertises || [],
        // Bilingual fields (for editing)
        name_fr: frTranslation?.name || "Équipe sans nom",
        name_en: enTranslation?.name || frTranslation?.name || "Team",
        description_fr: frTranslation?.description,
        description_en: enTranslation?.description,
        valueAdded_fr: frTranslation?.valueAdded,
        valueAdded_en: enTranslation?.valueAdded,
        createdAt: team.createdAt,
        memberCount: team._count.members,
        projectCount: team._count.publications,
        membersCount: team._count.members,
        publicationsCount: team._count.publications,
      };
    });

    return NextResponse.json({
      teams: formattedTeams,
      total: teams.length,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des équipes:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer une nouvelle équipe
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { slug, image, translations } = body;

    // Validation des données
    if (!slug || !translations || !translations.FR || !translations.EN) {
      return NextResponse.json(
        { error: "Le slug et les traductions FR et EN sont obligatoires" },
        { status: 400 }
      );
    }

    if (!translations.FR.name || !translations.EN.name) {
      return NextResponse.json(
        { error: "Le nom est obligatoire en français et en anglais" },
        { status: 400 }
      );
    }

    // Vérifier si le slug existe déjà
    const existingTeam = await prisma.team.findUnique({
      where: { slug },
    });

    if (existingTeam) {
      return NextResponse.json(
        { error: "Une équipe avec ce slug existe déjà" },
        { status: 409 }
      );
    }

    // Créer la nouvelle équipe avec les deux traductions
    const newTeam = await prisma.team.create({
      data: {
        slug,
        image,
        translations: {
          create: [
            {
              language: "FR" as Language,
              name: translations.FR.name,
              description: translations.FR.description || "",
              valueAdded: translations.FR.valueAdded,
              keywords: translations.FR.keywords || [],
              domains: translations.FR.domains || [],
              expertises: translations.FR.expertises || [],
            },
            {
              language: "EN" as Language,
              name: translations.EN.name,
              description: translations.EN.description || "",
              valueAdded: translations.EN.valueAdded,
              keywords: translations.EN.keywords || [],
              domains: translations.EN.domains || [],
              expertises: translations.EN.expertises || [],
            },
          ],
        },
      },
      include: {
        translations: true,
        _count: {
          select: {
            members: true,
            publications: true,
          },
        },
      },
    });

    // Formatter la réponse (retourner la traduction française par défaut)
    const frTranslation = (newTeam as any).translations.find(
      (t: any) => t.language === "FR"
    );

    const formattedTeam = {
      id: newTeam.id,
      slug: newTeam.slug,
      image: newTeam.image,
      name: frTranslation?.name,
      description: frTranslation?.description,
      valueAdded: frTranslation?.valueAdded,
      keywords: frTranslation?.keywords || [],
      domains: frTranslation?.domains || [],
      expertises: frTranslation?.expertises || [],
      createdAt: newTeam.createdAt,
      membersCount: (newTeam as any)._count.members,
      publicationsCount: (newTeam as any)._count.publications,
    };

    return NextResponse.json(formattedTeam, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de l'équipe:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
