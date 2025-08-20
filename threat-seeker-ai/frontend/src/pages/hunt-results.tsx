import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  AlertTriangle, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Circle, 
  Download, 
  FileText, 
  Filter, 
  MessageSquare, 
  MoreHorizontal, 
  Share2, 
  Shield, 
  Star
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import apiService, { ClarificationRequest } from '@/services/api';

export function HuntResults() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [expandedFindings, setExpandedFindings] = useState<Record<string, boolean>>({});
  const [clarificationQuestion, setClarificationQuestion] = useState('');
  const [clarificationResponse, setClarificationResponse] = useState<string | null>(null);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);

  // Mock data for this example - in a real app, this would come from an API call
  const huntResult = {
    result_id: 'result-123',
    plan_id: id,
    hypothesis: "I suspect an attacker is using WMI for lateral movement, hiding persistence in WMI event consumer bindings.",
    summary: {
      total_queries: 3,
      successful_queries: 3,
      total_results: 127,
      execution_time: "1m 42s",
      execution_date: new Date().toISOString()
    },
    findings: [
      {
        id: 'find1',
        title: 'Suspicious WMI Event Consumer Registration',
        severity: 'critical',
        confidence: 0.95,
        description: 'A new WMI event consumer was registered on DC01 that executes a PowerShell script from a temp directory. This is consistent with WMI persistence techniques described in ATT&CK T1546.003.',
        affected_hosts: ['DC01'],
        events_count: 3,
        techniques: ['T1546.003'],
        details: {
          event_timestamp: '2023-06-15T14:22:33Z',
          user: 'DOMAIN\\admin',
          command: 'powershell.exe -NoP -NonI -W Hidden -Enc UwB0AGEAcgB0AC0AUAByAG8AYwBlAHMAcwAgACIAYwA6AFwAdwBpAG4AZABvAHcAcwBcAHMAeQBzAHQAZQBtADMAMgBcAGMAYQBsAGMALgBlAHgAZQAiAA==',
          decoded_command: 'Start-Process "c:\\windows\\system32\\calc.exe"',
          consumer_name: 'Evil Consumer',
          filter_query: 'SELECT * FROM __InstanceCreationEvent WITHIN 5 WHERE TargetInstance ISA "Win32_Process" AND TargetInstance.Name = "svchost.exe"'
        }
      },
      {
        id: 'find2',
        title: 'Lateral Movement via WMI',
        severity: 'high',
        confidence: 0.88,
        description: 'Multiple instances of WMIC.exe executing remote process creation commands from WORKSTATION03 to several servers. This is consistent with lateral movement using WMI as described in ATT&CK T1047.',
        affected_hosts: ['SERVER01', 'SERVER02', 'DC01'],
        events_count: 12,
        techniques: ['T1047', 'T1021'],
        details: {
          event_timestamp: '2023-06-15T15:45:21Z',
          user: 'DOMAIN\\user',
          command: 'wmic /node:SERVER01 process call create "cmd.exe /c powershell.exe -NoP -NonI -W Hidden -Enc UwB0AGEAcgB0AC0AUAByAG8AYwBlAHMAcwAgACIAYwA6AFwAdwBpAG4AZABvAHcAcwBcAHMAeQBzAHQAZQBtADMAMgBcAGMAYQBsAGMALgBlAHgAZQAiAA=="',
          source_host: 'WORKSTATION03',
          source_process: 'cmd.exe'
        }
      },
      {
        id: 'find3',
        title: 'Abnormal WMI Provider Service Activity',
        severity: 'medium',
        confidence: 0.75,
        description: 'Unusual spikes in WmiPrvSE.exe activity detected on multiple workstations. While this could be legitimate administrative activity, the pattern is inconsistent with typical baseline activity.',
        affected_hosts: ['WORKSTATION01', 'WORKSTATION03', 'WORKSTATION07'],
        events_count: 32,
        techniques: ['T1047'],
        details: {
          time_period: 'Last 24 hours',
          baseline_daily_avg: '15 executions',
          current_count: '47 executions',
          anomaly_score: 0.82
        }
      }
    ],
    patterns: [
      {
        id: 'pattern1',
        name: 'WMI Command Pattern',
        description: 'Commands using WMI for remote execution frequently included encoded PowerShell payloads',
        count: 15
      },
      {
        id: 'pattern2',
        name: 'Temporal Pattern',
        description: 'Most activity occurred during non-business hours (2am-4am local time)',
        count: 27
      },
      {
        id: 'pattern3',
        name: 'Target Selection Pattern',
        description: 'Domain controllers and file servers were targeted more frequently than other systems',
        count: 22
      }
    ],
    recommendations: [
      'Investigate the suspicious WMI event consumer on DC01 and remove if unauthorized',
      'Review DOMAIN\\admin and DOMAIN\\user activities during the time periods of suspicious activity',
      'Implement WMI logging across the environment for better visibility',
      'Consider implementing PowerShell Script Block Logging to capture the execution of encoded commands',
      'Review firewall rules to limit WMI traffic between workstations and critical servers'
    ]
  };

  useEffect(() => {
    // Initialize expanded state for findings
    const expanded: Record<string, boolean> = {};
    huntResult.findings.forEach(finding => {
      expanded[finding.id] = false;
    });
    setExpandedFindings(expanded);
  }, []);

  const toggleExpanded = (findingId: string) => {
    setExpandedFindings(prev => ({
      ...prev,
      [findingId]: !prev[findingId]
    }));
  };

  const askClarification = async () => {
    if (!clarificationQuestion.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAskingQuestion(true);
    
    try {
      // In a real app, this would be an API call
      const request: ClarificationRequest = {
        result_id: huntResult.result_id,
        question: clarificationQuestion,
        context: {
          // Additional context could be provided here
          hypothesis: huntResult.hypothesis,
          findings_count: huntResult.findings.length
        }
      };
      
      // Mock the API response for this example
      // const response = await apiService.requestClarification(request);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response
      const mockResponses = [
        "Based on the findings, the WMI event consumer registration on DC01 appears highly suspicious. The encoded PowerShell command is designed to hide execution and the consumer is triggered by the creation of svchost processes, which is a common technique for persistence. This should be your highest priority for investigation.",
        "The lateral movement pattern shows a clear progression from WORKSTATION03 to multiple servers including domain controllers. This indicates the attacker has compromised at least one user account with administrative privileges across multiple systems. I recommend immediately isolating WORKSTATION03 and resetting credentials for the affected user accounts.",
        "Looking at the temporal pattern in these results, the activity predominantly occurring between 2am-4am suggests a deliberate attempt to avoid detection during off-hours. This is a classic TTP of sophisticated threat actors who understand security monitoring patterns."
      ];
      
      // Select a random response from the mock responses
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      setClarificationResponse(randomResponse);
      
    } catch (error) {
      console.error("Error getting clarification:", error);
      toast({
        title: "Error",
        description: "Failed to get clarification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAskingQuestion(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading hunt results...</p>
        </div>
      </div>
    );
  }

  const renderSeverityBadge = (severity: string) => {
    const classes = {
      critical: "bg-critical/10 text-critical",
      high: "bg-high/10 text-high",
      medium: "bg-medium/10 text-medium",
      low: "bg-low/10 text-low"
    };
    
    return (
      <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${classes[severity as keyof typeof classes] || "bg-info/10 text-info"}`}>
        {severity.toUpperCase()}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Hunt Results</h1>
          <p className="text-muted-foreground mt-1">
            Analysis of hunt execution for plan {id}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Hunt Summary</CardTitle>
          <CardDescription>
            Overview of the hunt execution and results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-1">Hypothesis</h3>
            <p className="text-muted-foreground">{huntResult.hypothesis}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-secondary/50 p-4 rounded-md text-center">
              <p className="text-sm text-muted-foreground">Queries Executed</p>
              <p className="text-2xl font-bold">{huntResult.summary.successful_queries}/{huntResult.summary.total_queries}</p>
            </div>
            <div className="bg-secondary/50 p-4 rounded-md text-center">
              <p className="text-sm text-muted-foreground">Total Results</p>
              <p className="text-2xl font-bold">{huntResult.summary.total_results}</p>
            </div>
            <div className="bg-secondary/50 p-4 rounded-md text-center">
              <p className="text-sm text-muted-foreground">Execution Time</p>
              <p className="text-2xl font-bold">{huntResult.summary.execution_time}</p>
            </div>
            <div className="bg-secondary/50 p-4 rounded-md text-center">
              <p className="text-sm text-muted-foreground">Key Findings</p>
              <p className="text-2xl font-bold">{huntResult.findings.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Findings */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Key Findings</h2>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
        </div>

        <div className="space-y-4">
          {huntResult.findings.map((finding) => {
            const isExpanded = expandedFindings[finding.id] || false;
            
            return (
              <Card key={finding.id} className={`${
                finding.severity === 'critical' ? 'border-l-4 border-l-critical' :
                finding.severity === 'high' ? 'border-l-4 border-l-high' :
                finding.severity === 'medium' ? 'border-l-4 border-l-medium' :
                'border-l-4 border-l-low'
              }`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-5 w-5 ${
                        finding.severity === 'critical' ? 'text-critical' :
                        finding.severity === 'high' ? 'text-high' :
                        finding.severity === 'medium' ? 'text-medium' :
                        'text-low'
                      }`} />
                      <CardTitle>{finding.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderSeverityBadge(finding.severity)}
                      <Button variant="ghost" size="sm">
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{finding.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="text-xs bg-secondary px-2 py-1 rounded-md flex items-center">
                      <Shield className="h-3 w-3 mr-1" />
                      {finding.techniques.join(', ')}
                    </div>
                    <div className="text-xs bg-secondary px-2 py-1 rounded-md flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      {finding.events_count} events
                    </div>
                    <div className="text-xs bg-secondary px-2 py-1 rounded-md flex items-center">
                      <Circle className="h-3 w-3 mr-1" />
                      {finding.affected_hosts.length} hosts affected
                    </div>
                    <div className="text-xs bg-secondary px-2 py-1 rounded-md flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      {Math.round(finding.confidence * 100)}% confidence
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      Affected hosts: {finding.affected_hosts.join(', ')}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toggleExpanded(finding.id)}
                    >
                      {isExpanded ? (
                        <>
                          Hide Details <ChevronUp className="h-4 w-4 ml-1" />
                        </>
                      ) : (
                        <>
                          View Details <ChevronDown className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-4 bg-secondary/50 p-4 rounded-md">
                      <h3 className="font-medium mb-2">Details</h3>
                      <div className="space-y-2">
                        {Object.entries(finding.details).map(([key, value]) => (
                          <div key={key} className="grid grid-cols-3 gap-2">
                            <span className="text-sm font-medium">{key.replace(/_/g, ' ')}:</span>
                            <span className="text-sm col-span-2">{value as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>Identified Patterns</CardTitle>
          <CardDescription>
            Patterns detected across multiple findings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {huntResult.patterns.map((pattern) => (
              <div key={pattern.id} className="flex justify-between items-center p-4 border rounded-md">
                <div>
                  <h3 className="font-medium">{pattern.name}</h3>
                  <p className="text-sm text-muted-foreground">{pattern.description}</p>
                </div>
                <div className="text-sm bg-secondary px-2 py-1 rounded-md">
                  {pattern.count} instances
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Next steps suggested by the Analysis Agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 list-disc pl-5">
            {huntResult.recommendations.map((rec, index) => (
              <li key={index} className="text-muted-foreground">{rec}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Clarification */}
      <Card>
        <CardHeader>
          <CardTitle>Ask for Clarification</CardTitle>
          <CardDescription>
            Need more context or have questions about the results? Ask the Clarification Agent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: 'Can you explain why the WMI event consumer registration is considered suspicious?' or 'What should I prioritize investigating first?'"
            className="min-h-[100px]"
            value={clarificationQuestion}
            onChange={(e) => setClarificationQuestion(e.target.value)}
          />
          
          <div className="flex justify-end">
            <Button 
              onClick={askClarification} 
              disabled={isAskingQuestion || !clarificationQuestion.trim()}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {isAskingQuestion ? 'Processing...' : 'Ask Question'}
            </Button>
          </div>

          {clarificationResponse && (
            <div className="mt-4 p-4 bg-secondary/50 rounded-md">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                Analysis Response
              </h3>
              <p className="text-muted-foreground">{clarificationResponse}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
