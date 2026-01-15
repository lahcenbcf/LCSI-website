import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les publications d'une équipe spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;

    const publications = await prisma.publication.findMany({
      where: {
        team: {
          id: teamId,
        },
      },
      include: {
        translations: true, // Récupérer toutes les traductions (FR et EN)
        team: {
          include: {
            translations: true,
          },
        },
        authors: {
          include: {
            author: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        year: "desc",
      },
    });

    // Formatter avec le format bilingue
    const formattedPublications = publications.map((publication: any) => {
      const translationFR = publication.translations.find(
        (t: any) => t.language === "FR"
      );
      const translationEN = publication.translations.find(
        (t: any) => t.language === "EN"
      );
      const teamTranslationFR = publication.team?.translations.find(
        (t: any) => t.language === "FR"
      );
      const teamTranslationEN = publication.team?.translations.find(
        (t: any) => t.language === "EN"
      );

      return {
        id: publication.id,
        title_fr: translationFR?.title || "",
        title_en: translationEN?.title || "",
        abstract_fr: translationFR?.abstract || "",
        abstract_en: translationEN?.abstract || "",
        keywords_fr: translationFR?.keywords || [],
        keywords_en: translationEN?.keywords || [],
        journal: publication.journal,
        volume: publication.volume,
        issue: publication.issue,
        pages: publication.pages,
        doi: publication.doi,
        url: publication.url,
        year: publication.year,
        publishedAt: publication.publishedAt,
        createdAt: publication.createdAt,
        team: publication.team?.slug,
        teamName_fr: teamTranslationFR?.name || "",
        teamName_en: teamTranslationEN?.name || "",
        authors: publication.authors.map((authorRel: any) => ({
          id: authorRel.author.id,
          firstname: authorRel.author.firstname,
          lastname: authorRel.author.lastname,
          email: authorRel.author.email,
          order: authorRel.order,
        })),
      };
    });

    return NextResponse.json({
      publications: formattedPublications,
      total: formattedPublications.length,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des publications de l'équipe:",
      error
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
