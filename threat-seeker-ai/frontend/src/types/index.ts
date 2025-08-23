export interface FindingDetail {
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
