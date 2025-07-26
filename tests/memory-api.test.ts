//Memory API Tests: Testing REST endpoints for agent memory logs and state queries

import request from 'supertest';
import app from '../api/server';
import { 
  initializeAgentState,
  logSignalEmission,
  logEventProcessing 
} from '../utils/memory-logger';

describe('Memory API Endpoints', () => {
  beforeEach(() => {
    //Initialize test data using existing agent from registry
    initializeAgentState('agent-000', 'Theron');
    logSignalEmission('agent-000', 'archival', 'Ϸ', true, 25, 0.9);
    logEventProcessing('agent-000', 'anomaly', { anomalyType: 'test' }, 'triggered', 15);
  });

  describe('GET /agents/', () => {
    it('should return all agents overview', async () => {
      const response = await request(app)
        .get('/agents/')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
      expect(response.body.data).toBeInstanceOf(Array);
      
      const agent = response.body.data.find((a: any) => a.agentId === 'agent-000');
      expect(agent).toBeDefined();
      expect(agent.agentName).toBe('Theron');
      expect(agent.glyph).toBe('Ϸ');
    });
  });

  describe('GET /agents/:agentId', () => {
    it('should return specific agent state', async () => {
      const response = await request(app)
        .get('/agents/agent-000')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.agentId).toBe('agent-000');
      expect(response.body.agentName).toBe('Theron');
    });

    it('should return 404 for unknown agent', async () => {
      const response = await request(app)
        .get('/agents/unknown-agent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Agent not found');
    });
  });

  describe('GET /agents/memory/:agentId', () => {
    it('should return agent memory logs', async () => {
      const response = await request(app)
        .get('/agents/memory/agent-000')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.agentId).toBe('agent-000');
      expect(response.body.count).toBeGreaterThan(0);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should support query parameters', async () => {
      const response = await request(app)
        .get('/agents/memory/agent-000?type=signal_emitted&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.query.type).toBe('signal_emitted');
      expect(response.body.query.limit).toBe(5);
    });

    it('should return 404 for unknown agent', async () => {
      const response = await request(app)
        .get('/agents/memory/unknown-agent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Agent not found');
    });
  });

  describe('GET /agents/snapshot/:agentId', () => {
    it('should return agent memory snapshot', async () => {
      const response = await request(app)
        .get('/agents/snapshot/agent-000')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.agentId).toBe('agent-000');
      expect(response.body.hasMemoryData).toBe(true);
      expect(response.body.snapshot).toBeDefined();
      expect(response.body.snapshot.statistics).toBeDefined();
    });

    it('should return 404 for unknown agent', async () => {
      const response = await request(app)
        .get('/agents/snapshot/unknown-agent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Agent not found');
    });
  });

  describe('GET /agents/memory/stats', () => {
    it('should return memory statistics', async () => {
      const response = await request(app)
        .get('/agents/memory/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.registeredAgents).toBeGreaterThan(0);
      expect(response.body.data.agentDetails).toBeInstanceOf(Array);
    });
  });

  describe('GET /agents/memory/search', () => {
    it('should search memory entries across all agents', async () => {
      const response = await request(app)
        .get('/agents/memory/search?limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.query).toBeDefined();
      expect(response.body.totalEntries).toBeGreaterThanOrEqual(0);
    });

    it('should support type filtering', async () => {
      const response = await request(app)
        .get('/agents/memory/search?type=signal_emitted')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.query.type).toBe('signal_emitted');
    });
  });

  describe('GET /agents/activity/recent', () => {
    it('should return recent activity', async () => {
      const response = await request(app)
        .get('/agents/activity/recent?limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.limit).toBe(5);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid routes gracefully', async () => {
      const response = await request(app)
        .get('/agents/invalid/route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Endpoint not found');
    });
  });
}); 