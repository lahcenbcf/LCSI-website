import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Language } from "@/generated/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug: teamSlug } = await params;
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language") || "FR";

    const team = await prisma.team.findUnique({
      where: { slug: teamSlug },
      include: {
        translations: {
          where: { language: language as Language },
        },
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

    // Format the response
    const formattedTeam = {
      id: team.id,
      slug: team.slug,
      image: team.image,
      name: (team as any).translations[0]?.name || "Équipe sans nom",
      description: (team as any).translations[0]?.description,
      valueAdded: (team as any).translations[0]?.valueAdded,
      keywords: (team as any).translations[0]?.keywords || [],
      domains: (team as any).translations[0]?.domains || [],
      technologies: (team as any).translations[0]?.technologies || [],
      expertises: (team as any).translations[0]?.expertises || [],
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
