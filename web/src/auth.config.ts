import { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import { compare } from "bcryptjs"
import { findUserByEmail } from "./app/api/auth/user-store"

// Define our user type for Auth.js
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      nativeLanguage: string
      targetLanguages: string[]
    }
  }
  
  interface User {
    id: string
    email: string
    name: string
    nativeLanguage: string
    targetLanguages: string[]
  }
}

export const authConfig: NextAuthConfig = {
  providers: [
    // Credentials provider for email/password login
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = findUserByEmail(credentials.email as string)
        if (!user) {
          return null
        }

        const isPasswordValid = await compare(
          credentials.password as string,
          user.hashedPassword || ''
        )

        if (!isPasswordValid) {
          return null
        }

        // Return user object that matches our User interface
        return {
          id: user.id,
          email: user.email,
          name: user.name || '',
          nativeLanguage: user.nativeLanguage,
          targetLanguages: user.targetLanguages,
        }
      },
    }),    // Google OAuth provider
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // GitHub OAuth provider
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),

    // Apple OAuth provider (will be configured later)
    // Apple({
    //   clientId: process.env.APPLE_ID!,
    //   clientSecret: process.env.APPLE_PRIVATE_KEY!,
    // }),

    // Facebook OAuth provider (will be configured later)
    // Facebook({
    //   clientId: process.env.FACEBOOK_CLIENT_ID!,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    // }),
  ],

  // Configure JWT strategy
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },

  // Configure JWT
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    // JWT callback - runs whenever a JWT is created, updated, or accessed
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.nativeLanguage = user.nativeLanguage
        token.targetLanguages = user.targetLanguages
      }      // Handle OAuth sign-in
      if (account?.provider === "google") {
        // For OAuth users, we might need to create/find user in our store
        // This is where we'd integrate with our user store
        const existingUser = findUserByEmail(token.email!)
        if (existingUser) {
          token.id = existingUser.id
          token.nativeLanguage = existingUser.nativeLanguage
          token.targetLanguages = existingUser.targetLanguages
        } else {
          // For now, we'll set defaults for OAuth users
          // In a real app, you'd redirect them to complete their profile
          token.id = token.sub // Use OAuth provider's user ID
          token.nativeLanguage = "en"
          token.targetLanguages = []
        }
      }

      return token
    },

    // Session callback - runs whenever a session is checked
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.nativeLanguage = token.nativeLanguage as string
        session.user.targetLanguages = token.targetLanguages as string[]
      }
      return session
    },

    // Sign-in callback - controls whether user is allowed to sign in
    async signIn() {
      // Allow all sign-ins for now
      // You can add custom logic here to control access
      return true
    },

    // Redirect callback - controls where user is redirected after sign-in
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },

  // Customize pages (optional)
  pages: {
    signIn: "/auth/login",
    // signUp: "/auth/register", // Auth.js doesn't have built-in signUp page
    error: "/auth/error",
  },

  // Security options
  useSecureCookies: process.env.NODE_ENV === "production",
  
  // Debug in development
  debug: process.env.NODE_ENV === "development",
}
