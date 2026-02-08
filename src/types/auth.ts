export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: "ADMIN" | "MEMBER";
}

export interface AuthSession {
  user: AuthUser;
}
