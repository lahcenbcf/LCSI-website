import { handlers, auth } from "@/lib/auth";

export const GET = handlers?.GET ?? auth;
export const POST = handlers?.POST ?? auth;
