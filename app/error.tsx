'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FAF8F2] flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-2 border-red-200 bg-white">
        <CardContent className="p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#1E3A8A]">Something went wrong!</h1>
          <p className="text-sm text-[#64748B]">
            {error.message || 'An unexpected error occurred'}
          </p>
          {error.digest && (
            <p className="text-xs text-[#94A3B8] font-mono">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex gap-3 justify-center pt-4">
            <Button
              onClick={reset}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Link href="/">
              <Button
                variant="outline"
                className="border-[#E8E6E0] hover:border-[#2563EB]"
              >
                <Home className="mr-2 h-4 w-4" />
                Go home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

