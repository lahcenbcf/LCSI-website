import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Language } from "@/generated/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: teamId } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language") || "FR";

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        translations: true, // Get all translations (FR and EN)
        _count: {
          select: {
            members: true,
            publications: true,
          },
        },
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Équipe non trouvée" },
        { status: 404 }
      );
    }

    // Format the response with separate FR and EN translations
    const frTranslation = (team as any).translations.find(
      (t: any) => t.language === "FR"
    );
    const enTranslation = (team as any).translations.find(
      (t: any) => t.language === "EN"
    );
    const currentTranslation =
      (team as any).translations.find((t: any) => t.language === language) ||
      frTranslation;

    const formattedTeam = {
      id: team.id,
      slug: team.slug,
      image: team.image,
      // Current language translation (for display)
      name: currentTranslation?.name || "Équipe sans nom",
      description: currentTranslation?.description,
      valueAdded: currentTranslation?.valueAdded,
      keywords: currentTranslation?.keywords || [],
      domains: currentTranslation?.domains || [],
      expertises: currentTranslation?.expertises || [],
      // Separate fields for each language (for editing)
      name_fr: frTranslation?.name,
      name_en: enTranslation?.name,
      description_fr: frTranslation?.description,
      description_en: enTranslation?.description,
      valueAdded_fr: frTranslation?.valueAdded,
      valueAdded_en: enTranslation?.valueAdded,
      keywords_fr: frTranslation?.keywords || [],
      keywords_en: enTranslation?.keywords || [],
      domains_fr: frTranslation?.domains || [],
      domains_en: enTranslation?.domains || [],
      expertises_fr: frTranslation?.expertises || [],
      expertises_en: enTranslation?.expertises || [],
      language: language,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
      membersCount: (team as any)._count.members,
      publicationsCount: (team as any)._count.publications,
    };

    return NextResponse.json(formattedTeam);
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'équipe" },
      { status: 500 }
    );
  }
}

// PUT /api/teams/[id] - Update team
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: teamId } = await params;
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { slug, image, translations } = body;

    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!existingTeam) {
      return NextResponse.json(
        { error: "Équipe non trouvée" },
        { status: 404 }
      );
    }

    // Validate translations
    if (!translations || !translations.FR || !translations.EN) {
      return NextResponse.json(
        { error: "Les traductions FR et EN sont requises" },
        { status: 400 }
      );
    }

    if (!translations.FR.name || !translations.EN.name) {
      return NextResponse.json(
        { error: "Le nom est obligatoire en français et en anglais" },
        { status: 400 }
      );
    }

    // Update team with both translations
    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        slug: slug || existingTeam.slug,
        image: image !== undefined ? image : existingTeam.image,
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

    // Update FR translation
    await prisma.teamTranslation.upsert({
      where: {
        teamId_language: {
          teamId: teamId,
          language: "FR" as Language,
        },
      },
      update: {
        name: translations.FR.name,
        description: translations.FR.description || "",
        valueAdded: translations.FR.valueAdded,
        keywords: translations.FR.keywords || [],
        domains: translations.FR.domains || [],
        expertises: translations.FR.expertises || [],
      },
      create: {
        teamId: teamId,
        language: "FR" as Language,
        name: translations.FR.name,
        description: translations.FR.description || "",
        valueAdded: translations.FR.valueAdded,
        keywords: translations.FR.keywords || [],
        domains: translations.FR.domains || [],
        expertises: translations.FR.expertises || [],
      },
    });

    // Update EN translation
    await prisma.teamTranslation.upsert({
      where: {
        teamId_language: {
          teamId: teamId,
          language: "EN" as Language,
        },
      },
      update: {
        name: translations.EN.name,
        description: translations.EN.description || "",
        valueAdded: translations.EN.valueAdded,
        keywords: translations.EN.keywords || [],
        domains: translations.EN.domains || [],
        expertises: translations.EN.expertises || [],
      },
      create: {
        teamId: teamId,
        language: "EN" as Language,
        name: translations.EN.name,
        description: translations.EN.description || "",
        valueAdded: translations.EN.valueAdded,
        keywords: translations.EN.keywords || [],
        domains: translations.EN.domains || [],
        expertises: translations.EN.expertises || [],
      },
    });

    // Fetch updated team with all translations
    const finalTeam = await prisma.team.findUnique({
      where: { id: teamId },
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

    // Format the response with both translations
    const frTranslation = (finalTeam as any).translations.find(
      (t: any) => t.language === "FR"
    );
    const enTranslation = (finalTeam as any).translations.find(
      (t: any) => t.language === "EN"
    );

    const formattedTeam = {
      id: finalTeam!.id,
      slug: finalTeam!.slug,
      image: finalTeam!.image,
      name: frTranslation?.name || "Équipe sans nom",
      description: frTranslation?.description,
      valueAdded: frTranslation?.valueAdded,
      keywords: frTranslation?.keywords || [],
      domains: frTranslation?.domains || [],
      expertises: frTranslation?.expertises || [],
      name_fr: frTranslation?.name,
      name_en: enTranslation?.name,
      description_fr: frTranslation?.description,
      description_en: enTranslation?.description,
      valueAdded_fr: frTranslation?.valueAdded,
      valueAdded_en: enTranslation?.valueAdded,
      keywords_fr: frTranslation?.keywords || [],
      keywords_en: enTranslation?.keywords || [],
      domains_fr: frTranslation?.domains || [],
      domains_en: enTranslation?.domains || [],
      expertises_fr: frTranslation?.expertises || [],
      expertises_en: enTranslation?.expertises || [],
      createdAt: finalTeam!.createdAt.toISOString(),
      updatedAt: finalTeam!.updatedAt.toISOString(),
      membersCount: (finalTeam as any)._count.members,
      publicationsCount: (finalTeam as any)._count.publications,
    };

    return NextResponse.json(formattedTeam);
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'équipe" },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[id] - Delete team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: teamId } = await params;
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        _count: {
          select: {
            members: true,
            publications: true,
          },
        },
      },
    });

    if (!existingTeam) {
      return NextResponse.json(
        { error: "Équipe non trouvée" },
        { status: 404 }
      );
    }

    // Check if team has members or publications
    if ((existingTeam as any)._count.members > 0) {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer une équipe qui a des membres. Veuillez d'abord retirer tous les membres de l'équipe.",
        },
        { status: 400 }
      );
    }

    if ((existingTeam as any)._count.publications > 0) {
      return NextResponse.json(
        {
          error:
            "Impossible de supprimer une équipe qui a des publications. Veuillez d'abord retirer toutes les publications de l'équipe.",
        },
        { status: 400 }
      );
    }

    // Delete team (translations will be deleted automatically due to cascade)
    await prisma.team.delete({
      where: { id: teamId },
    });

    return NextResponse.json({ message: "Équipe supprimée avec succès" });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'équipe" },
      { status: 500 }
    );
  }
}
