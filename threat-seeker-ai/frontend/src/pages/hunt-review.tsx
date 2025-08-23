import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  ArrowRight, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Database, 
  ExternalLink, 
  FileText, 
  InfoIcon, 
  Play, 
  Shield, 
  Terminal, 
  X 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
// QueryApprovalRequest is only used in commented code
import { HuntPlan } from '@/services/api';

export function HuntReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [huntPlan, setHuntPlan] = useState<HuntPlan | null>(null);
  const [expandedQueries, setExpandedQueries] = useState<Record<string, boolean>>({});
  const [approvedQueries, setApprovedQueries] = useState<Record<string, boolean>>({});
  const [modifiedQueries, setModifiedQueries] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  // Mock the loading of the hunt plan - in a real app this would come from the API
  useEffect(() => {
    // Simulate API call
    const fetchHuntPlan = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        // const plan = await apiService.getHuntPlan(id);

        // For this example, we'll use mock data
        const mockPlan: HuntPlan = {
          plan_id: id || 'mock-plan-id',
          hypothesis: "I suspect an attacker is using WMI for lateral movement, hiding persistence in WMI event consumer bindings.",
          queries: [
            {
              query_id: "q1",
              data_source: "splunk",
              query_string: `index=windows source="WinEventLog:Microsoft-Windows-WMI-Activity/Operational" EventCode=5861 
| stats count by Computer, User, Message 
| sort -count`,
              explanation: "This query searches for WMI event consumer registrations in the Windows Event Logs. EventCode 5861 specifically captures when a new permanent event consumer is registered, which could indicate persistence.",
              technique_ids: ["T1546.003"],
              time_range: { start: "-7d", end: "now" },
              expected_volume: "medium",
              risk_level: "high"
            },
            {
              query_id: "q2",
              data_source: "splunk",
              query_string: `index=windows source="WinEventLog:Security" EventCode=4688 process="wmiprvse.exe" 
| stats count by host, user, ParentProcessId, NewProcessId, CommandLine 
| where count > 5`,
              explanation: "This query looks for WmiPrvSE.exe (the WMI Provider Service) process creations. An unusually high number of WMI process executions may indicate automated lateral movement.",
              technique_ids: ["T1047", "T1021"],
              time_range: { start: "-24h", end: "now" },
              expected_volume: "high",
              risk_level: "medium"
            },
            {
              query_id: "q3",
              data_source: "elastic",
              query_string: `process.name:("wmic.exe" OR "wmiprvse.exe") AND event.action:"Process Create" AND 
process.command_line:(*process call create* OR *wmi* OR *win32_process* OR *invoke-wmimethod*)`,
              explanation: "This Elasticsearch query detects potential WMI lateral movement by looking for WMIC command execution creating new processes. Attackers often use 'wmic /node:' for remote execution.",
              technique_ids: ["T1047", "T1569.002"],
              time_range: { start: "-30d", end: "now" },
              expected_volume: "low",
              risk_level: "critical"
            }
          ],
          created_at: new Date().toISOString(),
          analyst_id: "user-123",
          mitre_techniques: [
            {
              id: "T1546.003",
              name: "Windows Management Instrumentation Event Subscription",
              description: "Adversaries may establish persistence by executing malicious content triggered by a Windows Management Instrumentation (WMI) event subscription."
            },
            {
              id: "T1047",
              name: "Windows Management Instrumentation",
              description: "Adversaries may abuse Windows Management Instrumentation (WMI) to execute malicious commands and payloads."
            },
            {
              id: "T1021",
              name: "Remote Services",
              description: "Adversaries may use valid accounts to log into a service specifically designed to accept remote connections."
            }
          ],
          estimated_execution_time: "5 minutes"
        };

        setHuntPlan(mockPlan);
        
        // Initialize expanded and approved states
        const expanded: Record<string, boolean> = {};
        const approved: Record<string, boolean> = {};
        mockPlan.queries.forEach(query => {
          expanded[query.query_id] = false;
          approved[query.query_id] = false;
        });
        setExpandedQueries(expanded);
        setApprovedQueries(approved);
        
      } catch (error) {
        console.error("Error fetching hunt plan:", error);
        toast({
          title: "Error",
          description: `Failed to load hunt plan ${id}. Please try again.`,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchHuntPlan();
    }
  }, [id, toast]);

  const toggleExpanded = (queryId: string) => {
    setExpandedQueries(prev => ({
      ...prev,
      [queryId]: !prev[queryId]
    }));
  };

  const toggleApproved = (queryId: string) => {
    setApprovedQueries(prev => ({
      ...prev,
      [queryId]: !prev[queryId]
    }));
  };

  const handleQueryEdit = (queryId: string, newValue: string) => {
    setModifiedQueries(prev => ({
      ...prev,
      [queryId]: newValue
    }));
  };

  const executeHunt = async () => {
    if (!huntPlan) return;
    
    // Check if any queries are approved
    const approvedQueryIds = Object.entries(approvedQueries)
      .filter(([_, isApproved]) => isApproved)
      .map(([queryId]) => queryId);
    
    if (approvedQueryIds.length === 0) {
      toast({
        title: "No Queries Approved",
        description: "Please approve at least one query to execute the hunt.",
        variant: "destructive",
      });
      return;
    }
    
    setIsExecuting(true);
    
    try {
      // Prepare the modifications object
      const modifications: Record<string, string> = {};
      Object.entries(modifiedQueries).forEach(([queryId, queryString]) => {
        if (approvedQueryIds.includes(queryId)) {
          modifications[queryId] = queryString;
        }
      });
      
      // In a real app, this would execute the hunt
      // Here we would construct the request object
      /* Example request:
      const request: QueryApprovalRequest = {
        plan_id: huntPlan.plan_id,
        query_ids: approvedQueryIds,
        modifications: Object.keys(modifications).length > 0 ? modifications : undefined
      };
      */
      
      // Mock execution for this example
      // const result = await apiService.executeHuntPlan(request);
      
      toast({
        title: "Hunt Executed",
        description: `Executing ${approvedQueryIds.length} queries. Processing results...`,
      });
      
      // In a real app, you would navigate to the results page with the actual result ID
      setTimeout(() => {
        navigate(`/hunt/results/${huntPlan.plan_id}`);
      }, 1500);
      
    } catch (error) {
      console.error("Error executing hunt:", error);
      toast({
        title: "Error",
        description: "Failed to execute hunt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  if (isLoading || !huntPlan) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading hunt plan...</p>
        </div>
      </div>
    );
  }

  const approvedCount = Object.values(approvedQueries).filter(Boolean).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Review Hunt Plan</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve queries before execution.
          </p>
        </div>
        <Button 
          onClick={executeHunt} 
          disabled={approvedCount === 0 || isExecuting}
          className="flex items-center"
        >
          <Play className="mr-2 h-4 w-4" />
          {isExecuting 
            ? 'Executing Hunt...' 
            : `Execute Hunt (${approvedCount}/${huntPlan.queries.length} Queries)`
          }
        </Button>
      </div>

      {/* Hypothesis Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Hypothesis</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{huntPlan.hypothesis}</p>
        </CardContent>
      </Card>

      {/* MITRE ATT&CK Techniques */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">MITRE ATT&CK Techniques</CardTitle>
          <CardDescription>
            Relevant techniques mapped from your hypothesis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {huntPlan.mitre_techniques.map((technique) => (
              <div key={technique.id} className="border rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{technique.id}: {technique.name}</h3>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                </div>
                {technique.description && (
                  <p className="text-sm text-muted-foreground">{technique.description}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Queries */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Proposed Queries</h2>
        <p className="text-muted-foreground mb-6">
          Review each query carefully. Approve or modify as needed. Only approved queries will be executed.
        </p>

        <div className="space-y-4">
          {huntPlan.queries.map((query) => {
            const isExpanded = expandedQueries[query.query_id] || false;
            const isApproved = approvedQueries[query.query_id] || false;
            const modifiedQuery = modifiedQueries[query.query_id];
            
            return (
              <Card key={query.query_id} className={isApproved ? "border-green-500 border-2" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-primary" />
                      <CardTitle>{query.data_source.toUpperCase()}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        query.risk_level === 'critical' ? 'bg-critical/10 text-critical' :
                        query.risk_level === 'high' ? 'bg-high/10 text-high' :
                        query.risk_level === 'medium' ? 'bg-medium/10 text-medium' :
                        'bg-low/10 text-low'
                      }`}>
                        {query.risk_level.toUpperCase()}
                      </div>
                      <Button 
                        variant={isApproved ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => toggleApproved(query.query_id)}
                      >
                        {isApproved ? (
                          <>
                            <Check className="h-4 w-4 mr-1" /> Approved
                          </>
                        ) : (
                          "Approve"
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    <div className="flex items-start gap-2">
                      <InfoIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <p>{query.explanation}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex gap-4">
                      <div className="text-sm text-muted-foreground flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        Time Range: {query.time_range.start} to {query.time_range.end}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        Expected Volume: {query.expected_volume.toUpperCase()}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toggleExpanded(query.query_id)}
                    >
                      {isExpanded ? (
                        <>
                          Hide Query <ChevronUp className="h-4 w-4 ml-1" />
                        </>
                      ) : (
                        <>
                          View Query <ChevronDown className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center">
                          <Terminal className="h-4 w-4 mr-1" />
                          Query Code
                        </h4>
                        {isApproved && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Reset to original query if modified
                              if (modifiedQueries[query.query_id]) {
                                const updatedModifications = {...modifiedQueries};
                                delete updatedModifications[query.query_id];
                                setModifiedQueries(updatedModifications);
                              }
                            }}
                            disabled={!modifiedQueries[query.query_id]}
                          >
                            <X className="h-3 w-3 mr-1" /> Reset Changes
                          </Button>
                        )}
                      </div>
                      <div className="bg-secondary p-4 rounded-md overflow-auto">
                        {isApproved ? (
                          <textarea
                            className="w-full bg-transparent border-none outline-none font-mono text-sm resize-y"
                            value={modifiedQuery || query.query_string}
                            onChange={(e) => handleQueryEdit(query.query_id, e.target.value)}
                            rows={5}
                          />
                        ) : (
                          <pre className="font-mono text-sm whitespace-pre-wrap">{query.query_string}</pre>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {query.technique_ids.map(techniqueId => {
                          const technique = huntPlan.mitre_techniques.find(t => t.id === techniqueId);
                          return (
                            <div 
                              key={techniqueId}
                              className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md"
                            >
                              {techniqueId}: {technique?.name || "Unknown Technique"}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plan Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{new Date(huntPlan.created_at).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Queries</span>
            <span>{huntPlan.queries.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Approved Queries</span>
            <span>{approvedCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Modified Queries</span>
            <span>{Object.keys(modifiedQueries).length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated Execution Time</span>
            <span>{huntPlan.estimated_execution_time}</span>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button 
            onClick={executeHunt} 
            disabled={approvedCount === 0 || isExecuting}
          >
            <Play className="mr-2 h-4 w-4" />
            {isExecuting 
              ? 'Executing Hunt...' 
              : 'Execute Hunt'
            }
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
