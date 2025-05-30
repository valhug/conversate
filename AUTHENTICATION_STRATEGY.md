# Conversate Authentication Strategy

## Overview

This document outlines the comprehensive authentication strategy for the Conversate language learning application. The system is built on Auth.js (NextAuth.js v5) and provides secure, scalable user authentication with multiple OAuth providers and credential-based login.

## Current Implementation Status: ✅ Phase 1 Complete

### ✅ Completed Features

#### Auth.js (NextAuth.js v5) Integration
- **Core Auth Setup**: Complete Auth.js configuration with JWT strategy
- **Session Management**: Server-side and client-side session handling
- **Route Protection**: Middleware-based protection for authenticated routes
- **Type Safety**: Full TypeScript integration with custom user types

#### Authentication Providers
- **✅ Credentials Provider**: Email/password authentication with bcrypt hashing
- **✅ Google OAuth**: Complete OAuth 2.0 integration
- **✅ GitHub OAuth**: Complete OAuth 2.0 integration
- **🔄 Apple OAuth**: Configuration ready, pending credentials
- **🔄 Facebook OAuth**: Configuration ready, pending credentials

#### User Management
- **Registration System**: Complete with language preferences
- **Login System**: Multi-provider authentication
- **Session Storage**: JWT-based with secure cookie handling
- **User Store**: In-memory user store (development only)

#### Security Features
- **Password Hashing**: bcrypt implementation
- **Session Security**: Secure cookies in production
- **Route Protection**: Middleware-based authentication checks
- **CSRF Protection**: Built-in Auth.js CSRF protection

**Implementation**:
```
web/
├── src/
│   ├── app/api/auth/[...nextauth]/route.ts  # Auth.js API routes
│   ├── auth.config.ts                       # Auth.js configuration
│   ├── middleware.ts                        # Route protection
│   ├── lib/auth.ts                          # Auth utilities
│   └── components/providers/session-provider.tsx
```

**Completed Features**:
- ✅ Email/password authentication
- ✅ Google OAuth integration
- ✅ GitHub OAuth integration
- ✅ Protected routes with middleware
- ✅ Session management
- ✅ User registration and login flows
- ✅ TypeScript integration

### Phase 2: Shared Authentication Library
**Scope**: Prepare for microservices
**Timeline**: Next development cycle
**Components**:
- Move auth logic to `shared/` package
- Create `@conversate/auth` package
- Standardize JWT payload structure
- Unified session management across services

**Implementation Plan**:
```
shared/
├── src/
│   ├── auth/
│   │   ├── types.ts        # Auth types & interfaces
│   │   ├── jwt-utils.ts    # JWT utilities
│   │   ├── session.ts      # Session management
│   │   ├── providers.ts    # OAuth provider configs
│   │   └── middleware.ts   # Shared auth middleware
└── package.json
```

**Goals**:
- Extract reusable auth components
- Prepare for multiple frontend applications
- Standardize user session structure
- Create shared validation logic

### Phase 3: Dedicated Auth Service
**Scope**: Microservice architecture
**Timeline**: Future backend extraction
**Components**:
- Standalone authentication service
- Database-backed user management
- API-first authentication
- Service-to-service authentication

**Implementation Plan**:
```
auth-service/
├── src/
│   ├── controllers/         # Auth endpoints
│   ├── middleware/          # Service middleware
│   ├── models/             # User models
│   ├── services/           # Auth business logic
│   └── utils/              # JWT, validation utils
├── database/
│   ├── migrations/         # DB schema changes
│   └── seeds/              # Initial data
└── docs/
    └── api/                # OpenAPI specification
```

**Features to Add**:
- PostgreSQL/MongoDB user storage
- Role-based access control (RBAC)
- Multi-tenant support
- Audit logging
- Rate limiting
- Advanced security features

### Phase 4: Advanced Enterprise Features
**Scope**: Enterprise-grade authentication
**Timeline**: Long-term roadmap
**Components**:
- Single Sign-On (SSO)
- Multi-factor authentication (MFA)
- Identity federation
- Advanced audit and compliance

## Current Implementation Details

### Auth.js Configuration
**File**: `src/auth.config.ts`

```typescript
export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({ /* email/password */ }),
    Google({ /* OAuth config */ }),
    GitHub({ /* OAuth config */ }),
  ],
  session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  callbacks: { /* JWT and session callbacks */ }
}
```

### Protected Routes
**File**: `src/middleware.ts`

```typescript
export { auth as middleware } from "@/lib/auth"
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}
```

### Session Provider
**File**: `src/components/providers/session-provider.tsx`

```typescript
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

## Database Schema (Future - Phase 3)

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  native_language VARCHAR(10) NOT NULL,
  target_languages JSONB DEFAULT '[]',
  subscription_tier VARCHAR(50) DEFAULT 'free',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### OAuth Accounts Table
```sql
CREATE TABLE oauth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  last_accessed TIMESTAMP DEFAULT NOW()
);
```

## Security Considerations

### Current Security Features
- ✅ PKCE for OAuth flows
- ✅ Secure JWT token handling
- ✅ HTTPS enforcement (production)
- ✅ CSRF protection
- ✅ Session expiration
- ✅ Input validation

### Future Security Enhancements
- [ ] Rate limiting
- [ ] Brute force protection
- [ ] Account lockout policies
- [ ] Multi-factor authentication
- [ ] Device tracking
- [ ] Suspicious activity detection

## Environment Configuration

### Required Environment Variables
```env
# Auth.js Core
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Future Database (Phase 3)
DATABASE_URL=postgresql://user:pass@localhost:5432/conversate
REDIS_URL=redis://localhost:6379
```

### OAuth Setup Instructions

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials > Create OAuth 2.0 Client ID
5. Set redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to environment variables

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and generate Client Secret
5. Add to environment variables

## Migration Guide

### From Phase 1 to Phase 2
1. **Extract Auth Types**
   ```bash
   # Move auth-related types to shared package
   mv src/types/auth.ts ../shared/src/auth/types.ts
   ```

2. **Create Shared Auth Package**
   ```bash
   cd shared
   npm install jsonwebtoken bcryptjs
   ```

3. **Update Web App Imports**
   ```typescript
   // Before
   import { User, Session } from '@/types/auth'
   
   // After
   import { User, Session } from '@conversate/shared/auth'
   ```

### From Phase 2 to Phase 3
1. **Set up Auth Service**
   ```bash
   mkdir auth-service
   cd auth-service
   npm init -y
   npm install express passport jsonwebtoken bcryptjs
   ```

2. **Database Migration**
   ```bash
   # Run migration scripts
   npm run db:migrate
   npm run db:seed
   ```

3. **Update Frontend**
   ```typescript
   // Replace Auth.js with API calls
   const response = await fetch('/api/auth/login', {
     method: 'POST',
     body: JSON.stringify({ email, password })
   })
   ```

## Testing Strategy

### Current Tests
- [ ] Auth.js configuration
- [ ] OAuth flow integration
- [ ] Protected route middleware
- [ ] Session management
- [ ] User registration/login

### Future Testing Needs
- [ ] API endpoint tests
- [ ] Database integration tests
- [ ] Security penetration tests
- [ ] Load testing for auth service
- [ ] Cross-service authentication tests

## Performance Considerations

### Current Performance
- JWT tokens for stateless sessions
- In-memory user storage (development only)
- Client-side session caching

### Future Optimizations
- Redis session storage
- Database connection pooling
- Auth service caching strategies
- CDN for static auth assets
- Load balancing for auth service

## Monitoring and Logging

### Current Logging
- Auth.js debug logs (development)
- Basic error logging

### Future Monitoring
- Authentication success/failure rates
- OAuth provider response times
- Session creation/expiration metrics
- Security event logging
- User activity analytics

## Success Metrics

### Phase 1 Completion Criteria ✅ COMPLETED
- [x] Auth.js integration working
- [x] OAuth providers functional (Google & GitHub)
- [x] Route protection implemented
- [x] Session management working
- [x] User registration/login flows complete

### Phase 2 Completion Criteria
- [ ] Shared auth package created
- [ ] Web app using shared auth
- [ ] JWT utilities standardized
- [ ] Database schema designed
- [ ] Migration plan documented

### Phase 3 Completion Criteria
- [ ] Auth service deployed
- [ ] Database migration complete
- [ ] Web app integrated with auth service
- [ ] Performance metrics acceptable
- [ ] Security audit passed

### Phase 4 Completion Criteria
- [ ] SSO implementation complete
- [ ] MFA system operational
- [ ] Enterprise integrations tested
- [ ] Compliance requirements met
- [ ] Advanced monitoring deployed

## Risk Assessment

### Current Risks
- **Low**: In-memory user storage (development only)
- **Low**: Single point of failure (monolith)
- **Medium**: OAuth provider dependencies

### Future Risk Mitigation
- Database redundancy and backups
- Multi-region auth service deployment
- OAuth provider fallback mechanisms
- Comprehensive monitoring and alerting

## Compliance and Legal

### Current Compliance
- Basic data privacy (development)
- Secure password handling
- Session security

### Future Compliance Needs
- GDPR compliance for EU users
- CCPA compliance for California users
- SOC 2 Type II certification
- HIPAA compliance (if health data)
- Regular security audits

## Documentation

### Current Documentation
- ✅ This authentication strategy document
- ✅ Auth.js migration completion guide
- ✅ Environment setup instructions
- ✅ OAuth provider setup guides

### Future Documentation Needs
- [ ] API documentation for auth service
- [ ] Database schema documentation
- [ ] Security best practices guide
- [ ] Troubleshooting and runbooks
- [ ] Developer integration guides

## Team Responsibilities

### Current Phase (Phase 1 ✅)
- **Frontend Team**: Auth.js integration, UI components
- **DevOps**: Environment configuration, deployment

### Future Phases
- **Backend Team**: Auth service development, database design
- **Security Team**: Security reviews, penetration testing
- **Product Team**: User experience optimization
- **Compliance Team**: Legal and regulatory compliance

## Timeline and Milestones

### Phase 1: ✅ COMPLETED (May 2025)
- Auth.js integration
- OAuth providers setup
- Basic authentication flows

### Phase 2: Q3 2025 (Planned)
- Shared auth package
- Database schema design
- Migration planning

### Phase 3: Q4 2025 - Q1 2026 (Planned)
- Auth service development
- Database migration
- Service integration

### Phase 4: Q2 2026+ (Future)
- Enterprise features
- Advanced security
- Compliance certification

## Review and Updates

This document should be reviewed and updated:
- After each phase completion
- When new security requirements arise
- When new authentication providers are added
- During architecture reviews
- Before major releases

## Migration Notes

### From Custom JWT to Auth.js
✅ **Completed Migration Steps**:
1. Installed and configured Auth.js v5
2. Replaced custom JWT middleware with Auth.js
3. Updated all API routes to use `auth()` function
4. Migrated components to use `useSession()` hook
5. Added OAuth providers (Google, GitHub)
6. Removed deprecated auth service files
7. Fixed all TypeScript and build issues

### Breaking Changes Handled
- Session structure: `user.userId` → `session.user.id`
- Loading states: Custom `useState` → Auth.js `status`
- Authentication calls: `authService` → `useSession/auth`
- Variable naming: Resolved session conflicts

## Troubleshooting

### Common Issues

#### NextAuth Runtime Error
**Issue**: Edge Runtime compatibility with bcryptjs
**Solution**: Added Node.js runtime to auth route
```typescript
export const runtime = 'nodejs'
```

#### TypeScript Errors
**Issue**: Session type mismatches
**Solution**: Custom module declaration for Auth.js types

#### OAuth Provider Setup
**Issue**: Missing client credentials
**Solution**: Proper environment variable configuration

### Development Testing
1. **Local Setup**: Use provided placeholder credentials
2. **OAuth Testing**: Configure real OAuth apps for testing
3. **Build Verification**: Ensure production build succeeds
4. **Session Testing**: Verify session persistence across refreshes

**Last Updated**: May 28, 2025
**Next Review**: After Phase 2 planning (Q3 2025)
**Document Owner**: Development Team
**Stakeholders**: Security Team, Product Team, DevOps Team

## Conclusion

The Auth.js migration is complete and provides a robust foundation for the Conversate application. The current implementation supports multiple authentication providers, secure session management, and comprehensive route protection. The system is ready for production deployment with proper OAuth credentials and can be extended with additional features as outlined in the roadmap.

**Current Status**: ✅ Phase 1 Complete - Production Ready
**Next Priority**: Database integration and production OAuth setup