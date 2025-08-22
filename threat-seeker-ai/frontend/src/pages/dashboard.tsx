import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  ArrowRight, 
  BarChart2, 
  Check, 
  Clock, 
  Crosshair, 
  FileText, 
  Plus, 
  Shield, 
  Terminal
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import apiService, { Hypothesis } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

export function Dashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedHypotheses, setSuggestedHypotheses] = useState<Hypothesis[]>([]);
  
  // Fetch dynamic hypotheses from the backend
  useEffect(() => {
    const fetchHypotheses = async () => {
      setIsLoading(true);
      try {
        const response = await apiService.getSuggestedHypotheses();
        setSuggestedHypotheses(response.hypotheses);
      } catch (error) {
        console.error('Failed to fetch suggested hypotheses:', error);
        toast({
          title: 'Error fetching suggested hypotheses',
          description: 'Please try refreshing the page.',
          variant: 'destructive'
        });
        // Fallback to static data if API fails
        setSuggestedHypotheses(staticHypotheses);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHypotheses();
  }, [toast]);
  
  // Static data - only used as fallback if API fails
  const recentHunts = [
    { 
      id: 'h1', 
      title: 'WMI Lateral Movement', 
      status: 'completed', 
      findings: 5,
      createdAt: '2023-06-15T14:23:45Z',
      analyst: 'John Smith'
    },
    { 
      id: 'h2', 
      title: 'PowerShell Empire C2', 
      status: 'in_progress', 
      findings: 0,
      createdAt: '2023-06-16T10:12:33Z',
      analyst: 'Jane Doe'
    },
    { 
      id: 'h3', 
      title: 'Cobalt Strike Beacons', 
      status: 'completed', 
      findings: 2,
      createdAt: '2023-06-14T08:45:22Z',
      analyst: 'John Smith'
    }
  ];

  const staticHypotheses = [
    { 
      id: 'sug1', 
      title: 'DCSync attacks from privileged workstations',
      description: 'Look for potential DCSync attacks originating from workstations, which may indicate credential theft.',
      threat_actors: ['APT29', 'FIN7'],
      techniques: ['T1003.006', 'T1207'],
      confidence: 0.85,
      justification: 'Recent breaches have shown an increase in this technique',
      data_sources: ['Windows Event Logs', 'Active Directory Logs'],
      source: 'Intel Feed',
      generated_at: new Date().toISOString()
    },
    { 
      id: 'sug2', 
      title: 'Log4j exploitation attempts in web servers',
      description: 'Monitor for Log4j exploitation attempts targeting your web infrastructure.',
      threat_actors: ['Multiple threat actors'],
      techniques: ['T1190', 'T1059.1'],
      confidence: 0.73,
      justification: 'Widespread vulnerability with continued exploitation attempts',
      data_sources: ['Web Server Logs', 'Network Traffic'],
      source: 'Anomaly Detection',
      generated_at: new Date().toISOString()
    },
    { 
      id: 'sug3', 
      title: 'PsExec usage for lateral movement',
      description: 'Detect potentially malicious use of PsExec for lateral movement across your network.',
      threat_actors: ['APT32', 'FIN10'],
      techniques: ['T1021.002', 'T1570'],
      confidence: 0.91,
      justification: 'Common technique observed in recent campaigns',
      data_sources: ['EDR', 'Process Creation Logs'],
      source: 'MITRE ATT&CK',
      generated_at: new Date().toISOString()
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Threat Hunting Dashboard</h1>
        <Button asChild>
          <Link to="/hunt/create">
            <Plus className="mr-2 h-4 w-4" /> New Hunt
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Hunts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500 font-medium">↑ 12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Hunts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-amber-500 font-medium">→ 0%</span> change
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Findings This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">18</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-red-500 font-medium">↑ 23%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Threats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500 font-medium">↓ 50%</span> from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Hunts</CardTitle>
              <CardDescription>Your team's most recent threat hunting activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {recentHunts.map((hunt) => (
                  <div key={hunt.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-full p-2 ${
                        hunt.status === 'completed' ? 'bg-green-500/10' : 'bg-blue-500/10'
                      }`}>
                        {hunt.status === 'completed' ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{hunt.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          By {hunt.analyst} • {new Date(hunt.createdAt).toLocaleDateString()}
                        </p>
                        {hunt.findings > 0 && (
                          <div className="flex items-center mt-1 text-xs font-medium text-critical">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {hunt.findings} findings detected
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/hunt/results/${hunt.id}`}>
                        View Details <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/hunt/history">
                  <FileText className="mr-2 h-4 w-4" /> View All Hunts
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>AI-Generated Hypotheses</CardTitle>
              <CardDescription>Based on threat intel and system behavior</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestedHypotheses.map((hypothesis) => (
                    <div key={hypothesis.id} className="border rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-medium rounded-full bg-secondary px-2 py-1">
                          {hypothesis.source}
                        </span>
                        <span className="text-xs font-medium">
                          {Math.round(hypothesis.confidence * 100)}% confidence
                        </span>
                      </div>
                      <h4 className="font-medium">{hypothesis.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {hypothesis.description}
                      </p>
                      {hypothesis.techniques && hypothesis.techniques.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {hypothesis.techniques.slice(0, 3).map((technique) => (
                            <span key={technique} className="text-xs bg-secondary/60 px-1.5 py-0.5 rounded">
                              {technique}
                            </span>
                          ))}
                          {hypothesis.techniques.length > 3 && (
                            <span className="text-xs bg-secondary/60 px-1.5 py-0.5 rounded">
                              +{hypothesis.techniques.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      <div className="mt-3 flex justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/hunt/create?hypothesis=${encodeURIComponent(hypothesis.title)}`}>
                            Use This <Crosshair className="ml-1 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Real-time monitoring of hunt execution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-500 mr-2" />
                  <span>Hunt Planner Agent</span>
                </div>
                <span className="rounded-full bg-green-500/20 text-green-500 px-2 py-0.5 text-xs">Operational</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Terminal className="h-5 w-5 text-green-500 mr-2" />
                  <span>Hunt Execution Agent</span>
                </div>
                <span className="rounded-full bg-green-500/20 text-green-500 px-2 py-0.5 text-xs">Operational</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <BarChart2 className="h-5 w-5 text-green-500 mr-2" />
                  <span>Analysis Agent</span>
                </div>
                <span className="rounded-full bg-green-500/20 text-green-500 px-2 py-0.5 text-xs">Operational</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Hypothesis Generation</span>
                </div>
                <span className="rounded-full bg-green-500/20 text-green-500 px-2 py-0.5 text-xs">Operational</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-500 mr-2" />
                  <span>Critic Agent</span>
                </div>
                <span className="rounded-full bg-green-500/20 text-green-500 px-2 py-0.5 text-xs">Operational</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}