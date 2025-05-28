'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ProgressDashboard } from '@/components/progress/progress-dashboard';

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
        <ProgressDashboard userId="demo-user" language="en" />
      </div>
    </div>
  );
}
