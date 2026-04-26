import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, validateEsiEmail } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { Gender, MemberPosition, UserRole } from "@/generated/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          error:
            "Inscription publique désactivée. Seuls les administrateurs peuvent créer des comptes.",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { email, password, name, role, gender, position } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 },
      );
    }

    // Validate ESI email
    if (!validateEsiEmail(email)) {
      return NextResponse.json(
        { error: "Seuls les emails @esi.dz sont autorisés" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email" },
        { status: 409 },
      );
    }

    const selectedRole =
      role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.MEMBER;
    const selectedGender =
      gender === Gender.FEMALE ? Gender.FEMALE : Gender.MALE;
    const selectedPosition = Object.values(MemberPosition).includes(position)
      ? (position as MemberPosition)
      : MemberPosition.ASSOCIATE_PROFESSOR;

    // Hash password
    const hashedPassword = await hashPassword(password);

    const normalizedName = (name || "").trim();
    const nameParts = normalizedName.split(/\s+/).filter(Boolean);
    const firstname = nameParts[0] || normalizedName || "Nouveau";
    const lastname = nameParts.slice(1).join(" ") || "Membre";

    // Create user and matching member profile in one transaction
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name: normalizedName || null,
          role: selectedRole,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      await tx.member.create({
        data: {
          email: createdUser.email,
          firstname,
          lastname,
          gender: selectedGender,
          position: selectedPosition,
          userId: createdUser.id,
        },
      });

      return createdUser;
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
