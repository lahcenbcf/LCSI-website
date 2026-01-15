import { DefaultSession } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "MEMBER";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "ADMIN" | "MEMBER";
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: "ADMIN" | "MEMBER";
  }
}
