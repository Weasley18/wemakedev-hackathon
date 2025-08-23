import { useState } from 'react';
import { 
  ArrowRight, 
  BarChart2, 
  Calendar, 
  Clock, 
  Download, 
  Filter, 
  PieChart, 
  RefreshCw, 
  Server, 
  Shield, 
  TrendingUp, 
  Users, 
  Zap 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';

// Create a mock component for charts - in a real app, you'd use a chart library like Chart.js, Recharts, or D3
const MockChart = ({ 
  type, 
  height = 300 
}: { 
  type: 'bar' | 'line' | 'pie' | 'heatmap', 
  height?: number 
}) => {
  const getColor = () => {
    switch (type) {
      case 'bar':
        return 'bg-gradient-to-r from-blue-500/30 to-blue-500/10';
      case 'line':
        return 'bg-gradient-to-r from-green-500/30 to-green-500/10';
      case 'pie':
        return 'bg-gradient-to-r from-violet-500/30 to-violet-500/10';
      case 'heatmap':
        return 'bg-gradient-to-r from-red-500/30 to-red-500/10';
    }
  };
  
  return (
    <div 
      className={`w-full rounded-md flex flex-col items-center justify-center ${getColor()}`} 
      style={{ height: `${height}px` }}
    >
      {type === 'bar' && <BarChart2 className="h-8 w-8 text-muted-foreground mb-2" />}
      {type === 'line' && <TrendingUp className="h-8 w-8 text-muted-foreground mb-2" />}
      {type === 'pie' && <PieChart className="h-8 w-8 text-muted-foreground mb-2" />}
      {type === 'heatmap' && <Server className="h-8 w-8 text-muted-foreground mb-2" />}
      <p className="text-sm text-muted-foreground">
        {type.charAt(0).toUpperCase() + type.slice(1)} Chart
      </p>
    </div>
  );
};

export function Analytics() {
  const [dateRange, setDateRange] = useState('30d');

  // Mock data for top findings
  const topFindings = [
    {
      id: 'finding1',
      title: 'Suspicious WMI Activity',
      count: 24,
      trend: 'up',
      percentage: 15
    },
    {
      id: 'finding2',
      title: 'Unusual PowerShell Commands',
      count: 18,
      trend: 'up',
      percentage: 8
    },
    {
      id: 'finding3',
      title: 'Multiple Failed Authentications',
      count: 15,
      trend: 'down',
      percentage: 3
    },
    {
      id: 'finding4',
      title: 'Anomalous Network Connections',
      count: 12,
      trend: 'up',
      percentage: 6
    },
    {
      id: 'finding5',
      title: 'Suspicious File Creations in System Directories',
      count: 9,
      trend: 'down',
      percentage: 2
    }
  ];

  // Mock data for techniques
  const topTechniques = [
    {
      id: 'T1047',
      name: 'Windows Management Instrumentation',
      count: 32,
      percentage: 18
    },
    {
      id: 'T1059.001',
      name: 'PowerShell',
      count: 28,
      percentage: 15
    },
    {
      id: 'T1078',
      name: 'Valid Accounts',
      count: 22,
      percentage: 12
    },
    {
      id: 'T1021.001',
      name: 'Remote Desktop Protocol',
      count: 17,
      percentage: 9
    },
    {
      id: 'T1190',
      name: 'Exploit Public-Facing Application',
      count: 14,
      percentage: 8
    }
  ];

  // Mock data for impacted systems
  const impactedSystems = [
    {
      id: 'sys1',
      name: 'DC01',
      findings: 12,
      type: 'Domain Controller',
      critical: true
    },
    {
      id: 'sys2',
      name: 'EXCHANGE01',
      findings: 8,
      type: 'Mail Server',
      critical: true
    },
    {
      id: 'sys3',
      name: 'FILESERVER02',
      findings: 6,
      type: 'File Server',
      critical: false
    },
    {
      id: 'sys4',
      name: 'WORKSTATION-EXEC01',
      findings: 5,
      type: 'Executive Workstation',
      critical: true
    },
    {
      id: 'sys5',
      name: 'WEBSERVER03',
      findings: 4,
      type: 'Web Server',
      critical: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Visualize patterns and trends across your threat hunting data
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Custom Range
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button 
                variant={dateRange === '7d' ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange('7d')}
              >
                Last 7 Days
              </Button>
              <Button 
                variant={dateRange === '30d' ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange('30d')}
              >
                Last 30 Days
              </Button>
              <Button 
                variant={dateRange === '90d' ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange('90d')}
              >
                Last 90 Days
              </Button>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Last updated: Today, 10:45 AM</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Hunts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">+12%</span>
              <span className="ml-1">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">78</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500 font-medium">+23%</span>
              <span className="ml-1">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical Findings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-red-500" />
              <span className="text-red-500 font-medium">+8%</span>
              <span className="ml-1">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Impacted Systems</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">36</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-amber-500" />
              <span className="text-amber-500 font-medium">+5%</span>
              <span className="ml-1">vs previous period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Findings Over Time</CardTitle>
            <CardDescription>
              Trends of threat hunting findings across time periods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MockChart type="line" height={300} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Findings by Severity</CardTitle>
            <CardDescription>
              Distribution of findings by severity level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MockChart type="pie" height={300} />
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different analytics views */}
      <Tabs defaultValue="findings" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="findings">Top Findings</TabsTrigger>
          <TabsTrigger value="techniques">MITRE Techniques</TabsTrigger>
          <TabsTrigger value="systems">Impacted Systems</TabsTrigger>
          <TabsTrigger value="attackers">Threat Actors</TabsTrigger>
        </TabsList>
        
        {/* Top Findings Tab Content */}
        <TabsContent value="findings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Recurring Findings</CardTitle>
              <CardDescription>
                Most common findings across all hunts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topFindings.map((finding, index) => (
                  <div key={finding.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center">
                      <div className="font-mono text-muted-foreground w-6">{index + 1}</div>
                      <div className="ml-4">
                        <h3 className="font-medium">{finding.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {finding.count} occurrences
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className={`text-xs font-medium ${finding.trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
                        {finding.trend === 'up' ? '+' : '-'}{finding.percentage}%
                      </div>
                      <Button variant="ghost" size="sm" className="ml-2" asChild>
                        <Link to={`/hunt/search?query=${encodeURIComponent(finding.title)}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Findings by Hunt Type</CardTitle>
                <CardDescription>
                  Distribution of findings across different hunt categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MockChart type="bar" height={250} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Findings by Data Source</CardTitle>
                <CardDescription>
                  Which data sources are yielding the most findings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MockChart type="bar" height={250} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* MITRE Techniques Tab Content */}
        <TabsContent value="techniques" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top MITRE ATT&CK Techniques</CardTitle>
              <CardDescription>
                Most commonly detected techniques across hunts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTechniques.map((technique, index) => (
                  <div key={technique.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center">
                      <div className="font-mono text-muted-foreground w-6">{index + 1}</div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 text-primary mr-2" />
                          <h3 className="font-medium">{technique.id} ({technique.name})</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {technique.count} detections ({technique.percentage}% of all findings)
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-2" asChild>
                      <a href={`https://attack.mitre.org/techniques/${technique.id.split('.')[0]}`} target="_blank" rel="noopener noreferrer">
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Techniques by Tactic</CardTitle>
                <CardDescription>
                  Distribution of detected techniques by MITRE tactic
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MockChart type="bar" height={250} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Technique Detection Over Time</CardTitle>
                <CardDescription>
                  How technique detections evolve over the time period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MockChart type="line" height={250} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Impacted Systems Tab Content */}
        <TabsContent value="systems" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Most Impacted Systems</CardTitle>
              <CardDescription>
                Systems with the highest number of findings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {impactedSystems.map((system, index) => (
                  <div key={system.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center">
                      <div className="font-mono text-muted-foreground w-6">{index + 1}</div>
                      <div className="ml-4">
                        <div className="flex items-center">
                          <Server className="h-4 w-4 text-primary mr-2" />
                          <h3 className="font-medium">{system.name}</h3>
                          {system.critical && (
                            <span className="ml-2 text-xs bg-critical/10 text-critical px-1.5 py-0.5 rounded">
                              CRITICAL
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {system.type} • {system.findings} findings
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-2" asChild>
                      <Link to={`/systems/${system.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>System Findings Heatmap</CardTitle>
                <CardDescription>
                  Visual representation of findings across your network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MockChart type="heatmap" height={250} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Findings by System Type</CardTitle>
                <CardDescription>
                  Distribution of findings across different system categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MockChart type="pie" height={250} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Threat Actors Tab Content */}
        <TabsContent value="attackers" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Threat Actor Activity</CardTitle>
                <CardDescription>
                  Attributed threat actors detected in your environment
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-8 py-4">
                <div className="border-l-4 border-critical pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Zap className="h-5 w-5 text-critical mr-2" />
                      <h3 className="font-medium">APT29 (Cozy Bear)</h3>
                    </div>
                    <div className="text-xs bg-critical/10 text-critical px-2 py-0.5 rounded">HIGH CONFIDENCE</div>
                  </div>
                  <p className="text-sm mb-2">Russian state-sponsored threat actor targeting government and defense sectors.</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="text-xs bg-secondary px-1.5 py-0.5 rounded flex items-center">
                      <Shield className="h-3 w-3 mr-1" /> T1566.001
                    </span>
                    <span className="text-xs bg-secondary px-1.5 py-0.5 rounded flex items-center">
                      <Shield className="h-3 w-3 mr-1" /> T1190
                    </span>
                    <span className="text-xs bg-secondary px-1.5 py-0.5 rounded flex items-center">
                      <Shield className="h-3 w-3 mr-1" /> T1059.003
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      7 affected systems
                    </div>
                    <div className="text-muted-foreground">First detected 2 weeks ago</div>
                  </div>
                </div>
                
                <div className="border-l-4 border-high pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Zap className="h-5 w-5 text-high mr-2" />
                      <h3 className="font-medium">FIN7</h3>
                    </div>
                    <div className="text-xs bg-high/10 text-high px-2 py-0.5 rounded">MEDIUM CONFIDENCE</div>
                  </div>
                  <p className="text-sm mb-2">Financial cybercrime group known for targeting retail and hospitality sectors.</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="text-xs bg-secondary px-1.5 py-0.5 rounded flex items-center">
                      <Shield className="h-3 w-3 mr-1" /> T1190
                    </span>
                    <span className="text-xs bg-secondary px-1.5 py-0.5 rounded flex items-center">
                      <Shield className="h-3 w-3 mr-1" /> T1133
                    </span>
                    <span className="text-xs bg-secondary px-1.5 py-0.5 rounded flex items-center">
                      <Shield className="h-3 w-3 mr-1" /> T1072
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      4 affected systems
                    </div>
                    <div className="text-muted-foreground">First detected 5 days ago</div>
                  </div>
                </div>
                
                <div className="border-l-4 border-medium pl-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Zap className="h-5 w-5 text-medium mr-2" />
                      <h3 className="font-medium">Unknown Actor (REvil Tooling)</h3>
                    </div>
                    <div className="text-xs bg-medium/10 text-medium px-2 py-0.5 rounded">LOW CONFIDENCE</div>
                  </div>
                  <p className="text-sm mb-2">Unattributed actor using REvil ransomware tactics and techniques.</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="text-xs bg-secondary px-1.5 py-0.5 rounded flex items-center">
                      <Shield className="h-3 w-3 mr-1" /> T1566.002
                    </span>
                    <span className="text-xs bg-secondary px-1.5 py-0.5 rounded flex items-center">
                      <Shield className="h-3 w-3 mr-1" /> T1486
                    </span>
                    <span className="text-xs bg-secondary px-1.5 py-0.5 rounded flex items-center">
                      <Shield className="h-3 w-3 mr-1" /> T1490
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      2 affected systems
                    </div>
                    <div className="text-muted-foreground">First detected 3 days ago</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Analytics;
