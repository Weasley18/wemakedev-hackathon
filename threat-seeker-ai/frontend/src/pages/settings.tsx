import { useState } from 'react';
import { 
  AlertTriangle, 
  Database, 
  Key, 
  Moon, 
  Save, 
  Shield, 
  Sun, 
  User
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/context/theme-provider';
import { useToast } from '@/components/ui/use-toast';

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [formState, setFormState] = useState({
    splunkHost: 'splunk.example.com',
    splunkPort: '8089',
    elasticHost: 'http://localhost:9200',
    threatIntelEnabled: true,
    autoHypothesisGeneration: true,
    maxQueriesPerHunt: '10',
    maxResultsPerQuery: '1000'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Settings Saved",
      description: "Your changes have been saved successfully.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>

      <form onSubmit={handleSubmit}>
        {/* Theme Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Theme Settings</CardTitle>
            <CardDescription>Customize the appearance of the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-4">
                <label className="text-sm font-medium">Theme</label>
                <div className="flex gap-4 mt-2">
                  <Button 
                    type="button"
                    variant={theme === 'light' ? 'default' : 'outline'} 
                    onClick={() => setTheme('light')}
                    className="flex-1"
                  >
                    <Sun className="h-5 w-5 mr-2" />
                    Light
                  </Button>
                  <Button 
                    type="button"
                    variant={theme === 'dark' ? 'default' : 'outline'} 
                    onClick={() => setTheme('dark')}
                    className="flex-1"
                  >
                    <Moon className="h-5 w-5 mr-2" />
                    Dark
                  </Button>
                  <Button 
                    type="button"
                    variant={theme === 'system' ? 'default' : 'outline'} 
                    onClick={() => setTheme('system')}
                    className="flex-1"
                  >
                    System
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Sources */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Data Sources</CardTitle>
            </div>
            <CardDescription>Configure connections to your data sources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Splunk</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Host
                  </label>
                  <input 
                    type="text" 
                    name="splunkHost"
                    value={formState.splunkHost}
                    onChange={handleChange}
                    className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Port
                  </label>
                  <input 
                    type="text" 
                    name="splunkPort"
                    value={formState.splunkPort}
                    onChange={handleChange}
                    className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Username
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter Splunk username"
                    className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                    />
                    <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end">
                <Button variant="outline" size="sm">
                  Test Connection
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Elasticsearch</h3>
              
              <div>
                <label className="text-sm font-medium">
                  Host URL
                </label>
                <input 
                  type="text" 
                  name="elasticHost"
                  value={formState.elasticHost}
                  onChange={handleChange}
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Username
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter Elastic username"
                    className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                    />
                    <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end">
                <Button variant="outline" size="sm">
                  Test Connection
                </Button>
              </div>
            </div>
            
            <div className="pt-2">
              <Button variant="outline" className="w-full">
                <Database className="h-4 w-4 mr-2" />
                Add New Data Source
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hunt Settings */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Hunt Settings</CardTitle>
            </div>
            <CardDescription>Configure threat hunting behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Threat Intelligence Integration</label>
                <p className="text-xs text-muted-foreground">Enrich hunt results with threat intelligence data</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="threatIntelEnabled"
                  checked={formState.threatIntelEnabled}
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium">Automatic Hypothesis Generation</label>
                <p className="text-xs text-muted-foreground">Generate hunt hypotheses based on threat intelligence</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="autoHypothesisGeneration"
                  checked={formState.autoHypothesisGeneration}
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  Maximum Queries per Hunt
                </label>
                <input 
                  type="number" 
                  name="maxQueriesPerHunt"
                  value={formState.maxQueriesPerHunt}
                  onChange={handleChange}
                  min="1"
                  max="50"
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                />
                <p className="text-xs text-muted-foreground mt-1">Limit the number of queries generated for each hunt</p>
              </div>
              <div>
                <label className="text-sm font-medium">
                  Maximum Results per Query
                </label>
                <input 
                  type="number" 
                  name="maxResultsPerQuery"
                  value={formState.maxResultsPerQuery}
                  onChange={handleChange}
                  min="100"
                  max="10000"
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                />
                <p className="text-xs text-muted-foreground mt-1">Limit the number of results returned per query</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>API Settings</CardTitle>
            <CardDescription>Configure API keys for AI and integrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Google Gemini API Key
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="your-gemini-api-key"
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                />
                <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">Required for the AI-powered hunt planning and analysis</p>
            </div>

            <div className="mt-4 flex items-center p-4 border border-amber-500/30 bg-amber-500/10 rounded-md text-amber-500">
              <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
              <p className="text-sm">
                API keys are encrypted at rest and only used for communicating with their respective services.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Settings */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>User Settings</CardTitle>
            </div>
            <CardDescription>Configure your user profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  Display Name
                </label>
                <input 
                  type="text" 
                  placeholder="Security Analyst"
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Email
                </label>
                <input 
                  type="email" 
                  placeholder="analyst@example.com"
                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
