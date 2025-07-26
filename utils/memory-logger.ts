//Memory Logger Utility: Tracks agent states, signals, and events with persistent logging

import { 
  AgentState, 
  MemoryEntry, 
  SignalMemory, 
  EventMemory, 
  AgentMemorySnapshot,
  MemoryQuery 
} from "../types/memory";
import { generateSignalHash } from "./signal";
import { recordCall } from "./metrics";

//In-memory storage for agent states and memory entries
const agentStates = new Map<string, AgentState>();
const memoryEntries = new Map<string, MemoryEntry[]>();
const signalMemories = new Map<string, SignalMemory[]>();
const eventMemories = new Map<string, EventMemory[]>();

//Initialize agent state if not exists
export const initializeAgentState = (agentId: string, agentName: string): AgentState => {
  if (!agentStates.has(agentId)) {
    const state: AgentState = {
      agentId,
      agentName,
      currentStatus: 'idle',
      lastActivity: new Date().toISOString(),
      totalEventsProcessed: 0,
      totalSignalsEmitted: 0,
      triggerCount: 0,
      uptime: 0,
      metadata: {}
    };
    agentStates.set(agentId, state);
    
    //Initialize memory collections
    memoryEntries.set(agentId, []);
    signalMemories.set(agentId, []);
    eventMemories.set(agentId, []);
    
    logMemoryEntry(agentId, 'state_change', { action: 'initialized', state });
  }
  return agentStates.get(agentId)!;
};

//Update agent state
export const updateAgentState = (agentId: string, updates: Partial<AgentState>): AgentState => {
  const currentState = agentStates.get(agentId);
  if (!currentState) {
    throw new Error(`Agent ${agentId} state not initialized`);
  }
  
  const newState = { ...currentState, ...updates, lastActivity: new Date().toISOString() };
  agentStates.set(agentId, newState);
  
  logMemoryEntry(agentId, 'state_change', { 
    previous: currentState.currentStatus,
    new: newState.currentStatus,
    updates 
  });
  
  return newState;
};

//Log a memory entry
export const logMemoryEntry = (
  agentId: string, 
  type: MemoryEntry['type'], 
  data: any
): MemoryEntry => {
  const entry: MemoryEntry = {
    id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    agentId,
    timestamp: new Date().toISOString(),
    type,
    data,
    hash: generateSignalHash({ agentId, type, data })
  };
  
  const entries = memoryEntries.get(agentId) || [];
  entries.push(entry);
  
  //Keep only last 1000 entries per agent
  if (entries.length > 1000) {
    entries.splice(0, entries.length - 1000);
  }
  
  memoryEntries.set(agentId, entries);
  recordCall('memory_entry_logged');
  
  return entry;
};

//Log signal emission
export const logSignalEmission = (
  agentId: string,
  signalType: string,
  glyph: string,
  success: boolean,
  processingTime: number,
  confidence?: number,
  details?: Record<string, any>
): SignalMemory => {
  const signalMemory: SignalMemory = {
    signalId: `sig_${Date.now()}_${agentId}`,
    agentId,
    signalType,
    glyph,
    timestamp: new Date().toISOString(),
    confidence,
    success,
    processingTime,
    details
  };
  
  const signals = signalMemories.get(agentId) || [];
  signals.push(signalMemory);
  
  //Keep only last 500 signals per agent
  if (signals.length > 500) {
    signals.splice(0, signals.length - 500);
  }
  
  signalMemories.set(agentId, signals);
  
  //Update agent state
  const state = agentStates.get(agentId);
  if (state) {
    updateAgentState(agentId, { 
      totalSignalsEmitted: state.totalSignalsEmitted + 1,
      currentStatus: 'active'
    });
  }
  
  logMemoryEntry(agentId, 'signal_emitted', { signalType, success, confidence });
  recordCall('signal_logged');
  
  return signalMemory;
};

//Log event processing
export const logEventProcessing = (
  agentId: string,
  eventType: string,
  eventData: any,
  outcome: EventMemory['outcome'],
  processingTime: number
): EventMemory => {
  const eventMemory: EventMemory = {
    eventId: `evt_${Date.now()}_${agentId}`,
    agentId,
    eventType,
    timestamp: new Date().toISOString(),
    processed: outcome !== 'error',
    processingTime,
    outcome,
    data: eventData
  };
  
  const events = eventMemories.get(agentId) || [];
  events.push(eventMemory);
  
  //Keep only last 500 events per agent
  if (events.length > 500) {
    events.splice(0, events.length - 500);
  }
  
  eventMemories.set(agentId, events);
  
  //Update agent state
  const state = agentStates.get(agentId);
  if (state) {
    updateAgentState(agentId, {
      totalEventsProcessed: state.totalEventsProcessed + 1,
      triggerCount: outcome === 'triggered' ? state.triggerCount + 1 : state.triggerCount,
      currentStatus: outcome === 'error' ? 'error' : 'active'
    });
  }
  
  logMemoryEntry(agentId, 'event_processed', { eventType, outcome, processingTime });
  recordCall('event_logged');
  
  return eventMemory;
};

//Get agent state
export const getAgentState = (agentId: string): AgentState | undefined => {
  return agentStates.get(agentId);
};

//Query memory entries
export const queryMemoryEntries = (query: MemoryQuery): MemoryEntry[] => {
  let results: MemoryEntry[] = [];
  
  if (query.agentId) {
    results = memoryEntries.get(query.agentId) || [];
  } else {
    //Get all entries from all agents
    for (const entries of memoryEntries.values()) {
      results.push(...entries);
    }
  }
  
  //Filter by type
  if (query.type) {
    results = results.filter(entry => entry.type === query.type);
  }
  
  //Filter by time range
  if (query.startTime) {
    results = results.filter(entry => entry.timestamp >= query.startTime!);
  }
  if (query.endTime) {
    results = results.filter(entry => entry.timestamp <= query.endTime!);
  }
  
  //Sort by timestamp (newest first)
  results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  //Apply pagination
  const offset = query.offset || 0;
  const limit = query.limit || 100;
  
  return results.slice(offset, offset + limit);
};

//Generate comprehensive memory snapshot for an agent
export const generateMemorySnapshot = (agentId: string): AgentMemorySnapshot | null => {
  const state = agentStates.get(agentId);
  if (!state) {
    return null;
  }
  
  const recentSignals = (signalMemories.get(agentId) || []).slice(-10);
  const recentEvents = (eventMemories.get(agentId) || []).slice(-10);
  const entries = (memoryEntries.get(agentId) || []).slice(-20);
  
  //Calculate statistics for today
  const today = new Date().toISOString().split('T')[0];
  const todaySignals = recentSignals.filter(s => s.timestamp.startsWith(today));
  const todayEvents = recentEvents.filter(e => e.timestamp.startsWith(today));
  
  const avgProcessingTime = recentEvents.length > 0 
    ? recentEvents.reduce((sum, e) => sum + e.processingTime, 0) / recentEvents.length 
    : 0;
    
  const successRate = recentSignals.length > 0 
    ? recentSignals.filter(s => s.success).length / recentSignals.length 
    : 1.0;
  
  return {
    agentId,
    agentName: state.agentName,
    snapshotTime: new Date().toISOString(),
    state,
    recentSignals,
    recentEvents,
    memoryEntries: entries,
    statistics: {
      signalsToday: todaySignals.length,
      eventsToday: todayEvents.length,
      avgProcessingTime: Math.round(avgProcessingTime * 100) / 100,
      successRate: Math.round(successRate * 100) / 100
    }
  };
};

//Get memory statistics across all agents
export const getMemoryStatistics = () => {
  const totalAgents = agentStates.size;
  const totalMemoryEntries = Array.from(memoryEntries.values()).reduce((sum, entries) => sum + entries.length, 0);
  const totalSignals = Array.from(signalMemories.values()).reduce((sum, signals) => sum + signals.length, 0);
  const totalEvents = Array.from(eventMemories.values()).reduce((sum, events) => sum + events.length, 0);
  
  const activeAgents = Array.from(agentStates.values()).filter(state => 
    state.currentStatus === 'active' || state.currentStatus === 'processing'
  ).length;
  
  return {
    totalAgents,
    activeAgents,
    totalMemoryEntries,
    totalSignals,
    totalEvents,
    memoryUsage: {
      states: agentStates.size,
      entriesPerAgent: totalMemoryEntries / totalAgents || 0,
      signalsPerAgent: totalSignals / totalAgents || 0,
      eventsPerAgent: totalEvents / totalAgents || 0
    }
  };
};

//Clear old memory entries (cleanup utility)
export const cleanupMemory = (olderThanDays: number = 7): number => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);
  const cutoffTime = cutoff.toISOString();
  
  let cleanedCount = 0;
  
  //Clean memory entries
  for (const [agentId, entries] of memoryEntries.entries()) {
    const filtered = entries.filter(entry => entry.timestamp >= cutoffTime);
    cleanedCount += entries.length - filtered.length;
    memoryEntries.set(agentId, filtered);
  }
  
  //Clean signal memories
  for (const [agentId, signals] of signalMemories.entries()) {
    const filtered = signals.filter(signal => signal.timestamp >= cutoffTime);
    signalMemories.set(agentId, filtered);
  }
  
  //Clean event memories
  for (const [agentId, events] of eventMemories.entries()) {
    const filtered = events.filter(event => event.timestamp >= cutoffTime);
    eventMemories.set(agentId, filtered);
  }
  
  recordCall('memory_cleanup');
  return cleanedCount;
}; 