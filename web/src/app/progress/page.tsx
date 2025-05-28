'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ProgressDashboard } from '@/components/progress/progress-dashboard';
import { useSession } from 'next-auth/react';
import { LanguageCode } from '@conversate/shared';

export default function ProgressPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login?callbackUrl=/progress');
    return null;
  }

  if (!session?.user) {
    return null;
  }

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
      </div>

      {/* Progress Dashboard Content */}
      <div className="container mx-auto p-6">
        <ProgressDashboard 
          userId={session.user.id!} 
          language={'en' as LanguageCode} 
        />
      </div>
    </div>
  );
}
