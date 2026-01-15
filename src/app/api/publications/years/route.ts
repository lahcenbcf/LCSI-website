import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer toutes les années distinctes des publications (public)
export async function GET() {
  try {
    // Récupérer toutes les années distinctes des publications
    const publications = await prisma.publication.findMany({
      select: {
        year: true,
      },
      distinct: ["year"],
      orderBy: {
        year: "desc",
      },
    });

    const years = publications
      .map((p) => p.year)
      .filter((year) => year !== null);

    return NextResponse.json({ years });
  } catch (error) {
    console.error("Erreur lors de la récupération des années:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des années" },
      { status: 500 }
    );
  }
}
