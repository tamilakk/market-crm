import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Логин", type: "text" },
        password: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        const { username, password } = credentials as { username: string; password: string };
        if (
          username === process.env.AUTH_USERNAME &&
          password === process.env.AUTH_PASSWORD
        ) {
          return { id: "1", name: "Администратор" };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
