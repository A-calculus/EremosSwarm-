//Memory Endpoints: Handles agent memory logs and state queries

import express from 'express';
import { 
  getAgentState,
  generateMemorySnapshot,
  queryMemoryEntries,
  getMemoryStatistics
} from '../utils/memory-logger';
import { AGENT_GLYPHS } from '../types/glyphs';

const router = express.Router();

//Get memory statistics across all agents (MUST be before /:agentId)
router.get('/memory/stats', (req, res) => {
  try {
    const stats = getMemoryStatistics();
    const agents = Object.values(AGENT_GLYPHS);
    
    //Add agent details to statistics
    const agentDetails = agents.map(agent => {
      const state = getAgentState(agent.agentId);
      return {
        agentId: agent.agentId,
        agentName: agent.agentName,
        glyph: agent.glyph,
        role: agent.role,
        currentStatus: state?.currentStatus || 'no-data',
        totalEvents: state?.totalEventsProcessed || 0,
        totalSignals: state?.totalSignalsEmitted || 0,
        lastActivity: state?.lastActivity || null
      };
    });

    res.json({
      success: true,
      data: {
        ...stats,
        registeredAgents: agents.length,
        agentDetails
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch memory statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//Search memory entries across all agents (MUST be before /:agentId)
router.get('/memory/search', (req, res) => {
  try {
    const { 
      type, 
      startTime, 
      endTime, 
      limit = '100', 
      offset = '0' 
    } = req.query;

    //Query memory entries across all agents
    const memoryEntries = queryMemoryEntries({
      type: type as string,
      startTime: startTime as string,
      endTime: endTime as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    //Group by agent for better organization
    const entriesByAgent = memoryEntries.reduce((acc, entry) => {
      if (!acc[entry.agentId]) {
        const agentInfo = AGENT_GLYPHS[entry.agentId];
        acc[entry.agentId] = {
          agentId: entry.agentId,
          agentName: agentInfo?.agentName || 'Unknown',
          glyph: agentInfo?.glyph || '?',
          entries: []
        };
      }
      acc[entry.agentId].entries.push(entry);
      return acc;
    }, {} as Record<string, any>);

    res.json({
      success: true,
      query: {
        type: type || 'all',
        startTime: startTime || 'beginning',
        endTime: endTime || 'now',
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      },
      totalEntries: memoryEntries.length,
      agentsWithData: Object.keys(entriesByAgent).length,
      hasMoreData: memoryEntries.length === parseInt(limit as string),
      data: entriesByAgent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to search memory entries',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//Get recent activity across all agents (MUST be before /:agentId)
router.get('/activity/recent', (req, res) => {
  try {
    const { limit = '20' } = req.query;

    //Get recent memory entries
    const recentEntries = queryMemoryEntries({
      limit: parseInt(limit as string)
    });

    //Enrich with agent information
    const enrichedEntries = recentEntries.map(entry => {
      const agentInfo = AGENT_GLYPHS[entry.agentId];
      return {
        ...entry,
        agentName: agentInfo?.agentName || 'Unknown',
        glyph: agentInfo?.glyph || '?',
        role: agentInfo?.role || 'unknown'
      };
    });

    res.json({
      success: true,
      limit: parseInt(limit as string),
      count: enrichedEntries.length,
      data: enrichedEntries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent activity',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//Get agent memory logs and entries
router.get('/memory/:agentId', (req, res) => {
  try {
    const { agentId } = req.params;
    const { 
      type, 
      startTime, 
      endTime, 
      limit = '50', 
      offset = '0' 
    } = req.query;

    //Check if agent exists in registry
    if (!AGENT_GLYPHS[agentId]) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
        message: `Agent '${agentId}' is not registered`
      });
    }

    //Query memory entries
    const memoryEntries = queryMemoryEntries({
      agentId,
      type: type as string,
      startTime: startTime as string,
      endTime: endTime as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    //Get agent info
    const agentInfo = AGENT_GLYPHS[agentId];
    const state = getAgentState(agentId);

    res.json({
      success: true,
      agentId,
      agentName: agentInfo.agentName,
      glyph: agentInfo.glyph,
      query: {
        type: type || 'all',
        startTime: startTime || 'beginning',
        endTime: endTime || 'now',
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      },
      count: memoryEntries.length,
      hasMoreData: memoryEntries.length === parseInt(limit as string),
      currentState: state,
      data: memoryEntries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent memory logs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//Get comprehensive agent memory snapshot
router.get('/snapshot/:agentId', (req, res) => {
  try {
    const { agentId } = req.params;

    //Check if agent exists in registry
    if (!AGENT_GLYPHS[agentId]) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
        message: `Agent '${agentId}' is not registered`
      });
    }

    const snapshot = generateMemorySnapshot(agentId);
    const agentInfo = AGENT_GLYPHS[agentId];

    if (!snapshot) {
      return res.json({
        success: true,
        agentId,
        agentName: agentInfo.agentName,
        hasMemoryData: false,
        message: 'Agent exists but has no memory data yet'
      });
    }

    res.json({
      success: true,
      agentId,
      agentName: agentInfo.agentName,
      glyph: agentInfo.glyph,
      role: agentInfo.role,
      hasMemoryData: true,
      snapshot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate memory snapshot',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//Get all agent states and basic info
router.get('/', (req, res) => {
  try {
    const agents = Object.values(AGENT_GLYPHS);
    const agentStates = agents.map(agent => {
      const state = getAgentState(agent.agentId);
      return {
        agentId: agent.agentId,
        agentName: agent.agentName,
        glyph: agent.glyph,
        role: agent.role,
        state: state || null,
        hasMemoryData: !!state
      };
    });

    res.json({
      success: true,
      count: agentStates.length,
      data: agentStates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent states',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//Get specific agent state (MUST be last due to :agentId param)
router.get('/:agentId', (req, res) => {
  try {
    const { agentId } = req.params;
    
    //Check if agent exists in registry
    if (!AGENT_GLYPHS[agentId]) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
        message: `Agent '${agentId}' is not registered`
      });
    }

    const state = getAgentState(agentId);
    const agentInfo = AGENT_GLYPHS[agentId];

    if (!state) {
      return res.json({
        success: true,
        agentId,
        agentName: agentInfo.agentName,
        hasMemoryData: false,
        message: 'Agent exists but has no memory data yet'
      });
    }

    res.json({
      success: true,
      agentId,
      agentName: agentInfo.agentName,
      glyph: agentInfo.glyph,
      role: agentInfo.role,
      hasMemoryData: true,
      state
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent state',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 