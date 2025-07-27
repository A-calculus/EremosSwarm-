//Agent Metrics Utility: Global performance tracking for specialized agents

export interface AgentMetrics {
  agentName: string;
  totalEvents: number;
  totalSignals: number;
  successfulSignals: number;
  failedSignals: number;
  averageProcessingTime: number;
  minProcessingTime: number;
  maxProcessingTime: number;
  successRate: number;
  signalsPerHour: number;
  eventsPerHour: number;
  lastActivity: string | null;
  uptime: number;
  startTime: string;
  errorCount: number;
  signalTypes: Record<string, number>;
  recentPerformance: PerformanceEntry[];
}

export interface PerformanceEntry {
  timestamp: string;
  eventType: string;
  processingTime: number;
  success: boolean;
  signalType?: string;
  confidence?: number;
}

export interface MetricsSnapshot {
  timestamp: string;
  totalAgents: number;
  activeAgents: number;
  systemUptime: number;
  totalSystemEvents: number;
  totalSystemSignals: number;
  averageSystemPerformance: number;
  topPerformingAgent: string;
  agentMetrics: Record<string, AgentMetrics>;
}

// Global metrics storage
const agentMetrics: Map<string, AgentMetrics> = new Map();
const systemStartTime = Date.now();

// Initialize agent metrics
export function initializeAgentMetrics(agentName: string): void {
  if (!agentMetrics.has(agentName)) {
    agentMetrics.set(agentName, {
      agentName,
      totalEvents: 0,
      totalSignals: 0,
      successfulSignals: 0,
      failedSignals: 0,
      averageProcessingTime: 0,
      minProcessingTime: Infinity,
      maxProcessingTime: 0,
      successRate: 0,
      signalsPerHour: 0,
      eventsPerHour: 0,
      lastActivity: null,
      uptime: 0,
      startTime: new Date().toISOString(),
      errorCount: 0,
      signalTypes: {},
      recentPerformance: []
    });
  }
}

// Record event processing
export function recordEventProcessing(
  agentName: string,
  eventType: string,
  processingTime: number,
  success: boolean
): void {
  initializeAgentMetrics(agentName);
  const metrics = agentMetrics.get(agentName)!;

  metrics.totalEvents++;
  metrics.lastActivity = new Date().toISOString();
  
  // Update processing time statistics
  if (success) {
    updateProcessingTimeStats(metrics, processingTime);
  } else {
    metrics.errorCount++;
  }

  // Add to recent performance (keep last 100 entries)
  const performanceEntry: PerformanceEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    processingTime,
    success
  };
  
  metrics.recentPerformance.push(performanceEntry);
  if (metrics.recentPerformance.length > 100) {
    metrics.recentPerformance.shift();
  }

  // Update uptime and rates
  updateMetricsCalculations(metrics);
}

// Record signal emission
export function recordSignalEmission(
  agentName: string,
  signalType: string,
  processingTime: number,
  success: boolean,
  confidence?: number
): void {
  initializeAgentMetrics(agentName);
  const metrics = agentMetrics.get(agentName)!;

  metrics.totalSignals++;
  metrics.lastActivity = new Date().toISOString();

  if (success) {
    metrics.successfulSignals++;
    updateProcessingTimeStats(metrics, processingTime);
  } else {
    metrics.failedSignals++;
    metrics.errorCount++;
  }

  // Track signal types
  metrics.signalTypes[signalType] = (metrics.signalTypes[signalType] || 0) + 1;

  // Add to recent performance
  const performanceEntry: PerformanceEntry = {
    timestamp: new Date().toISOString(),
    eventType: 'signal_emission',
    processingTime,
    success,
    signalType,
    confidence
  };
  
  metrics.recentPerformance.push(performanceEntry);
  if (metrics.recentPerformance.length > 100) {
    metrics.recentPerformance.shift();
  }

  // Update calculations
  updateMetricsCalculations(metrics);
}

// Record error occurrence
export function recordAgentError(agentName: string, errorType: string, errorMessage: string): void {
  initializeAgentMetrics(agentName);
  const metrics = agentMetrics.get(agentName)!;

  metrics.errorCount++;
  metrics.lastActivity = new Date().toISOString();

  // Add to recent performance as failed entry
  const performanceEntry: PerformanceEntry = {
    timestamp: new Date().toISOString(),
    eventType: `error_${errorType}`,
    processingTime: 0,
    success: false
  };
  
  metrics.recentPerformance.push(performanceEntry);
  if (metrics.recentPerformance.length > 100) {
    metrics.recentPerformance.shift();
  }
}

// Get metrics for specific agent
export function getAgentMetrics(agentName: string): AgentMetrics | undefined {
  return agentMetrics.get(agentName);
}

// Get all agent metrics
export function getAllAgentMetrics(): Record<string, AgentMetrics> {
  const result: Record<string, AgentMetrics> = {};
  for (const [agentName, metrics] of agentMetrics.entries()) {
    result[agentName] = { ...metrics };
  }
  return result;
}

// Get system-wide metrics snapshot
export function getSystemMetricsSnapshot(): MetricsSnapshot {
  const allMetrics = getAllAgentMetrics();
  const agentNames = Object.keys(allMetrics);
  
  let totalSystemEvents = 0;
  let totalSystemSignals = 0;
  let totalProcessingTime = 0;
  let totalSuccessfulOperations = 0;
  let topPerformingAgent = '';
  let highestSuccessRate = 0;
  let activeAgents = 0;

  for (const [agentName, metrics] of Object.entries(allMetrics)) {
    totalSystemEvents += metrics.totalEvents;
    totalSystemSignals += metrics.totalSignals;
    
    if (metrics.lastActivity && 
        Date.now() - new Date(metrics.lastActivity).getTime() < 24 * 60 * 60 * 1000) {
      activeAgents++;
    }

    if (metrics.successRate > highestSuccessRate) {
      highestSuccessRate = metrics.successRate;
      topPerformingAgent = agentName;
    }

    totalProcessingTime += metrics.averageProcessingTime * (metrics.totalEvents + metrics.totalSignals);
    totalSuccessfulOperations += metrics.successfulSignals;
  }

  const averageSystemPerformance = totalSuccessfulOperations > 0 
    ? totalProcessingTime / totalSuccessfulOperations 
    : 0;

  return {
    timestamp: new Date().toISOString(),
    totalAgents: agentNames.length,
    activeAgents,
    systemUptime: Date.now() - systemStartTime,
    totalSystemEvents,
    totalSystemSignals,
    averageSystemPerformance,
    topPerformingAgent,
    agentMetrics: allMetrics
  };
}

// Reset metrics for specific agent
export function resetAgentMetrics(agentName: string): void {
  agentMetrics.delete(agentName);
}

// Reset all metrics
export function resetAllMetrics(): void {
  agentMetrics.clear();
}

// Helper functions
function updateProcessingTimeStats(metrics: AgentMetrics, processingTime: number): void {
  if (processingTime < metrics.minProcessingTime) {
    metrics.minProcessingTime = processingTime;
  }
  if (processingTime > metrics.maxProcessingTime) {
    metrics.maxProcessingTime = processingTime;
  }

  // Update running average
  const totalOperations = metrics.totalEvents + metrics.totalSignals;
  if (totalOperations === 1) {
    metrics.averageProcessingTime = processingTime;
  } else {
    metrics.averageProcessingTime = (
      (metrics.averageProcessingTime * (totalOperations - 1)) + processingTime
    ) / totalOperations;
  }
}

function updateMetricsCalculations(metrics: AgentMetrics): void {
  // Calculate success rate
  if (metrics.totalSignals > 0) {
    metrics.successRate = metrics.successfulSignals / metrics.totalSignals;
  }

  // Calculate uptime and rates
  const startTime = new Date(metrics.startTime).getTime();
  const uptimeHours = (Date.now() - startTime) / (1000 * 60 * 60);
  metrics.uptime = uptimeHours;

  if (uptimeHours > 0) {
    metrics.signalsPerHour = metrics.totalSignals / uptimeHours;
    metrics.eventsPerHour = metrics.totalEvents / uptimeHours;
  }

  // Handle edge case for minimum processing time
  if (metrics.minProcessingTime === Infinity) {
    metrics.minProcessingTime = 0;
  }
} 