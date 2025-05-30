// Edge Runtime compatible user store
// This is a simple in-memory store since Prisma cannot run in Edge Runtime

export interface User {
  id: string
  email: string
  name: string
  hashedPassword?: string
  nativeLanguage: string
  targetLanguages: string[]
  image?: string
  emailVerified?: Date
}

// In-memory user store for Edge Runtime compatibility
// In production, this should be replaced with a database adapter that supports Edge Runtime
const users: Map<string, User> = new Map()

// Add a default admin user for testing
users.set('admin@conversate.com', {
  id: '1',
  email: 'admin@conversate.com',
  name: 'Admin User',
  hashedPassword: '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptpws.YQvQvIGFem.', // "password123"
  nativeLanguage: 'English',
  targetLanguages: ['Spanish', 'French'],
})

export function findUserByEmail(email: string): User | undefined {
  return users.get(email)
}

export function findUserById(id: string): User | undefined {
  for (const user of users.values()) {
    if (user.id === id) {
      return user
    }
  }
  return undefined
}

export function createUser(userData: Omit<User, 'id'>): User {
  const id = (users.size + 1).toString()
  const user: User = { ...userData, id }
  users.set(userData.email, user)
  return user
}

// Function to sync user from database registration
export function syncUserFromRegistration(userData: {
  email: string
  name: string
  hashedPassword: string
  nativeLanguage: string
  targetLanguages: string[]
}): User {
  const id = (users.size + 1).toString()
  const user: User = { ...userData, id }
  users.set(userData.email, user)
  return user
}

export function updateUser(email: string, updates: Partial<User>): User | undefined {
  const user = users.get(email)
  if (!user) return undefined
  
  const updatedUser = { ...user, ...updates }
  users.set(email, updatedUser)
  return updatedUser
}
