//Metrics Streaming Endpoints: Real-time metrics monitoring via Server-Sent Events (SSE)

import express from 'express';
import { 
  getAgentMetrics,
  getAllAgentMetrics,
  getSystemMetricsSnapshot
} from '../utils/agent-metrics';
import { AGENT_GLYPHS } from '../types/glyphs';

const router = express.Router();

interface StreamClient {
  id: string;
  response: express.Response;
  agentFilter?: string;
  lastUpdate: number;
}

// Store active SSE connections
const sseClients = new Map<string, StreamClient>();

// Real-time system metrics stream
router.get('/system', (req, res) => {
  const clientId = generateClientId();
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Register client
  sseClients.set(clientId, {
    id: clientId,
    response: res,
    lastUpdate: Date.now()
  });

  // Send initial data
  sendSystemMetrics(clientId);

  // Handle client disconnect
  req.on('close', () => {
    sseClients.delete(clientId);
    console.log(`SSE client ${clientId} disconnected from system metrics`);
  });

  console.log(`SSE client ${clientId} connected to system metrics stream`);
});

// Real-time agent-specific metrics stream
router.get('/agent', (req, res) => {
  const { name } = req.query;
  const clientId = generateClientId();
  
  if (!name || typeof name !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Missing agent name parameter',
      message: 'Please provide agent name as query parameter: ?name=AgentName'
    });
    return;
  }

  // Validate agent exists
  const agentExists = Object.values(AGENT_GLYPHS).some(agent => agent.agentName === name);
  if (!agentExists) {
    res.status(404).json({
      success: false,
      error: 'Agent not found',
      message: `Agent '${name}' does not exist`,
      availableAgents: Object.values(AGENT_GLYPHS).map(agent => agent.agentName)
    });
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Register client
  sseClients.set(clientId, {
    id: clientId,
    response: res,
    agentFilter: name,
    lastUpdate: Date.now()
  });

  // Send initial data
  sendAgentMetrics(clientId, name);

  // Handle client disconnect
  req.on('close', () => {
    sseClients.delete(clientId);
    console.log(`SSE client ${clientId} disconnected from ${name} metrics`);
  });

  console.log(`SSE client ${clientId} connected to ${name} metrics stream`);
});

// Live metrics summary stream for dashboards
router.get('/summary', (req, res) => {
  const clientId = generateClientId();
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Register client
  sseClients.set(clientId, {
    id: clientId,
    response: res,
    lastUpdate: Date.now()
  });

  // Send initial summary
  sendMetricsSummary(clientId);

  // Handle client disconnect
  req.on('close', () => {
    sseClients.delete(clientId);
    console.log(`SSE client ${clientId} disconnected from metrics summary`);
  });

  console.log(`SSE client ${clientId} connected to metrics summary stream`);
});

// Utility functions
function generateClientId(): string {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function sendSystemMetrics(clientId: string): void {
  const client = sseClients.get(clientId);
  if (!client) return;

  try {
    const snapshot = getSystemMetricsSnapshot();
    const data = {
      timestamp: new Date().toISOString(),
      type: 'system_metrics',
      data: snapshot
    };

    client.response.write(`data: ${JSON.stringify(data)}\n\n`);
    client.lastUpdate = Date.now();
  } catch (error) {
    console.error(`Error sending system metrics to client ${clientId}:`, error);
    sseClients.delete(clientId);
  }
}

function sendAgentMetrics(clientId: string, agentName: string): void {
  const client = sseClients.get(clientId);
  if (!client) return;

  try {
    const metrics = getAgentMetrics(agentName);
    const agentInfo = Object.values(AGENT_GLYPHS).find(agent => agent.agentName === agentName);
    
    const data = {
      timestamp: new Date().toISOString(),
      type: 'agent_metrics',
      agentName,
      data: metrics ? {
        ...metrics,
        agentInfo: agentInfo ? {
          agentId: agentInfo.agentId,
          glyph: agentInfo.glyph,
          role: agentInfo.role,
          description: agentInfo.description
        } : null
      } : null
    };

    client.response.write(`data: ${JSON.stringify(data)}\n\n`);
    client.lastUpdate = Date.now();
  } catch (error) {
    console.error(`Error sending agent metrics to client ${clientId}:`, error);
    sseClients.delete(clientId);
  }
}

function sendMetricsSummary(clientId: string): void {
  const client = sseClients.get(clientId);
  if (!client) return;

  try {
    const allMetrics = getAllAgentMetrics();
    const summary = Object.entries(allMetrics).map(([agentName, metrics]) => {
      const agentInfo = Object.values(AGENT_GLYPHS).find(agent => agent.agentName === agentName);
      
      return {
        agentName,
        agentId: agentInfo?.agentId || 'unknown',
        glyph: agentInfo?.glyph || '?',
        role: agentInfo?.role || 'unknown',
        totalEvents: metrics.totalEvents,
        totalSignals: metrics.totalSignals,
        successRate: Math.round(metrics.successRate * 100) / 100,
        averageProcessingTime: Math.round(metrics.averageProcessingTime * 100) / 100,
        signalsPerHour: Math.round(metrics.signalsPerHour * 100) / 100,
        lastActivity: metrics.lastActivity,
        uptime: Math.round(metrics.uptime * 100) / 100,
        errorCount: metrics.errorCount,
        status: metrics.lastActivity && 
          Date.now() - new Date(metrics.lastActivity).getTime() < 60 * 60 * 1000 
            ? 'active' : 'inactive'
      };
    });

    // Sort by success rate descending
    summary.sort((a, b) => b.successRate - a.successRate);

    const data = {
      timestamp: new Date().toISOString(),
      type: 'metrics_summary',
      count: summary.length,
      data: summary
    };

    client.response.write(`data: ${JSON.stringify(data)}\n\n`);
    client.lastUpdate = Date.now();
  } catch (error) {
    console.error(`Error sending metrics summary to client ${clientId}:`, error);
    sseClients.delete(clientId);
  }
}

// Periodic update function - broadcasts to all connected clients
function broadcastUpdates(): void {
  const now = Date.now();
  const updateInterval = 2000; // 2 seconds

  sseClients.forEach((client, clientId) => {
    if (now - client.lastUpdate >= updateInterval) {
      if (client.agentFilter) {
        sendAgentMetrics(clientId, client.agentFilter);
      } else {
        sendSystemMetrics(clientId);
        sendMetricsSummary(clientId);
      }
    }
  });

  // Clean up disconnected clients
  const staleClients = Array.from(sseClients.entries()).filter(
    ([_, client]) => now - client.lastUpdate > 30000 // 30 seconds
  );
  
  staleClients.forEach(([clientId, client]) => {
    try {
      client.response.end();
    } catch (e) {
      console.error(`Error sending metrics to client ${clientId}:`, e);
    }
    sseClients.delete(clientId);
  });
}

// Start periodic updates
const updateTimer = setInterval(broadcastUpdates, 1000); // Check every second

// Cleanup on module unload
process.on('SIGINT', () => {
  clearInterval(updateTimer);
  sseClients.forEach((client) => {
    try {
      client.response.end();
    } catch (e) {
      //console.error(`Error sending metrics to client ${clientId}:`, e);
    }
  });
  sseClients.clear();
});

export default router; 