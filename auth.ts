import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { NextResponse } from "next/server"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/drive.readonly",
          ].join(" "),
          access_type: "offline",
          prompt: "consent",
          hd: "glean.com",
        },
      },
    }),
  ],
  callbacks: {
    signIn({ profile }) {
      return profile?.email?.endsWith("@glean.com") ?? false
    },
    jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.accessTokenExpires = account.expires_at
          ? account.expires_at * 1000
          : undefined
      }
      return token
    },
    session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined
      return session
    },
    authorized({ auth, request }) {
      if (!auth) {
        return NextResponse.redirect(new URL("/login", request.url))
      }
      return true
    },
  },
  pages: {
    signIn: "/login",
  },
})
