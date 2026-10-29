import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkDualRateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { authConfig } from "@/lib/auth.config";

const credentialsSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) return null;

      let email = parsed.data.email.trim().toLowerCase();
      if (email === "admin") {
        email = "admin@empresa.com";
      }

      const rl = await checkDualRateLimit({
        scope: "auth-login",
        identifier: email,
        ipLimit: 20,
        idLimit: 10,
        windowMs: 15 * 60 * 1000,
      });
      if (!rl.ok) return null;

      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            ...(email === "admin@empresa.com" ? [{ email: "admin@mudeco.com" }] : []),
          ],
        },
      });
      if (!user || !user.active) return null;

      const valid = await bcrypt.compare(
        parsed.data.password,
        user.passwordHash,
      );
      if (!valid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        const email = user.email.toLowerCase();
        try {
          let dbUser = await prisma.user.findUnique({ where: { email } });
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email,
                name: user.name || "Cliente Google",
                role: "CLIENTE",
                active: true,
                passwordHash: "",
              },
            });
          } else if (!dbUser.active) {
            return false;
          }
          user.id = dbUser.id;
          (user as { role?: string }).role = dbUser.role;
          return true;
        } catch (err) {
          console.error("Error en Google signIn callback:", err);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "CLIENTE";
        const { writeAudit } = await import("@/lib/audit");
        void writeAudit({
          action: "LOGIN",
          entity: "System",
          summary: `Inicio de sesión: ${user.email}`,
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
        });
      }
      return token;
    },
  },
});
