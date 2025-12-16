import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            // Whitelist kontrolü - sadece is_active ve veritabanında kayıtlı kullanıcılar
            if (!user.email) return false;

            const dbUser = await prisma.user.findUnique({
                where: { email: user.email },
            });

            // Kullanıcı whitelist'te değilse veya pasifse giriş engellensin
            if (!dbUser || !dbUser.isActive) {
                return false;
            }

            return true;
        },
        async session({ session }) {
            // Session'a kullanıcı role bilgisini ekle
            if (session.user?.email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: session.user.email },
                });

                if (dbUser) {
                    session.user.id = dbUser.id;
                    session.user.role = dbUser.role;
                    session.user.fullName = dbUser.fullName;
                }
            }

            return session;
        },
        async jwt({ token }) {
            if (token.email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: token.email },
                });

                if (dbUser) {
                    token.id = dbUser.id;
                    token.role = dbUser.role;
                    token.fullName = dbUser.fullName;
                }
            }

            return token;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
    },
};

