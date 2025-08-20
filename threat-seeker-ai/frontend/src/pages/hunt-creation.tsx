import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertTriangle, FileText, Search, Terminal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import apiService, { HypothesisRequest } from '@/services/api';

export function HuntCreation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const initialHypothesis = searchParams.get('hypothesis') || '';
  const [hypothesis, setHypothesis] = useState(initialHypothesis);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hypothesis.trim()) {
      toast({
        title: "Error",
        description: "Please enter a hypothesis.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, the analyst_id would come from the authenticated user
      const request: HypothesisRequest = {
        hypothesis,
        analyst_id: "user-123",
        context: {
          // Additional context could be provided here
          source: "manual_entry",
        }
      };

      const huntPlan = await apiService.createHuntPlan(request);
      
      toast({
        title: "Hunt Plan Created",
        description: `Plan ${huntPlan.plan_id} created successfully.`,
      });

      // Navigate to the review page with the new plan ID
      navigate(`/hunt/review/${huntPlan.plan_id}`);

    } catch (error) {
      console.error("Error creating hunt plan:", error);
      toast({
        title: "Error",
        description: "Failed to create hunt plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Create New Hunt</h1>
        <p className="text-muted-foreground mt-2">
          Enter your threat hypothesis to generate a comprehensive hunt plan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hypothesis Entry</CardTitle>
          <CardDescription>
            Describe what you're hunting for in natural language.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Textarea
                placeholder="I suspect an attacker is using WMI for lateral movement, hiding persistence in WMI event consumer bindings."
                className="min-h-[150px]"
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Be specific about tactics, techniques, and artifacts you suspect.
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                <Search className="mr-2 h-4 w-4" />
                {isLoading ? 'Generating Hunt Plan...' : 'Generate Hunt Plan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Precise Queries</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Automatically generates source-specific queries (Splunk SPL, Elastic KQL, etc.) tailored to your hypothesis.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">MITRE Mapped</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Intelligently maps your hypothesis to MITRE ATT&CK techniques for comprehensive coverage.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Analyst Control</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Review and approve each query before execution. You maintain complete control over the hunt process.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Example Hypotheses</CardTitle>
          <CardDescription>
            Not sure where to start? Try one of these example hypotheses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            "I suspect attackers are using DLL sideloading to execute malicious code through legitimate Windows processes.",
            "I'm concerned about potential data exfiltration via DNS tunneling from our development servers.",
            "I want to hunt for signs of Cobalt Strike beacons using process injection and unusual network connections."
          ].map((example, index) => (
            <div 
              key={index} 
              className="p-4 border rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
              onClick={() => setHypothesis(example)}
            >
              <p className="text-sm">{example}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
