//Memory types for agent state tracking and historical logging

export interface AgentState {
  agentId: string;
  agentName: string;
  currentStatus: 'active' | 'idle' | 'processing' | 'error';
  lastActivity: string;
  totalEventsProcessed: number;
  totalSignalsEmitted: number;
  triggerCount: number;
  uptime: number;
  metadata?: Record<string, any>;
}

export interface MemoryEntry {
  id: string;
  agentId: string;
  timestamp: string;
  type: 'event_processed' | 'signal_emitted' | 'state_change' | 'error';
  data: any;
  hash: string;
}

export interface SignalMemory {
  signalId: string;
  agentId: string;
  signalType: string;
  glyph: string;
  timestamp: string;
  confidence?: number;
  success: boolean;
  processingTime: number;
  details?: Record<string, any>;
}

export interface EventMemory {
  eventId: string;
  agentId: string;
  eventType: string;
  timestamp: string;
  processed: boolean;
  processingTime: number;
  outcome: 'triggered' | 'ignored' | 'error';
  data: any;
}

export interface AgentMemorySnapshot {
  agentId: string;
  agentName: string;
  snapshotTime: string;
  state: AgentState;
  recentSignals: SignalMemory[];
  recentEvents: EventMemory[];
  memoryEntries: MemoryEntry[];
  statistics: {
    signalsToday: number;
    eventsToday: number;
    avgProcessingTime: number;
    successRate: number;
  };
}

export interface MemoryQuery {
  agentId?: string;
  type?: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
  offset?: number;
} 