import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET - Vérifier si l'utilisateur connecté a un profil membre
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // D'abord récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        memberProfile: {
          select: {
            id: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    // Si l'utilisateur n'existe pas, le créer (fallback de sécurité)
    if (!user) {
      return NextResponse.json({
        hasProfile: false,
        member: null,
      });
    }

    return NextResponse.json({
      hasProfile: !!user.memberProfile,
      member: user.memberProfile || null,
      userRole: user.role,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification du profil:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
