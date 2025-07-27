//Signal Streaming Endpoints: Real-time signal activity monitoring via Server-Sent Events (SSE)

import express from 'express';
import { 
  registerSignalStreamClient,
  unregisterSignalStreamClient,
  generateSignalStreamClientId,
  getRecentSignals,
  getSignalStreamStats,
  SignalStreamFilter
} from '../utils/signal-stream';
import { AGENT_GLYPHS } from '../types/glyphs';
import { getAllSignalTypes } from '../agents/signal-registry';

const router = express.Router();

// Real-time signal activity stream - all signals
router.get('/activity', (req, res) => {
  const clientId = generateSignalStreamClientId();
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Register client
  registerSignalStreamClient(clientId, res);

  // Send initial recent signals
  const recentSignals = getRecentSignals(undefined, 10);
  if (recentSignals.length > 0) {
    const data = {
      timestamp: new Date().toISOString(),
      type: 'signal_history',
      data: recentSignals
    };
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  // Handle client disconnect
  req.on('close', () => {
    unregisterSignalStreamClient(clientId);
    console.log(`Signal stream client ${clientId} disconnected from activity stream`);
  });

  console.log(`Signal stream client ${clientId} connected to activity stream`);
});

// Real-time signal stream for specific agent
router.get('/agent', (req, res) => {
  const { name, id } = req.query;
  const clientId = generateSignalStreamClientId();
  
  if (!name && !id) {
    res.status(400).json({
      success: false,
      error: 'Missing agent parameter',
      message: 'Please provide agent name (?name=AgentName) or agent ID (?id=agent-id)',
      availableAgents: Object.values(AGENT_GLYPHS).map(agent => ({
        name: agent.agentName,
        id: agent.agentId
      }))
    });
    return;
  }

  // Build filter based on provided parameters
  const filter: SignalStreamFilter = {};
  if (name && typeof name === 'string') {
    filter.agentName = name;
    
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
  }
  
  if (id && typeof id === 'string') {
    filter.agentId = id;
    
    // Validate agent ID exists
    const agentExists = Object.keys(AGENT_GLYPHS).includes(id);
    if (!agentExists) {
      res.status(404).json({
        success: false,
        error: 'Agent ID not found',
        message: `Agent ID '${id}' does not exist`,
        availableAgentIds: Object.keys(AGENT_GLYPHS)
      });
      return;
    }
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Register client with filter
  registerSignalStreamClient(clientId, res, filter);

  // Send recent signals for this agent
  const recentSignals = getRecentSignals(filter, 10);
  if (recentSignals.length > 0) {
    const data = {
      timestamp: new Date().toISOString(),
      type: 'signal_history',
      agentFilter: filter,
      data: recentSignals
    };
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  // Handle client disconnect
  req.on('close', () => {
    unregisterSignalStreamClient(clientId);
    console.log(`Signal stream client ${clientId} disconnected from agent stream`);
  });

  console.log(`Signal stream client ${clientId} connected to agent stream with filter:`, filter);
});

// Real-time signal stream for specific signal type
router.get('/type/:signalType', (req, res) => {
  const { signalType } = req.params;
  const clientId = generateSignalStreamClientId();
  
  // Validate signal type exists
  const allSignalTypes = getAllSignalTypes();
  if (!allSignalTypes.includes(signalType)) {
    res.status(404).json({
      success: false,
      error: 'Signal type not found',
      message: `Signal type '${signalType}' does not exist`,
      availableSignalTypes: allSignalTypes
    });
    return;
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Register client with signal type filter
  const filter: SignalStreamFilter = { signalType };
  registerSignalStreamClient(clientId, res, filter);

  // Send recent signals of this type
  const recentSignals = getRecentSignals(filter, 10);
  if (recentSignals.length > 0) {
    const data = {
      timestamp: new Date().toISOString(),
      type: 'signal_history',
      signalTypeFilter: signalType,
      data: recentSignals
    };
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  // Handle client disconnect
  req.on('close', () => {
    unregisterSignalStreamClient(clientId);
    console.log(`Signal stream client ${clientId} disconnected from ${signalType} stream`);
  });

  console.log(`Signal stream client ${clientId} connected to ${signalType} signal stream`);
});

// Advanced filtered signal stream
router.get('/filtered', (req, res) => {
  const { 
    agentName, 
    agentId, 
    signalType, 
    category, 
    priority, 
    minConfidence 
  } = req.query;
  const clientId = generateSignalStreamClientId();

  // Build filter from query parameters
  const filter: SignalStreamFilter = {};
  
  if (agentName && typeof agentName === 'string') {
    filter.agentName = agentName;
  }
  
  if (agentId && typeof agentId === 'string') {
    filter.agentId = agentId;
  }
  
  if (signalType && typeof signalType === 'string') {
    filter.signalType = signalType;
  }
  
  if (category && typeof category === 'string') {
    filter.category = category;
  }
  
  if (priority && typeof priority === 'string') {
    filter.priority = priority;
  }
  
  if (minConfidence && typeof minConfidence === 'string') {
    const confidence = parseFloat(minConfidence);
    if (!isNaN(confidence) && confidence >= 0 && confidence <= 1) {
      filter.minConfidence = confidence;
    }
  }

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Register client with custom filter
  registerSignalStreamClient(clientId, res, filter);

  // Send recent filtered signals
  const recentSignals = getRecentSignals(filter, 10);
  const data = {
    timestamp: new Date().toISOString(),
    type: 'signal_history',
    filter,
    data: recentSignals
  };
  res.write(`data: ${JSON.stringify(data)}\n\n`);

  // Handle client disconnect
  req.on('close', () => {
    unregisterSignalStreamClient(clientId);
    console.log(`Signal stream client ${clientId} disconnected from filtered stream`);
  });

  console.log(`Signal stream client ${clientId} connected to filtered stream:`, filter);
});

// Get signal stream statistics (non-streaming endpoint)
router.get('/stats', (req, res) => {
  try {
    const stats = getSignalStreamStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get signal stream statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get recent signals (non-streaming endpoint for testing)
router.get('/recent', (req, res) => {
  try {
    const { limit, agentName, signalType } = req.query;
    
    const filter: SignalStreamFilter = {};
    if (agentName && typeof agentName === 'string') {
      filter.agentName = agentName;
    }
    if (signalType && typeof signalType === 'string') {
      filter.signalType = signalType;
    }
    
    const limitNum = limit && typeof limit === 'string' ? parseInt(limit) : 50;
    const signals = getRecentSignals(filter, limitNum);
    
    res.json({
      success: true,
      count: signals.length,
      filter,
      data: signals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get recent signals',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 