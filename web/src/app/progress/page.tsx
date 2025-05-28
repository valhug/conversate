'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ProgressDashboard } from '@/components/progress/progress-dashboard';
import { authService } from '@/lib/auth-service';
import { User, LanguageCode } from '@conversate/shared';

export default function ProgressPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      // Redirect to login if not authenticated
      router.push('/auth/login?redirect=/progress');
      return;
    }
    setUser(currentUser);
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

export default function ProgressPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Learning Progress</h1>
          <div className="w-[100px]" /> {/* Spacer for center alignment */}
        </div>
      </div>      {/* Progress Dashboard Content */}
      <div className="container mx-auto p-6">
        <ProgressDashboard 
          userId={user!.id} 
          language={(user!.targetLanguages[0] || 'en') as LanguageCode} 
        />
      </div>
    </div>
  );
}
