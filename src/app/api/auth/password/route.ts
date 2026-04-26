import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { getSession } from "@/lib/session";

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const { newPassword, confirmPassword } = body;

    // Validate input
    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "Les deux mots de passe sont obligatoires" },
        { status: 400 },
      );
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Les mots de passe ne correspondent pas" },
        { status: 400 },
      );
    }
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 },
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Mot de passe mis à jour avec succès",
    });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
