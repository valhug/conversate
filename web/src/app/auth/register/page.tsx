"use client"

import { useState } from "react"
import Link from "next/link"
import { Button, Input, Label, Card, CardHeader, CardContent, CardTitle } from "@conversate/ui"
import { LanguageSelect } from "../../../components/ui/language-select"
import { MultiLanguageSelect } from "../../../components/ui/multi-language-select"
import { RegisterRequest, RegisterRequestSchema } from "@conversate/shared"

export default function RegisterPage() {
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
      // TODO: Implement actual registration logic with API call
      console.log("Registration attempt:", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        nativeLanguage: formData.nativeLanguage,
        targetLanguages: formData.targetLanguages
      })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // TODO: Handle successful registration (redirect, etc.)
      alert("Registration successful! (This is a placeholder)")
      
    } catch (error) {
      console.error("Registration error:", error)
      setErrors({ submit: "Registration failed. Please try again." })
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
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
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