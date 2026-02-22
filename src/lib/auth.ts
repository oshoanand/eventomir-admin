import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/utils/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        try {
          // 1. Validate input
          if (!credentials?.email || !credentials?.password) {
            throw new Error(
              "Требуется указать адрес электронной почты и пароль.",
            );
          }

          // 2. Find user in database by EMAIL ONLY
          // We removed the 'role' constraint here to allow us to give a specific error message later
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          // 3. Verify user exists and has a password
          if (!user || !user.password) {
            throw new Error("Неверный адрес электронной почты или пароль!");
          }

          // 4. Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isValidPassword) {
            throw new Error("Неверный адрес электронной почты или пароль!");
          }

          // 5. ROLE CHECK (The new requirement)
          // Check if the user has one of the allowed roles
          const allowedRoles = ["administrator", "support"]; // Adjust "administrator" based on your exact DB string
          console.log(allowedRoles);
          if (!user.role || !allowedRoles.includes(user.role)) {
            // This specific error message will be sent to the client
            throw new Error(
              "Доступ запрещен! Требуются права Администратора или Поддержки.",
            );
          }

          // 6. Generate Custom Token (If you need this for external API calls)
          const secret = process.env.NEXTAUTH_SECRET!;
          const token = jwt.sign(
            {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              iat: Date.now() / 1000,
              exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
            },
            secret,
            {
              algorithm: "HS256",
            },
          );

          // 7. Return user object
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            accessToken: token,
          };
        } catch (error: any) {
          // 1. Log the actual technical error to the server console for the developer
          console.error("Authorize Error:", error);

          // 2. Determine if it's an error we manually threw above (User-friendly)
          // or a system error (Prisma/DB crash)
          const isCustomError =
            error.message ===
              "Требуется указать адрес электронной почты и пароль" ||
            error.message === "Неверный адрес электронной почты или пароль!";

          if (isCustomError) {
            throw new Error(error.message);
          }

          // 3. If it's a database/prisma error, mask it with a generic message
          throw new Error("Проверьте свой адрес электронной почты еще раз!");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.image = user.image ? user.image.toString() : null;
        token.name = user.name ? user.name.toString() : "";
        token.email = user.email ? user.email.toString() : "";
        token.accessToken = user.accessToken;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.image = token.image as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
