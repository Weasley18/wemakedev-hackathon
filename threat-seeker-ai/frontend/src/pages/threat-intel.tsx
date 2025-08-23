import { useState } from 'react';
import { 
  AlertTriangle,
  Calendar, 
  ExternalLink, 
  Eye, 
  Filter, 
  Globe, 
  Info, 
  Link as LinkIcon,
  RefreshCw, 
  Search, 
  Shield, 
  Tag, 
  Zap
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ThreatIntel = {
  id: string;
  title: string;
  description: string;
  source: string;
  publishedDate: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  techniques: string[];
  indicators: {
    type: string;
    value: string;
  }[];
  threatActors?: string[];
  malwareFamilies?: string[];
  industries?: string[];
  link?: string;
  tags?: string[];
};

type IOC = {
  id: string;
  type: 'ip' | 'domain' | 'hash' | 'url' | 'email' | 'file';
  value: string;
  description: string;
  firstSeen: string;
  lastSeen: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  source: string;
  associatedWith?: string[];
  tags?: string[];
};

export function ThreatIntel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('reports');

  // Mock data for threat intelligence reports
  const threatIntelReports: ThreatIntel[] = [
    {
      id: 'ti1',
      title: 'APT29 Targeting COVID-19 Vaccine Researchers',
      description: 'Russian threat actor APT29 (also known as Cozy Bear) is targeting organizations involved in COVID-19 vaccine development with spear-phishing and custom malware.',
      source: 'CISA',
      publishedDate: '2023-06-10T09:15:00Z',
      severity: 'high',
      techniques: ['T1566.001', 'T1190', 'T1059.003'],
      indicators: [
        { type: 'ip', value: '192.168.1.100' },
        { type: 'domain', value: 'covid-research-update.com' },
        { type: 'hash', value: 'e5e9fa1ba31ecd1ae84f75caaa474f3a663f05f4' }
      ],
      threatActors: ['APT29', 'Cozy Bear'],
      malwareFamilies: ['WellMess', 'WellMail'],
      industries: ['Healthcare', 'Research', 'Pharmaceuticals'],
      link: 'https://www.cisa.gov/example-report',
      tags: ['apt', 'russia', 'covid']
    },
    {
      id: 'ti2',
      title: 'Ransomware Campaign Targeting Financial Services',
      description: 'A new ransomware campaign is targeting financial institutions with phishing emails containing malicious Excel documents that exploit CVE-2023-xxxxx.',
      source: 'FBI',
      publishedDate: '2023-06-08T14:30:00Z',
      severity: 'critical',
      techniques: ['T1566.002', 'T1203', 'T1486'],
      indicators: [
        { type: 'hash', value: 'a5e9fa1ba31ecd1ae84f75caaa474f3a663f05f4' },
        { type: 'email', value: 'payment@financial-service-update.com' },
        { type: 'domain', value: 'financial-service-update.com' }
      ],
      threatActors: ['REvil', 'Sodinokibi'],
      malwareFamilies: ['REvil'],
      industries: ['Financial Services', 'Banking'],
      link: 'https://www.ic3.gov/example-report',
      tags: ['ransomware', 'phishing', 'financial']
    },
    {
      id: 'ti3',
      title: 'FIN7 Using New Attack Techniques',
      description: 'FIN7 has been observed using new techniques to target point-of-sale systems in the retail and hospitality sectors.',
      source: 'Private Vendor',
      publishedDate: '2023-06-05T11:45:00Z',
      severity: 'high',
      techniques: ['T1190', 'T1133', 'T1072'],
      indicators: [
        { type: 'hash', value: 'c5e9fa1ba31ecd1ae84f75caaa474f3a663f05f4' },
        { type: 'ip', value: '192.168.1.200' },
        { type: 'domain', value: 'pos-update-service.com' }
      ],
      threatActors: ['FIN7'],
      malwareFamilies: ['Carbanak', 'GRIFFON'],
      industries: ['Retail', 'Hospitality'],
      link: 'https://example.com/threat-report',
      tags: ['fin7', 'pos', 'carbanak']
    },
    {
      id: 'ti4',
      title: 'New Linux Botnet Targeting IoT Devices',
      description: 'A new Linux-based botnet is actively scanning for and exploiting vulnerabilities in IoT devices to create a large-scale DDoS network.',
      source: 'Security Researcher',
      publishedDate: '2023-06-01T08:20:00Z',
      severity: 'medium',
      techniques: ['T1498', 'T1110', 'T1189'],
      indicators: [
        { type: 'ip', value: '192.168.1.300' },
        { type: 'url', value: 'http://iot-update-server.com/download/bot.elf' },
        { type: 'hash', value: 'd5e9fa1ba31ecd1ae84f75caaa474f3a663f05f4' }
      ],
      threatActors: ['Unknown'],
      malwareFamilies: ['IoTReaper', 'Mirai-variant'],
      industries: ['IoT', 'Manufacturing', 'Smart Home'],
      link: 'https://example.com/researcher-blog',
      tags: ['botnet', 'iot', 'ddos']
    },
    {
      id: 'ti5',
      title: 'Lazarus Group Targeting Cryptocurrency Exchanges',
      description: 'North Korean threat actor Lazarus Group continues to target cryptocurrency exchanges and financial institutions with sophisticated spear-phishing campaigns.',
      source: 'CISA',
      publishedDate: '2023-05-28T10:30:00Z',
      severity: 'critical',
      techniques: ['T1566.001', 'T1078', 'T1048'],
      indicators: [
        { type: 'domain', value: 'crypto-investment-opportunity.com' },
        { type: 'hash', value: 'f5e9fa1ba31ecd1ae84f75caaa474f3a663f05f4' },
        { type: 'email', value: 'investor@crypto-investment-opportunity.com' }
      ],
      threatActors: ['Lazarus Group', 'APT38'],
      malwareFamilies: ['AppleJeus'],
      industries: ['Cryptocurrency', 'Financial Services'],
      link: 'https://www.cisa.gov/another-example-report',
      tags: ['lazarus', 'cryptocurrency', 'north-korea']
    }
  ];
  
  // Mock data for IOCs
  const indicators: IOC[] = [
    {
      id: 'ioc1',
      type: 'domain',
      value: 'covid-research-update.com',
      description: 'Phishing domain used in APT29 campaign',
      firstSeen: '2023-06-09T00:00:00Z',
      lastSeen: '2023-06-10T00:00:00Z',
      severity: 'high',
      confidence: 0.95,
      source: 'CISA',
      associatedWith: ['APT29', 'Cozy Bear'],
      tags: ['phishing', 'apt']
    },
    {
      id: 'ioc2',
      type: 'ip',
      value: '192.168.1.100',
      description: 'C2 server for WellMess malware',
      firstSeen: '2023-06-08T00:00:00Z',
      lastSeen: '2023-06-10T00:00:00Z',
      severity: 'high',
      confidence: 0.9,
      source: 'CISA',
      associatedWith: ['APT29', 'WellMess'],
      tags: ['c2', 'apt']
    },
    {
      id: 'ioc3',
      type: 'hash',
      value: 'e5e9fa1ba31ecd1ae84f75caaa474f3a663f05f4',
      description: 'SHA1 hash of WellMess malware payload',
      firstSeen: '2023-06-09T00:00:00Z',
      lastSeen: '2023-06-10T00:00:00Z',
      severity: 'high',
      confidence: 0.95,
      source: 'CISA',
      associatedWith: ['APT29', 'WellMess'],
      tags: ['malware', 'payload']
    },
    {
      id: 'ioc4',
      type: 'hash',
      value: 'a5e9fa1ba31ecd1ae84f75caaa474f3a663f05f4',
      description: 'SHA1 hash of REvil ransomware sample',
      firstSeen: '2023-06-07T00:00:00Z',
      lastSeen: '2023-06-08T00:00:00Z',
      severity: 'critical',
      confidence: 0.98,
      source: 'FBI',
      associatedWith: ['REvil', 'Sodinokibi'],
      tags: ['ransomware', 'payload']
    },
    {
      id: 'ioc5',
      type: 'email',
      value: 'payment@financial-service-update.com',
      description: 'Sender address used in financial phishing campaign',
      firstSeen: '2023-06-07T00:00:00Z',
      lastSeen: '2023-06-08T00:00:00Z',
      severity: 'critical',
      confidence: 0.9,
      source: 'FBI',
      associatedWith: ['REvil'],
      tags: ['phishing', 'ransomware']
    },
    {
      id: 'ioc6',
      type: 'domain',
      value: 'financial-service-update.com',
      description: 'Domain hosting REvil ransomware',
      firstSeen: '2023-06-07T00:00:00Z',
      lastSeen: '2023-06-08T00:00:00Z',
      severity: 'critical',
      confidence: 0.95,
      source: 'FBI',
      associatedWith: ['REvil', 'Sodinokibi'],
      tags: ['phishing', 'malicious-domain']
    },
    {
      id: 'ioc7',
      type: 'hash',
      value: 'c5e9fa1ba31ecd1ae84f75caaa474f3a663f05f4',
      description: 'SHA1 hash of GRIFFON malware used by FIN7',
      firstSeen: '2023-06-04T00:00:00Z',
      lastSeen: '2023-06-05T00:00:00Z',
      severity: 'high',
      confidence: 0.9,
      source: 'Private Vendor',
      associatedWith: ['FIN7', 'GRIFFON'],
      tags: ['malware', 'payload']
    }
  ];

  const filteredReports = threatIntelReports.filter(report => 
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    report.threatActors?.some(actor => actor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredIndicators = indicators.filter(ioc => 
    ioc.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ioc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ioc.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    ioc.associatedWith?.some(entity => entity.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  const renderIndicatorTypeIcon = (type: string) => {
    switch (type) {
      case 'ip':
        return <Globe className="h-4 w-4" />;
      case 'domain':
        return <Globe className="h-4 w-4" />;
      case 'hash':
        return <Shield className="h-4 w-4" />;
      case 'url':
        return <LinkIcon className="h-4 w-4" />;
      case 'email':
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Threat Intelligence</h1>
          <p className="text-muted-foreground mt-1">
            Browse the latest threat intel and indicators of compromise
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search threat intelligence..." 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="reports" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reports">Intel Reports</TabsTrigger>
          <TabsTrigger value="indicators">Indicators (IOCs)</TabsTrigger>
          <TabsTrigger value="feed">Live Feed</TabsTrigger>
        </TabsList>
        
        {/* Reports Tab Content */}
        <TabsContent value="reports" className="mt-6">
          <div className="space-y-6">
            {filteredReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No threat intelligence reports found matching your search criteria.
              </div>
            ) : (
              filteredReports.map(report => (
                <Card key={report.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle className="flex-1">{report.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        {renderSeverityBadge(report.severity)}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <span>Source: {report.source}</span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(report.publishedDate).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{report.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Threat Actors</h4>
                        <div className="flex flex-wrap gap-1">
                          {report.threatActors?.map(actor => (
                            <span key={actor} className="text-xs bg-secondary/80 px-1.5 py-0.5 rounded flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" /> {actor}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Malware</h4>
                        <div className="flex flex-wrap gap-1">
                          {report.malwareFamilies?.map(malware => (
                            <span key={malware} className="text-xs bg-secondary/80 px-1.5 py-0.5 rounded flex items-center">
                              <Zap className="h-3 w-3 mr-1" /> {malware}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Industries</h4>
                        <div className="flex flex-wrap gap-1">
                          {report.industries?.map(industry => (
                            <span key={industry} className="text-xs bg-secondary/80 px-1.5 py-0.5 rounded">
                              {industry}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">MITRE ATT&CK Techniques</h4>
                      <div className="flex flex-wrap gap-1">
                        {report.techniques.map(technique => (
                          <span key={technique} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center">
                            <Shield className="h-3 w-3 mr-1" /> {technique}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Indicators</h4>
                      <div className="space-y-2">
                        {report.indicators.slice(0, 3).map((ioc, index) => (
                          <div key={index} className="flex items-center text-sm p-2 bg-secondary/30 rounded">
                            {renderIndicatorTypeIcon(ioc.type)}
                            <span className="ml-2 font-mono">{ioc.value}</span>
                            <span className="ml-auto text-xs text-muted-foreground">{ioc.type}</span>
                          </div>
                        ))}
                        {report.indicators.length > 3 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{report.indicators.length - 3} more indicators
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between bg-secondary/30 py-2">
                    <div className="flex flex-wrap gap-1">
                      {report.tags?.map(tag => (
                        <span key={tag} className="text-xs bg-secondary px-1.5 py-0.5 rounded flex items-center">
                          <Tag className="h-3 w-3 mr-1" /> {tag}
                        </span>
                      ))}
                    </div>
                    {report.link && (
                      <Button variant="link" size="sm" className="p-0" asChild>
                        <a href={report.link} target="_blank" rel="noopener noreferrer" className="flex items-center">
                          View Source <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        {/* Indicators Tab Content */}
        <TabsContent value="indicators" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Indicators of Compromise</CardTitle>
              <CardDescription>
                Browse and search for specific IOCs across all threat intelligence sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredIndicators.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No indicators found matching your search criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Type</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Value</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Description</th>
                        <th className="text-center py-3 px-4 text-muted-foreground font-medium">Severity</th>
                        <th className="text-center py-3 px-4 text-muted-foreground font-medium">Confidence</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Source</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">First Seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredIndicators.map((ioc) => (
                        <tr key={ioc.id} className="border-b hover:bg-secondary/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              {renderIndicatorTypeIcon(ioc.type)}
                              <span className="ml-2 capitalize">{ioc.type}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono">{ioc.value}</td>
                          <td className="py-3 px-4">{ioc.description}</td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center">
                              {renderSeverityBadge(ioc.severity)}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {Math.round(ioc.confidence * 100)}%
                          </td>
                          <td className="py-3 px-4">{ioc.source}</td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(ioc.firstSeen).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Live Feed Tab Content */}
        <TabsContent value="feed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Threat Intelligence Feed</CardTitle>
              <CardDescription>
                Real-time updates from connected threat intelligence sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-secondary/30 p-4 rounded-md border-l-4 border-primary">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">New IOCs Published</span>
                    <span className="text-xs text-muted-foreground">5 minutes ago</span>
                  </div>
                  <p className="text-sm">CISA has published 15 new IOCs related to APT29 campaign targeting healthcare organizations.</p>
                </div>
                
                <div className="bg-secondary/30 p-4 rounded-md border-l-4 border-high">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Threat Actor Update</span>
                    <span className="text-xs text-muted-foreground">20 minutes ago</span>
                  </div>
                  <p className="text-sm">FIN7 has been observed using a new malware variant targeting retail POS systems.</p>
                </div>
                
                <div className="bg-secondary/30 p-4 rounded-md border-l-4 border-medium">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">New Vulnerability</span>
                    <span className="text-xs text-muted-foreground">1 hour ago</span>
                  </div>
                  <p className="text-sm">CVE-2023-xxxxx: A critical vulnerability in Apache Struts is being actively exploited.</p>
                </div>
                
                <div className="bg-secondary/30 p-4 rounded-md border-l-4 border-info">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">MITRE ATT&CK Update</span>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <p className="text-sm">The MITRE ATT&CK framework has been updated with new techniques observed in recent campaigns.</p>
                </div>
                
                <div className="bg-secondary/30 p-4 rounded-md border-l-4 border-primary">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Threat Report Published</span>
                    <span className="text-xs text-muted-foreground">3 hours ago</span>
                  </div>
                  <p className="text-sm">FBI has published a new report on ransomware trends affecting the financial sector in Q2 2023.</p>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <Button>Load More Updates</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ThreatIntel;
