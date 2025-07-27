//Metrics Endpoints: Handles agent performance metrics and system monitoring

import express from 'express';
import { 
  getAgentMetrics,
  getAllAgentMetrics,
  getSystemMetricsSnapshot,
  resetAgentMetrics,
  resetAllMetrics
} from '../utils/agent-metrics';
import { AGENT_GLYPHS } from '../types/glyphs';

const router = express.Router();

//Get system-wide metrics snapshot
router.get('/system', (req, res) => {
  try {
    const snapshot = getSystemMetricsSnapshot();
    
    res.json({
      success: true,
      data: snapshot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//Get metrics for specific agent by name (query parameter)
router.get('/agent', (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid agent name',
        message: 'Please provide agent name as query parameter: ?name=AgentName'
      });
    }

    const metrics = getAgentMetrics(name);
    
    if (!metrics) {
      return res.status(404).json({
        success: false,
        error: 'Agent metrics not found',
        message: `No metrics found for agent: ${name}`,
        availableAgents: Object.values(AGENT_GLYPHS).map(agent => agent.agentName)
      });
    }

    // Enrich with agent info from registry
    const agentInfo = Object.values(AGENT_GLYPHS).find(agent => agent.agentName === name);
    
    res.json({
      success: true,
      data: {
        ...metrics,
        agentInfo: agentInfo ? {
          agentId: agentInfo.agentId,
          glyph: agentInfo.glyph,
          role: agentInfo.role,
          description: agentInfo.description
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//Get metrics for all agents
router.get('/agents', (req, res) => {
  try {
    const allMetrics = getAllAgentMetrics();
    const enrichedMetrics: Record<string, any> = {};

    // Enrich each agent's metrics with registry info
    for (const [agentName, metrics] of Object.entries(allMetrics)) {
      const agentInfo = Object.values(AGENT_GLYPHS).find(agent => agent.agentName === agentName);
      
      enrichedMetrics[agentName] = {
        ...metrics,
        agentInfo: agentInfo ? {
          agentId: agentInfo.agentId,
          glyph: agentInfo.glyph,
          role: agentInfo.role,
          description: agentInfo.description
        } : null
      };
    }

    res.json({
      success: true,
      count: Object.keys(enrichedMetrics).length,
      data: enrichedMetrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch all agent metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//Get performance summary for all agents
router.get('/summary', (req, res) => {
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

    res.json({
      success: true,
      count: summary.length,
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics summary',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//Get performance comparison between agents
router.get('/comparison', (req, res) => {
  try {
    const allMetrics = getAllAgentMetrics();
    const agentNames = Object.keys(allMetrics);
    
    if (agentNames.length === 0) {
      return res.json({
        success: true,
        message: 'No metrics available for comparison',
        data: { comparison: [], insights: [] }
      });
    }

    // Calculate comparative metrics
    const comparison = agentNames.map(agentName => {
      const metrics = allMetrics[agentName];
      const agentInfo = Object.values(AGENT_GLYPHS).find(agent => agent.agentName === agentName);
      
      return {
        agentName,
        glyph: agentInfo?.glyph || '?',
        role: agentInfo?.role || 'unknown',
        successRate: metrics.successRate,
        avgProcessingTime: metrics.averageProcessingTime,
        productivity: metrics.signalsPerHour,
        reliability: 1 - (metrics.errorCount / Math.max(metrics.totalEvents + metrics.totalSignals, 1)),
        efficiency: metrics.totalSignals > 0 ? metrics.averageProcessingTime / metrics.totalSignals : 0
      };
    });

    // Generate insights
    const topPerformer = comparison.reduce((prev, current) => 
      current.successRate > prev.successRate ? current : prev
    );
    
    const mostProductive = comparison.reduce((prev, current) => 
      current.productivity > prev.productivity ? current : prev
    );
    
    const fastest = comparison.reduce((prev, current) => 
      current.avgProcessingTime < prev.avgProcessingTime ? current : prev
    );

    const insights = [
      `Top Success Rate: ${topPerformer.agentName} (${(topPerformer.successRate * 100).toFixed(1)}%)`,
      `Most Productive: ${mostProductive.agentName} (${mostProductive.productivity.toFixed(1)} signals/hour)`,
      `Fastest Processing: ${fastest.agentName} (${fastest.avgProcessingTime.toFixed(1)}ms avg)`
    ];

    res.json({
      success: true,
      data: {
        comparison,
        insights,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate metrics comparison',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//Reset metrics for specific agent
router.delete('/agent', (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid agent name',
        message: 'Please provide agent name as query parameter: ?name=AgentName'
      });
    }

    const existingMetrics = getAgentMetrics(name);
    if (!existingMetrics) {
      return res.status(404).json({
        success: false,
        error: 'Agent metrics not found',
        message: `No metrics found for agent: ${name}`
      });
    }

    resetAgentMetrics(name);
    
    res.json({
      success: true,
      message: `Metrics reset for agent: ${name}`,
      resetAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to reset agent metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

//Reset all metrics (admin operation)
router.delete('/system', (req, res) => {
  try {
    const { confirm } = req.query;
    
    if (confirm !== 'true') {
      return res.status(400).json({
        success: false,
        error: 'Confirmation required',
        message: 'Add ?confirm=true to reset all system metrics'
      });
    }

    resetAllMetrics();
    
    res.json({
      success: true,
      message: 'All system metrics have been reset',
      resetAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to reset system metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 