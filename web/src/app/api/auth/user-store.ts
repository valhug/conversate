// Mock database - in production, this would be a real database
export interface User {
  id: string
  name: string
  email: string
  passwordHash: string
  nativeLanguage: string
  targetLanguages: string[]
  createdAt: Date
  updatedAt: Date
}

// Simple in-memory store for demo - replace with actual database
// In production, this would be shared via database
export const users: User[] = []

// Helper functions for user management
export const findUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email.toLowerCase() === email.toLowerCase())
}

export const addUser = (user: User): void => {
  users.push(user)
}

export const updateUser = (userId: string, updates: Partial<User>): User | null => {
  const userIndex = users.findIndex(user => user.id === userId)
  if (userIndex === -1) return null
  
  users[userIndex] = { ...users[userIndex], ...updates, updatedAt: new Date() }
  return users[userIndex]
}
