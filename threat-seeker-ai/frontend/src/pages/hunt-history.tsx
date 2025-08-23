import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  ArrowUpDown, 
  Calendar, 
  Check, 
  Clock, 
  Download, 
  Filter, 
  Search, 
  Shield
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

type Hunt = {
  id: string;
  title: string;
  analyst: string;
  status: 'completed' | 'in_progress' | 'failed';
  findings: number;
  createdAt: string;
  hypothesis: string;
  tags?: string[];
  dataSources?: string[];
};

export function HuntHistory() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'findings'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock data for this example - in a real app, this would come from an API call
  const mockHunts: Hunt[] = [
    { 
      id: 'h1', 
      title: 'WMI Lateral Movement Investigation',
      hypothesis: 'Potential lateral movement using WMI across the finance department',
      analyst: 'John Smith',
      status: 'completed', 
      findings: 5,
      createdAt: '2023-06-15T14:23:45Z',
      tags: ['lateral-movement', 'wmi', 'finance'],
      dataSources: ['Windows Event Logs', 'Sysmon']
    },
    { 
      id: 'h2', 
      title: 'PowerShell Empire C2 Detection', 
      hypothesis: 'Signs of PowerShell Empire command and control traffic in the engineering subnet',
      analyst: 'Jane Doe',
      status: 'in_progress', 
      findings: 0,
      createdAt: '2023-06-16T10:12:33Z',
      tags: ['c2', 'powershell', 'engineering'],
      dataSources: ['Firewall Logs', 'EDR', 'DNS Logs']
    },
    { 
      id: 'h3', 
      title: 'Cobalt Strike Beacon Analysis', 
      hypothesis: 'Possible Cobalt Strike beacon activity on executive workstations',
      analyst: 'John Smith',
      status: 'completed', 
      findings: 2,
      createdAt: '2023-06-14T08:45:22Z',
      tags: ['cobalt-strike', 'beaconing', 'executives'],
      dataSources: ['Network Traffic', 'EDR', 'Proxy Logs']
    },
    { 
      id: 'h4', 
      title: 'Log4j Exploitation Investigation', 
      hypothesis: 'Log4j exploitation attempts against external web servers',
      analyst: 'Sarah Jones',
      status: 'completed', 
      findings: 7,
      createdAt: '2023-06-10T09:15:33Z',
      tags: ['log4j', 'web-server', 'vulnerability'],
      dataSources: ['Web Logs', 'WAF Logs']
    },
    { 
      id: 'h5', 
      title: 'Exchange Server Unusual Activity', 
      hypothesis: 'Potential exploitation of Exchange server vulnerabilities',
      analyst: 'David Wilson',
      status: 'completed', 
      findings: 0,
      createdAt: '2023-06-05T11:30:45Z',
      tags: ['exchange', 'email', 'vulnerability'],
      dataSources: ['Exchange Logs', 'Network Traffic']
    },
    { 
      id: 'h6', 
      title: 'LDAP Anonymous Binding Detection', 
      hypothesis: 'LDAP anonymous bindings from non-standard sources',
      analyst: 'Jane Doe',
      status: 'failed', 
      findings: 0,
      createdAt: '2023-06-02T13:20:15Z',
      tags: ['ldap', 'active-directory', 'authentication'],
      dataSources: ['Domain Controller Logs']
    },
    { 
      id: 'h7', 
      title: 'RDP Brute Force Investigation', 
      hypothesis: 'RDP brute force attempts against bastion hosts',
      analyst: 'Mark Johnson',
      status: 'completed', 
      findings: 3,
      createdAt: '2023-05-28T15:40:12Z',
      tags: ['rdp', 'brute-force', 'bastion'],
      dataSources: ['RDP Logs', 'Windows Event Logs']
    },
  ];

  const [filteredHunts, setFilteredHunts] = useState<Hunt[]>(mockHunts);

  useEffect(() => {
    setIsLoading(true);
    // In a real app, this would be where you'd make an API call
    
    // Filter hunts based on search term
    const filtered = mockHunts.filter(hunt => 
      hunt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hunt.hypothesis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hunt.analyst.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hunt.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    // Sort hunts
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' ? a.findings - b.findings : b.findings - a.findings;
      }
    });
    
    setFilteredHunts(sorted);
    setIsLoading(false);
  }, [searchTerm, sortBy, sortOrder]);

  const toggleSort = (field: 'date' | 'findings') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc'); // Default to descending when changing sort field
    }
  };

  const renderStatusBadge = (status: string) => {
    const classes = {
      completed: "bg-green-500/10 text-green-500",
      in_progress: "bg-blue-500/10 text-blue-500",
      failed: "bg-red-500/10 text-red-500"
    };
    
    const icons = {
      completed: <Check className="h-3 w-3 mr-1" />,
      in_progress: <Clock className="h-3 w-3 mr-1" />,
      failed: <AlertTriangle className="h-3 w-3 mr-1" />
    };
    
    return (
      <div className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center ${classes[status as keyof typeof classes]}`}>
        {icons[status as keyof typeof icons]}
        {status === 'in_progress' ? 'IN PROGRESS' : status.toUpperCase()}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hunt History</h1>
          <p className="text-muted-foreground mt-1">
            Browse past and ongoing threat hunting activities
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export History
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by title, hypothesis, analyst or tag" 
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Advanced Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              {filteredHunts.length} hunts found
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredHunts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hunt records found. Try adjusting your search criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Hunt</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Analyst</th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">Status</th>
                    <th 
                      className="text-center py-3 px-4 text-muted-foreground font-medium cursor-pointer"
                      onClick={() => toggleSort('findings')}
                    >
                      <div className="flex items-center justify-center">
                        Findings 
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 text-muted-foreground font-medium cursor-pointer"
                      onClick={() => toggleSort('date')}
                    >
                      <div className="flex items-center">
                        Date 
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHunts.map((hunt) => (
                    <tr key={hunt.id} className="border-b hover:bg-secondary/50 transition-colors">
                      <td className="py-3 px-4">
                        <Link 
                          to={`/hunt/results/${hunt.id}`} 
                          className="hover:underline font-medium hover:text-primary transition-colors"
                        >
                          {hunt.title}
                        </Link>
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {hunt.hypothesis}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {hunt.tags?.map(tag => (
                            <span key={tag} className="text-xs bg-secondary px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4">{hunt.analyst}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-center">
                          {renderStatusBadge(hunt.status)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {hunt.findings > 0 ? (
                          <div className="flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-critical mr-1" />
                            {hunt.findings}
                          </div>
                        ) : hunt.status === 'in_progress' ? (
                          <span className="text-muted-foreground">Pending</span>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(hunt.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Analysts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>John Smith</span>
                <span className="font-medium">3 hunts</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Jane Doe</span>
                <span className="font-medium">2 hunts</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sarah Jones</span>
                <span className="font-medium">1 hunt</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Used Data Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Windows Event Logs</span>
                <span className="font-medium">3 hunts</span>
              </div>
              <div className="flex justify-between items-center">
                <span>EDR</span>
                <span className="font-medium">3 hunts</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Network Traffic</span>
                <span className="font-medium">2 hunts</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Common MITRE Techniques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-primary mr-2" />
                  <span>T1047 (WMI)</span>
                </div>
                <span className="font-medium">3 hunts</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-primary mr-2" />
                  <span>T1059.001 (PowerShell)</span>
                </div>
                <span className="font-medium">2 hunts</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 text-primary mr-2" />
                  <span>T1190 (Exploit Public-Facing App)</span>
                </div>
                <span className="font-medium">2 hunts</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default HuntHistory;
