import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { MemberPosition } from "@/generated/prisma";

// GET - Récupérer le profil de l'utilisateur connecté
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Rechercher le membre avec toutes ses informations
    const member = await prisma.member.findFirst({
      where: { email: session.user.email },
      include: {
        translations: true,
        user: true,
        team: {
          include: {
            translations: true,
          },
        },
      },
    });

    if (!member) {
      // Si aucun membre trouvé, retourner les infos basiques de la session
      return NextResponse.json({
        exists: false,
        email: session.user.email,
        image: session.user.image,
        name: session.user.name,
      });
    }

    // Convertir la position enum vers le texte lisible
    const positionMap: Record<string, string> = {
      PROFESSOR: "Professeur",
      ASSOCIATE_PROFESSOR: "Maître de conférences",
      ASSISTANT_PROFESSOR: "Professeur assistant",
      LECTURER: "Chercheur",
      RESEARCHER: "Chercheur",
      PHD_STUDENT: "Doctorant",
      MASTER_STUDENT: "Doctorant",
      ENGINEER: "Ingénieur de recherche",
    };

    // Récupérer les traductions
    const frTranslation = member.translations.find(
      (t: any) => t.language === "FR"
    );
    const enTranslation = member.translations.find(
      (t: any) => t.language === "EN"
    );

    // Récupérer les traductions de l'équipe
    const teamFrTranslation = member.team?.translations.find(
      (t: any) => t.language === "FR"
    );
    const teamEnTranslation = member.team?.translations.find(
      (t: any) => t.language === "EN"
    );

    return NextResponse.json({
      exists: true,
      id: member.id,
      firstname: member.firstname,
      lastname: member.lastname,
      email: member.email,
      phone: member.phone,
      image: member.user?.image || member.image,
      gender: member.gender,
      position: positionMap[member.position] || member.position,
      teamSlug: member.team?.slug,
      teamName_fr: teamFrTranslation?.name,
      teamName_en: teamEnTranslation?.name,
      isTeamLeader: member.isTeamLeader,
      bio_fr: frTranslation?.bio,
      bio_en: enTranslation?.bio,
      institution_fr: frTranslation?.institution,
      institution_en: enTranslation?.institution,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du profil:", error);
    return NextResponse.json(
      {
        error: "Erreur serveur lors de la récupération du profil",
        details: (error as Error)?.message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    console.log("📝 Données reçues pour mise à jour profil:", body);
    const {
      firstname,
      lastname,
      position,
      teamSlug,
      gender,
      phone,
      bio_fr,
      bio_en,
      institution_fr,
      institution_en,
      isTeamLeader,
    } = body;

    // Validation basique
    if (
      !firstname?.trim() ||
      !lastname?.trim() ||
      !position?.trim() ||
      !teamSlug?.trim() ||
      !gender
    ) {
      return NextResponse.json(
        { error: "Les champs obligatoires sont requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'équipe existe
    const team = await prisma.team.findFirst({
      where: { slug: teamSlug },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Équipe non trouvée" },
        { status: 400 }
      );
    }

    // Rechercher le membre existant avec ses traductions
    const existingMember = await prisma.member.findFirst({
      where: { email: session.user.email },
      include: {
        translations: true,
        team: true,
      },
    });

    if (!existingMember) {
      return NextResponse.json(
        { error: "Profil membre non trouvé" },
        { status: 404 }
      );
    }

    // Pour l'instant, on permet simplement la mise à jour du statut de chef
    // TODO: Ajouter une validation plus sophistiquée si nécessaire
    const finalIsTeamLeader = Boolean(isTeamLeader);

    // Mapping des positions français vers l'enum Prisma
    const positionMapping: Record<string, MemberPosition> = {
      Professeur: MemberPosition.PROFESSOR,
      "Maître de conférences": MemberPosition.ASSOCIATE_PROFESSOR,
      "Professeur assistant": MemberPosition.ASSISTANT_PROFESSOR,
      Chercheur: MemberPosition.RESEARCHER,
      Doctorant: MemberPosition.PHD_STUDENT,
      "Ingénieur de recherche": MemberPosition.ENGINEER,
    };

    const positionEnum = positionMapping[position];
    console.log(
      `🔍 Position reçue: "${position}", Position enum: "${positionEnum}"`
    );

    if (!positionEnum) {
      return NextResponse.json(
        {
          error: `Position "${position}" non reconnue. Positions valides: ${Object.keys(
            positionMapping
          ).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Mettre à jour le membre
    const updatedMember = await prisma.member.update({
      where: { id: existingMember.id },
      data: {
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        position: positionEnum,
        teamId: team.id,
        gender: gender as "MALE" | "FEMALE",
        phone: phone?.trim() || null,
        isTeamLeader: finalIsTeamLeader,
      },
      include: {
        team: {
          select: {
            slug: true,
            translations: {
              select: {
                name: true,
                language: true,
              },
            },
          },
        },
        translations: true,
      },
    });

    // Mettre à jour les traductions séparément pour FR et EN
    await prisma.memberTranslation.upsert({
      where: {
        memberId_language: {
          memberId: existingMember.id,
          language: "FR",
        },
      },
      update: {
        bio: bio_fr?.trim() || null,
        institution: institution_fr?.trim() || null,
      },
      create: {
        memberId: existingMember.id,
        language: "FR",
        bio: bio_fr?.trim() || null,
        institution: institution_fr?.trim() || null,
      },
    });

    await prisma.memberTranslation.upsert({
      where: {
        memberId_language: {
          memberId: existingMember.id,
          language: "EN",
        },
      },
      update: {
        bio: bio_en?.trim() || null,
        institution: institution_en?.trim() || null,
      },
      create: {
        memberId: existingMember.id,
        language: "EN",
        bio: bio_en?.trim() || null,
        institution: institution_en?.trim() || null,
      },
    });

    return NextResponse.json({
      message: "Profil mis à jour avec succès",
      member: updatedMember,
    });
  } catch (error) {
    console.error("❌ Erreur détaillée lors de la mise à jour du profil:");
    console.error("Type:", typeof error);
    console.error("Message:", (error as Error)?.message);
    console.error("Stack:", (error as Error)?.stack);
    console.error("Erreur complète:", error);

    return NextResponse.json(
      {
        error: "Erreur serveur lors de la mise à jour du profil",
        details: (error as Error)?.message,
      },
      { status: 500 }
    );
  }
}
