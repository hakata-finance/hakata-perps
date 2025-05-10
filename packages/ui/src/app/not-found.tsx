'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 text-center bg-[#09090b] text-[#949fa6]">
      <h2 className="text-6xl font-bold text-primary text-white">404</h2>
      <h3 className="text-2xl font-semibold mb-6 text-white">Page Not Found</h3>
      <p className="text-muted-foreground mb-8 max-w-md">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 text-white">
        <Button
          onClick={() => window.history.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        <Link href="/">
          <Button variant="outline">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
} 