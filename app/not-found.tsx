import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileQuestion, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF8F2] flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-2 border-[#E8E6E0] bg-white">
        <CardContent className="p-8 text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 bg-[#F0F9FF] rounded-full">
              <FileQuestion className="h-8 w-8 text-[#2563EB]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#1E3A8A]">404 - Page Not Found</h1>
          <p className="text-sm text-[#64748B]">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Link href="/">
              <Button
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
              >
                <Home className="mr-2 h-4 w-4" />
                Go home
              </Button>
            </Link>
            <Link href="/search">
              <Button
                variant="outline"
                className="border-[#E8E6E0] hover:border-[#2563EB]"
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

