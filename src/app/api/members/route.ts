import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Language, MemberPosition } from "@/generated/prisma";

// Mapping des positions français vers l'enum Prisma
const positionMapping: Record<string, MemberPosition> = {
  Professeur: MemberPosition.PROFESSOR,
  "Maître de conférences": MemberPosition.ASSOCIATE_PROFESSOR,
  "Professeur assistant": MemberPosition.ASSISTANT_PROFESSOR,
  Chercheur: MemberPosition.RESEARCHER,
  Doctorant: MemberPosition.PHD_STUDENT,
  "Ingénieur de recherche": MemberPosition.ENGINEER,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const teams = searchParams.get("teams");
    const teamSlug = searchParams.get("team"); // Filtre par équipe (alias pour teams)
    const language = searchParams.get("language") || "FR";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const where: any = {};

    if (search) {
      where.OR = [
        {
          translations: {
            some: {
              language,
              name: { contains: search, mode: "insensitive" },
            },
          },
        },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (teams) {
      const teamList = teams.split(",");
      where.team = {
        slug: { in: teamList },
      };
    } else if (teamSlug) {
      where.team = {
        slug: teamSlug,
      };
    }

    const [membersResult, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip: offset,
        take: limit,
        include: {
          translations: true, 
          user: true, // Include user to get Google profile image
          team: {
            include: {
              translations: true,
            },
          },
        },
        orderBy: [{ isTeamLeader: "desc" }, { email: "asc" }],
      }),
      prisma.member.count({ where }),
    ]);

    const formattedMembers = membersResult.map((member: any) => {
      const frTranslation = member.translations.find(
        (t: any) => t.language === "FR"
      );
      const enTranslation = member.translations.find(
        (t: any) => t.language === "EN"
      );
      const currentTranslation =
        member.translations.find((t: any) => t.language === language) ||
        frTranslation;

      // Récupérer les traductions de l'équipe
      const teamTranslations = member.team?.translations || [];
      const teamFr = teamTranslations.find((t: any) => t.language === "FR");
      const teamEn = teamTranslations.find((t: any) => t.language === "EN");

      return {
        id: member.id,
        firstname: member.firstname,
        lastname: member.lastname,
        email: member.email,
        phone: member.phone,
        image: member.user?.image || member.image, // Prioritize Google image from User table
        gender: member.gender,
        position: member.position,
        isTeamLeader: member.isTeamLeader,
        createdAt: member.createdAt,
        name: `${member.firstname} ${member.lastname}`.trim() || "Non défini",
        // Current language (for display)
        bio: currentTranslation?.bio,
        institution: currentTranslation?.institution,
        // Separate fields for each language (for editing)
        bio_fr: frTranslation?.bio,
        bio_en: enTranslation?.bio,
        institution_fr: frTranslation?.institution,
        institution_en: enTranslation?.institution,
        department: teamFr?.name || "Aucune équipe",
        team: member.team?.slug,
        teamName: teamFr?.name || "Aucune équipe",
        teams: member.team
          ? [
              {
                slug: member.team.slug,
                name_fr: teamFr?.name || "",
                name_en: teamEn?.name || "",
              },
            ]
          : [],
      };
    });

    return NextResponse.json({
      members: formattedMembers,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des membres:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer un nouveau membre
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Données reçues pour créer un membre:", body);

    const {
      firstname,
      lastname,
      email,
      position,
      teamSlug,
      gender,
      phone,
      isTeamLeader,
      image,
      translations, // Format avec bio et institution en FR/EN
    } = body;

    // Validation des données
    if (!email || !position || !gender || !firstname || !lastname) {
      return NextResponse.json(
        {
          error:
            "Champs obligatoires manquants (firstname, lastname, email, position, gender)",
        },
        { status: 400 }
      );
    }

    // Valider les traductions
    if (!translations || !translations.FR || !translations.EN) {
      return NextResponse.json(
        { error: "Les traductions FR et EN sont requises" },
        { status: 400 }
      );
    }

    if (!translations.FR.bio || !translations.FR.institution) {
      return NextResponse.json(
        { error: "Traduction française manquante (bio, institution)" },
        { status: 400 }
      );
    }

    if (!translations.EN.bio || !translations.EN.institution) {
      return NextResponse.json(
        { error: "Traduction anglaise manquante (bio, institution)" },
        { status: 400 }
      );
    }

    // Convertir la position française vers l'enum Prisma
    const prismaPosition = positionMapping[position];
    if (!prismaPosition) {
      return NextResponse.json(
        { error: `Position "${position}" non reconnue` },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingMember = await prisma.member.findUnique({
      where: { email },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Un membre avec cet email existe déjà" },
        { status: 409 }
      );
    }

    // Trouver l'équipe si spécifiée
    let team = null;
    if (teamSlug) {
      console.log("Recherche de l'équipe avec slug:", teamSlug);
      team = await prisma.team.findUnique({
        where: { slug: teamSlug },
      });
      console.log("Équipe trouvée:", team);
      if (!team) {
        return NextResponse.json(
          { error: `Équipe avec le slug "${teamSlug}" introuvable` },
          { status: 404 }
        );
      }
    }

    // Récupérer l'utilisateur pour créer le lien
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Créer le nouveau membre avec ses traductions
    const translationsData = [
      {
        language: "FR" as Language,
        bio: translations.FR.bio,
        institution: translations.FR.institution,
      },
      {
        language: "EN" as Language,
        bio: translations.EN.bio,
        institution: translations.EN.institution,
      },
    ];

    const newMember = await prisma.member.create({
      data: {
        firstname,
        lastname,
        email,
        phone,
        gender,
        position: prismaPosition,
        image,
        isTeamLeader: isTeamLeader || false,
        teamId: team?.id,
        userId: user?.id, // Lier le membre à l'utilisateur
        translations: {
          create: translationsData,
        },
      },
      include: {
        translations: true,
        team: {
          include: {
            translations: {
              where: { language: "FR" },
            },
          },
        },
      },
    });

    // Mettre à jour le rôle de l'utilisateur vers MEMBER
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "MEMBER" },
      });
    }

    // Formatter la réponse
    const formattedMember = {
      id: newMember.id,
      firstname: newMember.firstname,
      lastname: newMember.lastname,
      email: newMember.email,
      phone: newMember.phone,
      image: newMember.image,
      gender: newMember.gender,
      position: newMember.position,
      isTeamLeader: newMember.isTeamLeader,
      createdAt: newMember.createdAt,
      bio: newMember.translations[0]?.bio,
      institution: newMember.translations[0]?.institution,
      team: newMember.team?.slug,
      teamName: newMember.team?.translations[0]?.name,
    };

    return NextResponse.json(formattedMember, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du membre:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
