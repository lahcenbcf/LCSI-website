import { prisma } from "../src/lib/prisma";

async function promoteToAdmin() {
  try {
    console.log("👑 Promotion vers administrateur...");

    const adminEmail = "h_haddadou@esi.dz"; // membre avec @esi.dz mail qui sera promu admin

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: adminEmail },
      include: {
        memberProfile: true,
      },
    });

    if (!user) {
      console.log(
        "❌ Utilisateur introuvable. Assurez-vous qu'il s'est connecté d'abord!"
      );
      return;
    }

    if (!user.memberProfile) {
      console.log(
        "❌ Profil membre manquant. Assurez-vous qu'il a complété son profil d'abord!"
      );
      return;
    }

    // Promouvoir vers ADMIN
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });

    console.log("✅ Promotion réussie:");
    console.log("📧 Email:", user.email);
    console.log("👤 Nom:", user.name);
    console.log("🔑 Nouveau rôle: ADMIN");
    console.log("");
    console.log(
      "🎉 L'utilisateur peut maintenant accéder au dashboard complet!"
    );

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Erreur lors de la promotion:", error);
    process.exit(1);
  }
}

promoteToAdmin();
