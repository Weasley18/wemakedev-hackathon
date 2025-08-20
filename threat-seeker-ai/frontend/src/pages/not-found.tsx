import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] space-y-6">
      <AlertTriangle className="h-16 w-16 text-amber-500" />
      <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
      <p className="text-muted-foreground text-center max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Button asChild>
        <Link to="/">
          <Home className="mr-2 h-4 w-4" /> Return to Dashboard
        </Link>
      </Button>
    </div>
  );
}
