import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer les membres d'une équipe spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;

    const members = await prisma.member.findMany({
      where: {
        teamId: teamId,
      },
      include: {
        user: true,
      },
      orderBy: [{ isTeamLeader: "desc" }, { lastname: "asc" }],
    });

    const formattedMembers = members.map((member: any) => ({
      id: member.id,
      firstname: member.firstname,
      lastname: member.lastname,
      email: member.email,
      phone: member.phone,
      image: member.user?.image || member.image,
      gender: member.gender,
      position: member.position,
      isTeamLeader: member.isTeamLeader,
    }));

    return NextResponse.json({
      members: formattedMembers,
      total: formattedMembers.length,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des membres de l'équipe:",
      error
    );
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
