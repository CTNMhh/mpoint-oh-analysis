import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    email: string;
    anrede: string;
    titel?: string | null;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      anrede: string;
      titel?: string | null;
      firstName: string;
      lastName: string;
      createdAt: Date;
      updatedAt: Date;
    };
  }
}