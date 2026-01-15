import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import type { Adapter } from "next-auth/adapters"; // added

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as unknown as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      // Restriction aux emails @esi.dz pour Google
      if (account?.provider === "google") {
        const email = user.email || profile?.email;
        if (!email?.endsWith("@esi.dz")) {
          return false; // Refuser la connexion
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        // Définir le rôle basé sur l'email
        const email = user.email || "";
        if (email.endsWith("@esi.dz")) {
          token.role = "MEMBER";
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as "ADMIN" | "MEMBER";
      }
      return session;
    },

    // Redirection après connexion réussie
    async redirect({ url, baseUrl }) {
      // Si l'URL commence par le baseUrl, l'utiliser
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Sinon, vérifier si c'est une URL relative
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Par défaut, rediriger vers le dashboard
      return `${baseUrl}/fr/dash`;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  events: {
    async signIn(message) {
      // Vous pouvez ajouter des logs ou autres actions ici si nécessaire
    },
  },
});
