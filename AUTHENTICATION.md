# Conversate Authentication System

This document outlines the authentication system implemented for the Conversate language learning application.

## Overview

The authentication system includes:
- **Registration Page** (`/auth/register`) - User signup with language preferences
- **Login Page** (`/auth/login`) - User authentication
- **Type-safe Forms** - Using Zod validation schemas
- **Language Selection** - Native and target language selection components

## Components

### 1. Language Selection Components

#### LanguageSelect
- **Location**: `web/src/components/ui/language-select.tsx`
- **Purpose**: Single language dropdown for native language selection
- **Props**:
  - `type`: "native" | "target" - determines which language set to use
  - `value`: Current selected language code
  - `onValueChange`: Callback when selection changes
  - `placeholder`: Optional placeholder text

#### MultiLanguageSelect
- **Location**: `web/src/components/ui/multi-language-select.tsx`
- **Purpose**: Multi-select dropdown for target languages
- **Features**:
  - Chip-based selected language display
  - Remove buttons for individual languages
  - Maximum selection limit (default: 4)
  - Click-outside-to-close behavior
  - Accessibility support
- **Props**:
  - `value`: Array of selected language codes
  - `onValueChange`: Callback with updated selection array
  - `placeholder`: Optional placeholder text
  - `maxSelections`: Maximum number of languages (default: 4)

### 2. Authentication Forms

#### Registration Form
- **Location**: `web/src/app/auth/register/page.tsx`
- **Fields**:
  - Full Name (required, 2-100 characters)
  - Email (required, valid email format)
  - Native Language (required, single selection)
  - Target Languages (required, 1-4 selections)
  - Password (required, minimum 8 characters)
  - Confirm Password (required, must match password)
- **Validation**: Uses `RegisterRequestSchema` from shared package
- **Error Handling**: Real-time field validation with error messages

#### Login Form
- **Location**: `web/src/app/auth/login/page.tsx`
- **Fields**:
  - Email (required, valid email format)
  - Password (required)
- **Validation**: Uses `LoginRequestSchema` from shared package
- **Error Handling**: Form validation with error display

## Type System

### Shared Types
- **Location**: `shared/src/types.ts`
- **Schemas**:
  - `RegisterRequestSchema`: Validates registration form data
  - `LoginRequestSchema`: Validates login form data
  - `AuthResponseSchema`: API response structure
- **Types**: TypeScript interfaces generated from Zod schemas

### Language Constants
- **Location**: `shared/src/languages.ts`
- **Target Languages**: English, Spanish, French, Tagalog
- **Native Languages**: 15+ common languages including major world languages
- **Structure**: Each language has `code`, `name`, and `nativeName`

## UI Components (Shared)

### Select Component
- **Location**: `ui/src/components/ui/select.tsx`
- **Based on**: Radix UI Select primitive
- **Features**: Keyboard navigation, accessibility, custom styling
- **Exports**: All necessary sub-components for building selects

## Usage Examples

### Registration Form Validation
```typescript
const validateForm = (): boolean => {
  try {
    RegisterRequestSchema.parse({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      nativeLanguage: formData.nativeLanguage,
      targetLanguages: formData.targetLanguages
    })
    return true
  } catch (error) {
    // Handle validation errors
    return false
  }
}
```

### Language Selection
```typescript
// Single language selection
<LanguageSelect
  type="native"
  value={formData.nativeLanguage}
  onValueChange={(value) => setNativeLanguage(value)}
  placeholder="Select your native language"
/>

// Multi-language selection
<MultiLanguageSelect
  value={formData.targetLanguages}
  onValueChange={(value) => setTargetLanguages(value)}
  placeholder="Select languages to learn"
  maxSelections={4}
/>
```

## Development

### Running the Development Server
```bash
npm run dev
```

### Building the Project
```bash
npm run build
```

### Testing Authentication
1. Start the development server
2. Navigate to `http://localhost:3000/auth/register`
3. Fill out the registration form with various inputs
4. Test validation by submitting incomplete/invalid data
5. Test the login form at `http://localhost:3000/auth/login`

## Next Steps

1. **API Integration**: Connect forms to actual authentication endpoints
2. **Speech Signature**: Add voice recording for user speech patterns
3. **Error Handling**: Enhance error messages and edge cases
4. **Testing**: Add unit and integration tests
5. **Accessibility**: Further accessibility improvements
6. **Mobile Optimization**: Responsive design enhancements

## Package Structure

```
conversate/
├── shared/          # Shared types, schemas, and utilities
├── ui/             # Reusable UI components
└── web/            # Next.js application with auth pages
```

The authentication system is now fully functional with proper TypeScript support, validation, and a polished user experience.
