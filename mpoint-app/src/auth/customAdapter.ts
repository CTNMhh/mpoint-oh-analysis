import { PrismaAdapter } from "@auth/prisma-adapter";
import { Adapter } from "next-auth/adapters";

export function CustomPrismaAdapter(prisma: any): Adapter {
  const baseAdapter = PrismaAdapter(prisma);

  return {
    ...baseAdapter,
    getUser: async (id) => {
      const user = await baseAdapter.getUser(id);
      if (user) {
        // Ensure compatibility with next-auth's AdapterUser type
        return {
          ...user,
          firstName: user.firstName || null,
          lastName: user.lastName || null,
        };
      }
      return null;
    },
  };
}