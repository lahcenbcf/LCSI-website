import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/contents/[id] - Public (récupérer un contenu spécifique)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        translations: true,
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ content }, { status: 200 });
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

// PUT /api/contents/[id] - Authenticated (modifier un contenu)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Récupérer le rôle de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, memberProfile: { select: { id: true } } },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le contenu existe
    const existingContent = await prisma.content.findUnique({
      where: { id },
      include: { createdBy: true },
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier les permissions: Admin peut tout modifier, Membre seulement ses contenus
    const isAdmin = user.role === "ADMIN";
    const isOwner = existingContent.createdById === user.memberProfile?.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à modifier ce contenu" },
        { status: 403 }
      );
    }

    const { slug, type, image, publishedAt, eventDate, translations } = body;

    // Mettre à jour le contenu
    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        ...(slug && { slug }),
        ...(type && { type }),
        ...(image !== undefined && { image }),
        ...(publishedAt !== undefined && {
          publishedAt: publishedAt ? new Date(publishedAt) : null,
        }),
        ...(eventDate !== undefined && {
          eventDate: eventDate ? new Date(eventDate) : null,
        }),
      },
      include: {
        translations: true,
      },
    });

    // Mettre à jour les traductions si fournies
    if (translations && Array.isArray(translations)) {
      for (const translation of translations) {
        await prisma.contentTranslation.upsert({
          where: {
            contentId_language: {
              contentId: id,
              language: translation.language,
            },
          },
          update: {
            title: translation.title,
            description: translation.description,
            categoryLabel: translation.categoryLabel,
            categoryColor: translation.categoryColor,
          },
          create: {
            contentId: id,
            language: translation.language,
            title: translation.title,
            description: translation.description,
            categoryLabel: translation.categoryLabel,
            categoryColor: translation.categoryColor,
          },
        });
      }
    }

    // Récupérer le contenu mis à jour avec les traductions
    const finalContent = await prisma.content.findUnique({
      where: { id },
      include: {
        translations: true,
      },
    });

    return NextResponse.json(
      { content: finalContent, message: "Contenu mis à jour avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating content:", error);
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    );
  }
}

// DELETE /api/contents/[id] - Authenticated (supprimer un contenu)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id } = await params;

    // Récupérer le rôle de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true, memberProfile: { select: { id: true } } },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le contenu existe
    const existingContent = await prisma.content.findUnique({
      where: { id },
      include: { createdBy: true },
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier les permissions: Admin peut tout supprimer, Membre seulement ses contenus
    const isAdmin = user.role === "ADMIN";
    const isOwner = existingContent.createdById === user.memberProfile?.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à supprimer ce contenu" },
        { status: 403 }
      );
    }

    // Supprimer le contenu (les traductions seront supprimées en cascade)
    await prisma.content.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Contenu supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting content:", error);
    return NextResponse.json(
      { error: "Failed to delete content" },
      { status: 500 }
    );
  }
}
