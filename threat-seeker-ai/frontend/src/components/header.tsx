import { Bell, Moon, Search, Sun, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/theme-provider';

export function Header() {
  const { theme, setTheme } = useTheme();
  
  return (
    <header className="flex items-center justify-between h-16 px-6 border-b">
      <div className="flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search threats, techniques, findings..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
        
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-critical rounded-full" />
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="font-medium text-sm">Security Analyst</div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
            <span className="sr-only">User menu</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
