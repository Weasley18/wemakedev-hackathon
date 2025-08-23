import { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Position,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

interface FindingDetail {
  id: string;
  title: string;
  severity: string;
  confidence: number;
  description: string;
  affected_hosts: string[];
  events_count: number;
  techniques: string[];
  details: Record<string, string | number>;
}

interface AttackPathGraphProps {
  findings: FindingDetail[];
  onNodeClick?: (finding: FindingDetail) => void;
}

// Custom node styling based on severity
const getSeverityColor = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'critical': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#f59e0b';
    case 'low': return '#10b981';
    default: return '#6366f1';
  }
};

const nodeStyles = {
  host: { backgroundColor: '#1e293b', color: '#ffffff', border: '1px solid #475569' },
  user: { backgroundColor: '#1e40af', color: '#ffffff', border: '1px solid #2563eb' },
  process: { backgroundColor: '#4f46e5', color: '#ffffff', border: '1px solid #6366f1' },
  file: { backgroundColor: '#7c3aed', color: '#ffffff', border: '1px solid #8b5cf6' },
  network: { backgroundColor: '#0f766e', color: '#ffffff', border: '1px solid #14b8a6' },
  finding: { backgroundColor: '#b91c1c', color: '#ffffff', border: '1px solid #ef4444' },
};

export function AttackPathGraph({ findings, onNodeClick: handleFindingClick }: AttackPathGraphProps) {
  // Initialize nodes and edges states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Extract entities from findings and create graph data
  const createGraphData = useCallback(() => {
    // Map to track unique entities (hosts, users, processes, etc.)
    const entityMap = new Map();
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // Track node positions for layout
    let hostX = 100;
    const hostY = 100;
    const hostSpacing = 250;
    
    // First, extract hosts and add them as nodes
    const hosts = new Set<string>();
    findings.forEach(finding => finding.affected_hosts.forEach(host => hosts.add(host)));
    
    // Add host nodes
    Array.from(hosts).forEach((host, index) => {
      const id = `host-${host.toLowerCase().replace(/\./g, '-')}`;
      const node: Node = {
        id,
        type: 'default',
        data: { 
          label: host,
          type: 'host',
        },
        position: { x: hostX + (index * hostSpacing), y: hostY },
        style: {
          ...nodeStyles.host,
          width: 180,
          borderRadius: '4px',
          padding: '10px',
        },
      };
      
      newNodes.push(node);
      entityMap.set(host.toLowerCase(), id);
    });
    
    // Process each finding to extract additional entities and relationships
    findings.forEach((finding, findingIndex) => {
      const findingId = `finding-${finding.id}`;
      
      // Add finding node
      newNodes.push({
        id: findingId,
        type: 'default',
        data: { 
          label: finding.title,
          finding: finding, // Store the full finding data for reference
          type: 'finding',
        },
        position: { 
          x: 150 + (findingIndex * 100), 
          y: 400 
        },
        style: {
          backgroundColor: getSeverityColor(finding.severity),
          color: '#ffffff',
          borderColor: getSeverityColor(finding.severity),
          width: 200,
          borderRadius: '4px',
          padding: '10px',
        },
      });
      
      // Connect findings to hosts
      finding.affected_hosts.forEach(host => {
        const hostId = entityMap.get(host.toLowerCase()) || `host-${host.toLowerCase().replace(/\./g, '-')}`;
        newEdges.push({
          id: `edge-${findingId}-${hostId}`,
          source: findingId,
          target: hostId,
          animated: true,
          style: { stroke: getSeverityColor(finding.severity), strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: getSeverityColor(finding.severity),
          },
        });
      });
      
      // Extract additional entities from details
      const details = finding.details;
      
      // User extraction (if available)
      if (details.user) {
        const userId = `user-${String(details.user).toLowerCase().replace(/[\\\/\s]/g, '-')}`;
        if (!entityMap.has(userId)) {
          newNodes.push({
            id: userId,
            type: 'default',
            data: { 
              label: String(details.user),
              type: 'user',
            },
            position: { 
              x: 400 + (findingIndex * 50), 
              y: 250 
            },
            style: {
              ...nodeStyles.user,
              width: 180,
              borderRadius: '4px',
              padding: '10px',
            },
          });
          entityMap.set(userId, userId);
        }
        
        // Connect user to finding
        newEdges.push({
          id: `edge-${userId}-${findingId}`,
          source: userId,
          target: findingId,
          animated: false,
          style: { stroke: '#3b82f6', strokeWidth: 1 },
        });
      }
      
      // Process extraction (if available)
      if (details.process_name || details.command || details.process_path) {
        const processName = String(details.process_name || details.command || details.process_path);
        const processId = `process-${processName.toLowerCase().replace(/[\\\/\s]/g, '-')}-${findingIndex}`;
        
        newNodes.push({
          id: processId,
          type: 'default',
          data: { 
            label: processName.length > 30 ? processName.substring(0, 27) + '...' : processName,
            type: 'process',
            fullLabel: processName,
          },
          position: { 
            x: 600 + (findingIndex * 50), 
            y: 200 + (findingIndex * 50)
          },
          style: {
            ...nodeStyles.process,
            width: 180,
            borderRadius: '4px',
            padding: '10px',
          },
        });
        
        // Connect process to finding
        newEdges.push({
          id: `edge-${processId}-${findingId}`,
          source: processId,
          target: findingId,
          animated: false,
          style: { stroke: '#4f46e5', strokeWidth: 1 },
        });
        
        // If there's a parent process, add that too
        if (details.parent_process_id) {
          const parentName = String(details.parent_process_name || 'Parent Process');
          const parentId = `process-parent-${parentName.toLowerCase().replace(/[\\\/\s]/g, '-')}-${findingIndex}`;
          
          newNodes.push({
            id: parentId,
            type: 'default',
            data: { 
              label: parentName.length > 30 ? parentName.substring(0, 27) + '...' : parentName,
              type: 'process',
            },
            position: { 
              x: 700 + (findingIndex * 50), 
              y: 150 + (findingIndex * 30)
            },
            style: {
              ...nodeStyles.process,
              width: 180,
              borderRadius: '4px',
              padding: '10px',
            },
          });
          
          // Connect parent to child process
          newEdges.push({
            id: `edge-${parentId}-${processId}`,
            source: parentId,
            target: processId,
            animated: false,
            style: { stroke: '#4f46e5', strokeWidth: 1 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
            },
          });
        }
      }
    });
    
    // Apply a simple force-directed layout algorithm (in a real app, use a proper layout library)
    // For this example, we'll keep it simple with the manual positioning above
    
    return { newNodes, newEdges };
  }, [findings]);
  
  // Initialize graph data when findings change
  useEffect(() => {
    const { newNodes, newEdges } = createGraphData();
    setNodes(newNodes);
    setEdges(newEdges);
  }, [findings, createGraphData]);
  
  // Handle node clicks to show details
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.data?.finding && typeof handleFindingClick === 'function') {
      handleFindingClick(node.data.finding);
    }
  }, [handleFindingClick]);
  
  // Reset zoom and center the view
  const resetView = useCallback(() => {
    // This would be implemented with a flow instance ref in a full implementation
  }, []);
  
  // Custom legend for node types
  const nodeLegend = useMemo(() => (
    <div className="flex flex-col gap-2 bg-card/80 backdrop-blur-sm p-2 rounded-md border">
      <h4 className="text-sm font-medium">Node Types</h4>
      <div className="flex gap-4 flex-wrap">
        {Object.entries({
          'Host': nodeStyles.host,
          'User': nodeStyles.user,
          'Process': nodeStyles.process, 
          'Finding': { backgroundColor: getSeverityColor('critical') }
        }).map(([label, style]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: style.backgroundColor }} 
            />
            <span className="text-xs">{label}</span>
          </div>
        ))}
      </div>
    </div>
  ), []);
  
  return (
    <Card className="h-[500px]">
      <CardHeader className="pb-2">
        <CardTitle>Attack Path Visualization</CardTitle>
        <CardDescription>
          Interactive visualization of entities and relationships in the hunt findings
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[420px]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          fitView
          attributionPosition="bottom-left"
          connectionLineType={ConnectionLineType.SmoothStep}
        >
          <Background />
          <Controls />
          <Panel position="top-right" className="flex gap-2">
            <Button size="sm" variant="outline" onClick={resetView}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset View
            </Button>
            {nodeLegend}
          </Panel>
        </ReactFlow>
      </CardContent>
    </Card>
  );
}
