import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ContentType } from "@/generated/prisma";

// GET /api/contents - Public (liste tous les contenus)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as ContentType | null;
    const locale = searchParams.get("locale") || "fr";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Calculer le skip pour la pagination
    const skip = (page - 1) * limit;

    const contents = await prisma.content.findMany({
      where: type ? { type } : undefined,
      include: {
        translations: {
          where: {
            language: locale.toUpperCase() as "FR" | "EN",
          },
        },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    });

    // Formatter les données pour le frontend
    const formattedContents = contents.map((content: any) => ({
      id: content.id,
      slug: content.slug,
      type: content.type,
      image: content.image,
      publishedAt: content.publishedAt,
      eventDate: content.eventDate,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
      title: content.translations[0]?.title || "",
      description: content.translations[0]?.description || "",
      categoryLabel: content.translations[0]?.categoryLabel,
      categoryColor: content.translations[0]?.categoryColor,
    }));

    return NextResponse.json({ contents: formattedContents }, { status: 200 });
  } catch (error) {
    console.error("Error fetching contents:", error);
    return NextResponse.json(
      { error: "Failed to fetch contents" },
      { status: 500 }
    );
  }
}

// POST /api/contents - Authenticated (créer un contenu)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer le profil membre de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { memberProfile: true },
    });

    if (!user?.memberProfile) {
      return NextResponse.json(
        {
          error: "Profil membre non trouvé. Veuillez compléter votre profil.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { slug, type, image, publishedAt, eventDate, translations } = body;

    // Validation des champs requis
    if (!slug || !type || !translations) {
      return NextResponse.json(
        { error: "Champs requis manquants: slug, type, translations" },
        { status: 400 }
      );
    }

    // Vérifier que le slug est unique
    const existingContent = await prisma.content.findUnique({
      where: { slug },
    });

    if (existingContent) {
      return NextResponse.json(
        { error: "Un contenu avec ce slug existe déjà" },
        { status: 400 }
      );
    }

    // Créer le contenu avec ses traductions et assigner le créateur
    const newContent = await prisma.content.create({
      data: {
        slug,
        type,
        image,
        publishedAt: publishedAt ? new Date(publishedAt) : null,
        eventDate: eventDate ? new Date(eventDate) : null,
        createdById: user.memberProfile.id, // Auto-assigner le créateur
        translations: {
          create: translations.map((t: any) => ({
            language: t.language,
            title: t.title,
            description: t.description,
            categoryLabel: t.categoryLabel,
            categoryColor: t.categoryColor,
          })),
        },
      },
      include: {
        translations: true,
        createdBy: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      { content: newContent, message: "Contenu créé avec succès" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating content:", error);

    // Log détaillé de l'erreur
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        error: "Failed to create content",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
