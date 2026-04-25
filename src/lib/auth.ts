import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
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

          // 2. Call the Node.js Backend API
          const backendUrl =
            process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8800";

          const res = await fetch(`${backendUrl}/api/auth/admin/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          // 3. Handle Backend Errors
          if (!res.ok) {
            throw new Error(
              data.message || "Неверный адрес электронной почты или пароль!",
            );
          }

          const { token, user } = data;

          if (!token) {
            throw new Error(
              "Ошибка сервера: недействительный ответ авторизации.",
            );
          }

          // 4. Decode token to extract ID and Role securely
          const decodedToken = decodeJwt(token);

          if (!decodedToken || decodedToken.id === undefined) {
            throw new Error("Ошибка сервера: недействительный токен.");
          }

          const userRole =
            decodedToken.role !== undefined ? decodedToken.role : "";

          // 5. Role Authorization
          const allowedRoles = ["administrator", "support"];

          if (!userRole || !allowedRoles.includes(userRole)) {
            throw new Error(
              "Доступ запрещен! Требуются права Администратора или Поддержки.",
            );
          }

          // 6. 🚨 FIX: Include id and role mapped from the decoded token
          return {
            id: decodedToken.id,
            role: userRole,
            name: user?.name || "",
            email: user?.email || credentials.email,
            image: user?.image || null,
            accessToken: token,
          } as any;
        } catch (error: any) {
          console.error("NextAuth Authorize Error:", error.message);
          throw new Error(error.message);
        }
      },
    }),
  ],

  callbacks: {
    // 6. Store Backend Token in NextAuth JWT
    async jwt({ token, user }) {
      // User object is only available on initial sign-in
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = (user as any).role;
        token.image = user.image;
        token.accessToken = (user as any).accessToken;
      }
      return token;
    },

    // 7. Expose Backend Token to the Client Session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.image = token.image as string | null;
        (session.user as any).accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
