import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// GET - Obtenir le rôle de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer l'utilisateur et son profil membre
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur a un profil membre
    const member = await prisma.member.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        isTeamLeader: true,
        team: {
          select: {
            id: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      member: member || null,
      hasProfile: !!member,
      isAdmin: user.role === "ADMIN",
      isTeamLeader: member?.isTeamLeader || false,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du rôle:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
