import "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "admin" | "driver" | "student" | "visitor";
      emailVerified?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: "admin" | "driver" | "student" | "visitor";
  }

  interface Profile {
    role?: "admin" | "driver" | "student" | "visitor";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "admin" | "driver" | "student" | "visitor";
  }
}
