// Domain Types

export interface Project {
  id: string;
  name: string;
  code: string; // e.g. "PRD-Water-v2"
  region: string;
  type: 'Atmosphere' | 'Water' | 'Soil' | 'Mixed';
  status: 'Active' | 'Archived' | 'Simulating';
  health: number; // 0-100
  lastModified: string;
  description: string;
}

export interface WorkflowNode {
  id: string;
  type: 'data' | 'model' | 'algorithm' | 'decision' | 'output';
  label: string;
  x: number;
  y: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  inputs: string[]; // Node IDs
  config?: Record<string, any>; // Added for specific configuration details
}

export interface Metric {
  name: string;
  value: number | string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  status: 'normal' | 'warning' | 'critical';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  isReasoning?: boolean;
}

export enum SimulationState {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED'
}

// Data Management Types
export interface DataConnector {
  id: string;
  name: string;
  type: 'IoT' | 'Satellite' | 'Database' | 'API' | 'File';
  status: 'Connected' | 'Error' | 'Syncing';
  lastSync: string;
  source: string;
}

export interface ETLJob {
  id: string;
  name: string;
  sourceId: string;
  targetId: string;
  status: 'Idle' | 'Running' | 'Failed';
  schedule: string;
  lastRun: string;
}

// Navigation Types
export type PageId = 
  // Platform Level
  | 'platform-dashboard'
  | 'platform-monitor'
  | 'platform-risk'
  
  // Project Space (Business Layer)
  | 'project-overview' // The Gallery View
  | 'project-dashboard' // The Single Project Dashboard (was project-bi)
  | 'project-data'
  | 'project-workflow'
  | 'project-simulation'
  
  // AI Platform (Core Engine Layer)
  | 'ai-dashboard'
  | 'ai-models'      
  | 'ai-algorithms'
  | 'ai-workflows'   
  | 'ai-agents'      
  | 'ai-skills'
  | 'ai-knowledge'
  | 'ai-reasoning'
  | 'ai-security'
  
  // System Layer
  | 'system-settings';