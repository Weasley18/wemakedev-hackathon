import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Search, 
  FileText, 
  AlertTriangle, 
  BarChart2, 
  Settings,
  Shield,
  Database
} from 'lucide-react';

import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/hunt/create', label: 'Hunt Creation', icon: Search },
  { to: '/hunt/history', label: 'Hunt History', icon: FileText },
  { to: '/intel', label: 'Threat Intel', icon: AlertTriangle },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <div className="flex flex-col w-64 bg-card border-r">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="font-bold text-xl">Threat-Seeker AI</h1>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <div className="rounded-md bg-secondary p-4">
          <div className="flex items-center gap-3 mb-2">
            <Database className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Data Sources</h3>
          </div>
          <ul className="space-y-1 text-sm">
            <li className="flex justify-between">
              <span>Splunk</span>
              <span className="rounded-full bg-green-500/20 text-green-500 px-2 text-xs py-0.5">Connected</span>
            </li>
            <li className="flex justify-between">
              <span>Elastic</span>
              <span className="rounded-full bg-green-500/20 text-green-500 px-2 text-xs py-0.5">Connected</span>
            </li>
            <li className="flex justify-between">
              <span>CrowdStrike</span>
              <span className="rounded-full bg-amber-500/20 text-amber-500 px-2 text-xs py-0.5">Partial</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
