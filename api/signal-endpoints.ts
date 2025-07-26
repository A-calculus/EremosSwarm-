//Signal Registry Endpoints: Handles signal types and glyph mappings

import express from 'express';
import { 
  getAllSignalTypes,
  getSignalMetadata,
  getAgentSignalTypes
} from '../agents';
import { AGENT_GLYPHS } from '../types/glyphs';

const router = express.Router();

//Get all signal types and their metadata
router.get('/registry', (req, res) => {
  try {
    const signalTypes = getAllSignalTypes();
    const registry = signalTypes.map(type => {
      const metadata = getSignalMetadata(type);
      return {
        type,
        ...metadata
      };
    });

    res.json({
      success: true,
      count: registry.length,
      data: registry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch signal registry',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//Get specific signal metadata by type
router.get('/registry/:type', (req, res) => {
  try {
    const { type } = req.params;
    const metadata = getSignalMetadata(type);

    if (!metadata) {
      return res.status(404).json({
        success: false,
        error: 'Signal type not found',
        message: `Signal type '${type}' is not registered`
      });
    }

    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch signal metadata',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//Get all agent glyphs and their mappings
router.get('/glyphs', (req, res) => {
  try {
    const glyphs = Object.values(AGENT_GLYPHS);
    
    res.json({
      success: true,
      count: glyphs.length,
      data: glyphs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch glyph mappings',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//Get specific agent glyph information
router.get('/glyphs/:agentId', (req, res) => {
  try {
    const { agentId } = req.params;
    const agentGlyph = AGENT_GLYPHS[agentId];

    if (!agentGlyph) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
        message: `Agent '${agentId}' is not registered`
      });
    }

    res.json({
      success: true,
      data: agentGlyph
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent glyph',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//Get signal types for a specific agent
router.get('/agent/:agentId', (req, res) => {
  try {
    const { agentId } = req.params;
    const signalTypes = getAgentSignalTypes(agentId);

    if (!AGENT_GLYPHS[agentId]) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found',
        message: `Agent '${agentId}' is not registered`
      });
    }

    const signalDetails = signalTypes.map(type => getSignalMetadata(type));

    res.json({
      success: true,
      agentId,
      agentName: AGENT_GLYPHS[agentId].agentName,
      count: signalTypes.length,
      data: signalDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent signals',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//Get signal registry statistics
router.get('/stats', (req, res) => {
  try {
    const signalTypes = getAllSignalTypes();
    const agents = Object.values(AGENT_GLYPHS);
    
    const categoryStats = signalTypes.reduce((acc, type) => {
      const metadata = getSignalMetadata(type);
      if (metadata) {
        acc[metadata.category] = (acc[metadata.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const priorityStats = signalTypes.reduce((acc, type) => {
      const metadata = getSignalMetadata(type);
      if (metadata) {
        acc[metadata.priority] = (acc[metadata.priority] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    res.json({
      success: true,
      data: {
        totalSignalTypes: signalTypes.length,
        totalAgents: agents.length,
        categoryBreakdown: categoryStats,
        priorityBreakdown: priorityStats,
        agents: agents.map(agent => ({
          id: agent.agentId,
          name: agent.agentName,
          glyph: agent.glyph,
          signalCount: getAgentSignalTypes(agent.agentId).length
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch registry statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 