import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Compter le nombre total de membres
    const totalMembers = await prisma.member.count();

    // Compter le nombre total de publications
    const totalPublications = await prisma.publication.count();

    // Vues totales - pour l'instant à 0, sera mis à jour avec Google Analytics
    const totalViews = 0;

    return NextResponse.json({
      totalMembers,
      totalPublications,
      totalViews,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
