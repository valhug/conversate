import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

export const { auth, signIn, signOut, handlers } = NextAuth(authConfig)

// Server-side function to get session
export const getServerSession = auth

// Helper function to get user from session
export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

// Helper function to require authentication
export async function requireAuth() {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Authentication required")
  }
  return session.user
}
