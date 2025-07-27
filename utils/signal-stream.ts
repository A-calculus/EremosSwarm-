//Signal Streaming: Real-time signal emission tracking and broadcasting

export interface StreamedSignal {
  id: string;
  agent: string;
  type: string;
  glyph: string;
  hash: string;
  timestamp: string;
  confidence?: number;
  details?: Record<string, any>;
  metadata?: {
    priority: string;
    category: string;
    source: string;
  };
}

export interface SignalStreamFilter {
  agentName?: string;
  agentId?: string;
  signalType?: string;
  category?: string;
  priority?: string;
  minConfidence?: number;
}

export interface SignalStreamClient {
  id: string;
  response: any; // Express Response object
  filter?: SignalStreamFilter;
  lastUpdate: number;
  signalCount: number;
}

// In-memory signal stream storage
const recentSignals: StreamedSignal[] = [];
const signalStreamClients = new Map<string, SignalStreamClient>();
const MAX_RECENT_SIGNALS = 1000; // Keep last 1000 signals in memory

// Signal emission event listeners
type SignalListener = (signal: StreamedSignal) => void;
const signalListeners: SignalListener[] = [];

export function addSignalListener(listener: SignalListener): void {
  signalListeners.push(listener);
}

export function removeSignalListener(listener: SignalListener): void {
  const index = signalListeners.indexOf(listener);
  if (index > -1) {
    signalListeners.splice(index, 1);
  }
}

// Reset function for testing
export function resetSignalStream(): void {
  recentSignals.length = 0;
  signalStreamClients.clear();
  signalListeners.length = 0;
}

// Emit signal to streaming system
export function emitSignalToStream(signal: {
  agent: string;
  type: string;
  glyph: string;
  hash: string;
  timestamp: string;
  confidence?: number;
  details?: Record<string, any>;
  metadata?: {
    priority: string;
    category: string;
    source: string;
  };
}): StreamedSignal {
  const streamedSignal: StreamedSignal = {
    id: `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...signal
  };

  // Add to recent signals buffer
  recentSignals.push(streamedSignal);
  
  // Maintain buffer size
  if (recentSignals.length > MAX_RECENT_SIGNALS) {
    recentSignals.shift(); // Remove oldest signal
  }

  // Notify all listeners
  signalListeners.forEach(listener => {
    try {
      listener(streamedSignal);
    } catch (error) {
      console.error('Signal listener error:', error);
    }
  });

  // Broadcast to streaming clients
  broadcastSignalToClients(streamedSignal);

  return streamedSignal;
}

// Register streaming client
export function registerSignalStreamClient(
  clientId: string, 
  response: any, 
  filter?: SignalStreamFilter
): void {
  signalStreamClients.set(clientId, {
    id: clientId,
    response,
    filter,
    lastUpdate: Date.now(),
    signalCount: 0
  });

  console.log(`Signal stream client ${clientId} registered${filter ? ' with filter' : ''}`);
}

// Unregister streaming client
export function unregisterSignalStreamClient(clientId: string): void {
  const client = signalStreamClients.get(clientId);
  if (client) {
    try {
      client.response.end();
    } catch (e) {
      // Client already disconnected
    }
    signalStreamClients.delete(clientId);
    console.log(`Signal stream client ${clientId} unregistered`);
  }
}

// Broadcast signal to streaming clients
function broadcastSignalToClients(signal: StreamedSignal): void {
  signalStreamClients.forEach((client, clientId) => {
    if (shouldSendSignalToClient(signal, client)) {
      try {
        const data = {
          timestamp: new Date().toISOString(),
          type: 'signal_emission',
          data: signal
        };

        client.response.write(`data: ${JSON.stringify(data)}\n\n`);
        client.lastUpdate = Date.now();
        client.signalCount++;
      } catch (error) {
        console.error(`Error sending signal to client ${clientId}:`, error);
        unregisterSignalStreamClient(clientId);
      }
    }
  });
}

// Check if signal matches client filter
function shouldSendSignalToClient(signal: StreamedSignal, client: SignalStreamClient): boolean {
  if (!client.filter) return true;

  const filter = client.filter;

  // Agent name filter
  if (filter.agentName && signal.agent !== filter.agentName) {
    return false;
  }

  // Agent ID filter (from metadata source)
  if (filter.agentId && signal.metadata?.source !== filter.agentId) {
    return false;
  }

  // Signal type filter
  if (filter.signalType && signal.type !== filter.signalType) {
    return false;
  }

  // Category filter
  if (filter.category && signal.metadata?.category !== filter.category) {
    return false;
  }

  // Priority filter
  if (filter.priority && signal.metadata?.priority !== filter.priority) {
    return false;
  }

  // Minimum confidence filter
  if (filter.minConfidence !== undefined && 
      (signal.confidence === undefined || signal.confidence < filter.minConfidence)) {
    return false;
  }

  return true;
}

// Get recent signals with optional filtering
export function getRecentSignals(
  filter?: SignalStreamFilter,
  limit?: number
): StreamedSignal[] {
  let filteredSignals = recentSignals;

  if (filter) {
    filteredSignals = recentSignals.filter(signal => {
      // Create a mock client to reuse filtering logic
      const mockClient: SignalStreamClient = {
        id: 'filter',
        response: null,
        filter,
        lastUpdate: 0,
        signalCount: 0
      };
      return shouldSendSignalToClient(signal, mockClient);
    });
  }

  // Sort by timestamp (most recent first)
  filteredSignals.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (limit) {
    return filteredSignals.slice(0, limit);
  }

  return filteredSignals;
}

// Get signal stream statistics
export function getSignalStreamStats(): {
  totalSignalsEmitted: number;
  recentSignalsCount: number;
  activeClients: number;
  clientStats: Array<{
    clientId: string;
    signalCount: number;
    connected: string;
    filter?: SignalStreamFilter;
  }>;
} {
  const clientStats = Array.from(signalStreamClients.entries()).map(([clientId, client]) => ({
    clientId,
    signalCount: client.signalCount,
    connected: new Date(client.lastUpdate).toISOString(),
    filter: client.filter
  }));

  return {
    totalSignalsEmitted: recentSignals.length,
    recentSignalsCount: recentSignals.length,
    activeClients: signalStreamClients.size,
    clientStats
  };
}

// Cleanup disconnected clients
export function cleanupSignalStreamClients(): void {
  const now = Date.now();
  const timeoutMs = 60000; // 60 seconds

  const staleClients = Array.from(signalStreamClients.entries()).filter(
    ([_, client]) => now - client.lastUpdate > timeoutMs
  );

  staleClients.forEach(([clientId]) => {
    unregisterSignalStreamClient(clientId);
  });

  if (staleClients.length > 0) {
    console.log(`Cleaned up ${staleClients.length} stale signal stream clients`);
  }
}

// Generate client ID
export function generateSignalStreamClientId(): string {
  return `signal_client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Periodic cleanup
const cleanupInterval = setInterval(cleanupSignalStreamClients, 30000); // Clean up every 30 seconds

// Cleanup on process exit
process.on('SIGINT', () => {
  clearInterval(cleanupInterval);
}); 