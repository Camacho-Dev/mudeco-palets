import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkDualRateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { authConfig } from "@/lib/auth.config";

const credentialsSchema = z.object({
  email: z.string().min(1).max(160),
  password: z.string().min(1).max(128),
});

// Hash dummy de costo 10 para mantener tiempo constante cuando el correo no existe (mitiga ataques de timing)
const DUMMY_BCRYPT_HASH =
  "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

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
      if (email === "admin" || email === "administrador") {
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

      if (!user || !user.active || !user.passwordHash) {
        await bcrypt.compare(parsed.data.password, DUMMY_BCRYPT_HASH);
        return null;
      }

      const valid = await bcrypt.compare(
        parsed.data.password,
        user.passwordHash,
      );
      if (!valid) {
        const { writeAudit } = await import("@/lib/audit");
        void writeAudit({
          action: "LOGIN_FAILED",
          entity: "System",
          summary: `Intento fallido de inicio de sesión: ${user.email}`,
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
        }).catch(() => undefined);
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    },
  }),
];

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim().replace(/^\uFEFF/, "");
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim().replace(/^\uFEFF/, "");

if (googleClientId && googleClientSecret) {
  providers.push(
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
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
        const userName = user.name || "Cliente Google";
        try {
          let isNewUser = false;
          let dbUser = await prisma.user.findUnique({ where: { email } });
          if (!dbUser) {
            isNewUser = true;
            dbUser = await prisma.user.create({
              data: {
                email,
                name: userName,
                role: "CLIENTE",
                active: true,
                department: "CLIENTE",
                passwordHash: "",
              },
            });
          } else if (!dbUser.active) {
            return false;
          } else if (user.name && dbUser.name !== user.name) {
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: { name: user.name },
            });
          }
          user.id = dbUser.id;
          (user as { role?: string }).role = dbUser.role;

          // 1. Sincronizar / crear en la tabla de Clientes (Customer) del ERP
          const existingCustomer = await prisma.customer.findFirst({
            where: { email },
          });

          if (!existingCustomer) {
            await prisma.customer.create({
              data: {
                name: userName,
                email,
                address: "Registrado vía Google Auth",
              },
            });
          } else if (user.name && existingCustomer.name !== user.name) {
            await prisma.customer.update({
              where: { id: existingCustomer.id },
              data: { name: user.name },
            });
          }

          // 2. Registrar en Auditoría que la persona se autenticó por Google
          const { writeAudit } = await import("@/lib/audit");
          if (isNewUser) {
            await writeAudit({
              action: "CREATE",
              entity: "Customer",
              entityId: dbUser.id,
              summary: `Nuevo cliente registrado mediante Google Auth: ${userName} (${email})`,
              userId: dbUser.id,
              userEmail: email,
              userName: userName,
              details: { provider: "google", email, name: userName },
            }).catch(() => undefined);
          }

          await writeAudit({
            action: "LOGIN",
            entity: "GoogleAuth",
            entityId: dbUser.id,
            summary: `Inicio de sesión exitoso con Google: ${userName} (${email})`,
            userId: dbUser.id,
            userEmail: email,
            userName: userName,
            details: { provider: "google", email, name: userName },
          }).catch(() => undefined);

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
        }).catch(() => undefined);
      }
      return token;
    },
  },
});
