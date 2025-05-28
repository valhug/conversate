"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button, Input, Label, Card, CardHeader, CardContent, CardTitle } from "@conversate/ui"
import { LanguageSelect } from "../../../components/ui/language-select"
import { MultiLanguageSelect } from "../../../components/ui/multi-language-select"
import { RegisterRequest, RegisterRequestSchema } from "@conversate/shared"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<Omit<RegisterRequest, "targetLanguages"> & { 
    targetLanguages: string[];
    confirmPassword: string;
  }>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    nativeLanguage: "",
    targetLanguages: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Validate using Zod schema
    try {
      RegisterRequestSchema.parse({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        nativeLanguage: formData.nativeLanguage,
        targetLanguages: formData.targetLanguages
      })
    } catch (error) {
      if (error instanceof Error && 'errors' in error) {
        const zodError = error as { errors: Array<{ path: string[]; message: string }> }
        zodError.errors.forEach((err) => {
          const field = err.path[0]
          newErrors[field] = err.message
        })
      }
    }

    // Additional validation for confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})
    
    try {
      const registrationData: RegisterRequest = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        nativeLanguage: formData.nativeLanguage,
        targetLanguages: formData.targetLanguages
      }
      
      // Register the user
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      })

      const result = await response.json()
      
      if (result.success) {
        // Automatically sign in the user after successful registration
        const signInResult = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        })
        
        if (signInResult?.error) {
          setErrors({ submit: "Registration successful, but login failed. Please try signing in manually." })
        } else {
          // Redirect to conversation page on successful registration and login
          router.push('/conversation')
        }
      } else {
        setErrors({ submit: result.error || "Registration failed. Please try again." })
      }
      
    } catch (error) {
      console.error("Registration error:", error)
      setErrors({ submit: "Network error. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Join Conversate
          </CardTitle>
          <p className="text-muted-foreground text-center">
            Create your account to start your language learning journey
          </p>
        </CardHeader>
        <CardContent>          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {errors.submit}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nativeLanguage">Native Language</Label>
              <LanguageSelect
                type="native"
                value={formData.nativeLanguage}
                onValueChange={(value) => handleInputChange("nativeLanguage", value)}
                placeholder="Select your native language"
              />
              {errors.nativeLanguage && (
                <p className="text-sm text-destructive">{errors.nativeLanguage}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetLanguages">Languages to Learn</Label>
              <MultiLanguageSelect
                value={formData.targetLanguages}
                onValueChange={(value) => setFormData(prev => ({ ...prev, targetLanguages: value }))}
                placeholder="Select languages you want to learn"
                maxSelections={4}
              />
              {errors.targetLanguages && (
                <p className="text-sm text-destructive">{errors.targetLanguages}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (minimum 8 characters)"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => signIn('google', { callbackUrl: '/conversation' })}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>            Continue with Google
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full mt-2" 
            onClick={() => signIn('github', { callbackUrl: '/conversation' })}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </Button>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}