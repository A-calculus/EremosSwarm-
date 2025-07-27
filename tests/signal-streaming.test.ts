//Signal Streaming Tests: Unit tests for real-time signal streaming functionality

import {
  emitSignalToStream,
  getRecentSignals,
  getSignalStreamStats,
  registerSignalStreamClient,
  unregisterSignalStreamClient,
  generateSignalStreamClientId,
  resetSignalStream,
  SignalStreamFilter,
  StreamedSignal
} from '../utils/signal-stream';

// Mock Express Response for testing
class MockResponse {
  public data: string[] = [];
  public ended = false;

  write(data: string): void {
    this.data.push(data);
  }

  end(): void {
    this.ended = true;
  }
}

describe('Signal Streaming', () => {
  beforeEach(() => {
    // Reset signal stream state before each test
    resetSignalStream();
  });

  describe('Signal Emission', () => {
    it('should emit signal to stream successfully', () => {
      const signal = {
        agent: 'Test Agent',
        type: 'test_signal',
        glyph: 'T',
        hash: 'test_hash_123',
        timestamp: new Date().toISOString(),
        confidence: 0.95,
        details: { test: 'data' },
        metadata: {
          priority: 'high',
          category: 'detection',
          source: 'test-agent'
        }
      };

      const streamedSignal = emitSignalToStream(signal);

      expect(streamedSignal).toBeDefined();
      expect(streamedSignal.id).toMatch(/^stream_\d+_/);
      expect(streamedSignal.agent).toBe('Test Agent');
      expect(streamedSignal.type).toBe('test_signal');
      expect(streamedSignal.confidence).toBe(0.95);
    });

    it('should add signal to recent signals buffer', () => {
      const signal = {
        agent: 'Test Agent',
        type: 'test_signal',
        glyph: 'T',
        hash: 'test_hash_456',
        timestamp: new Date().toISOString()
      };

      emitSignalToStream(signal);

      const recentSignals = getRecentSignals();
      expect(recentSignals).toHaveLength(1);
      expect(recentSignals[0].agent).toBe('Test Agent');
      expect(recentSignals[0].hash).toBe('test_hash_456');
    });
  });

  describe('Client Management', () => {
    it('should register stream client successfully', () => {
      const clientId = generateSignalStreamClientId();
      const mockResponse = new MockResponse();

      expect(clientId).toMatch(/^signal_client_\d+_/);

      registerSignalStreamClient(clientId, mockResponse);

      const stats = getSignalStreamStats();
      expect(stats.activeClients).toBe(1);
    });

    it('should unregister stream client successfully', () => {
      const clientId = generateSignalStreamClientId();
      const mockResponse = new MockResponse();

      registerSignalStreamClient(clientId, mockResponse);
      
      const statsBeforeUnregister = getSignalStreamStats();
      expect(statsBeforeUnregister.activeClients).toBe(1);

      unregisterSignalStreamClient(clientId);

      const statsAfterUnregister = getSignalStreamStats();
      expect(statsAfterUnregister.activeClients).toBe(0);
      expect(mockResponse.ended).toBe(true);
    });

    it('should broadcast signal to registered clients', () => {
      const clientId = generateSignalStreamClientId();
      const mockResponse = new MockResponse();

      registerSignalStreamClient(clientId, mockResponse);

      const signal = {
        agent: 'Broadcast Test Agent',
        type: 'broadcast_test',
        glyph: 'B',
        hash: 'broadcast_hash',
        timestamp: new Date().toISOString(),
        confidence: 0.8
      };

      emitSignalToStream(signal);

      expect(mockResponse.data).toHaveLength(1);
      
      const sentData = JSON.parse(mockResponse.data[0].replace('data: ', '').trim());
      expect(sentData.type).toBe('signal_emission');
      expect(sentData.data.agent).toBe('Broadcast Test Agent');
      expect(sentData.data.type).toBe('broadcast_test');

      unregisterSignalStreamClient(clientId);
    });
  });

  describe('Signal Filtering', () => {
    beforeEach(() => {
      // Emit some test signals for filtering tests
      emitSignalToStream({
        agent: 'Liquidity Agent',
        type: 'liquidity_spike_detected',
        glyph: '§',
        hash: 'liquidity_1',
        timestamp: new Date().toISOString(),
        confidence: 0.95,
        metadata: {
          priority: 'high',
          category: 'detection',
          source: 'agent-liquidity'
        }
      });

      emitSignalToStream({
        agent: 'Scam Sentinel',
        type: 'rug_pull_detected',
        glyph: '¤',
        hash: 'scam_1',
        timestamp: new Date().toISOString(),
        confidence: 0.85,
        metadata: {
          priority: 'critical',
          category: 'detection',
          source: 'agent-scam-sentinel'
        }
      });

      emitSignalToStream({
        agent: 'Fee Analyzer',
        type: 'fee_spike_detected',
        glyph: '¢',
        hash: 'fee_1',
        timestamp: new Date().toISOString(),
        confidence: 0.7,
        metadata: {
          priority: 'medium',
          category: 'optimization',
          source: 'agent-fee-analyzer'
        }
      });
    });

    it('should filter signals by agent name', () => {
      const filter: SignalStreamFilter = { agentName: 'Liquidity Agent' };
      const filteredSignals = getRecentSignals(filter);

      expect(filteredSignals).toHaveLength(1);
      expect(filteredSignals[0].agent).toBe('Liquidity Agent');
      expect(filteredSignals[0].type).toBe('liquidity_spike_detected');
    });

    it('should filter signals by agent ID', () => {
      const filter: SignalStreamFilter = { agentId: 'agent-scam-sentinel' };
      const filteredSignals = getRecentSignals(filter);

      expect(filteredSignals).toHaveLength(1);
      expect(filteredSignals[0].agent).toBe('Scam Sentinel');
      expect(filteredSignals[0].metadata?.source).toBe('agent-scam-sentinel');
    });

    it('should filter signals by signal type', () => {
      const filter: SignalStreamFilter = { signalType: 'rug_pull_detected' };
      const filteredSignals = getRecentSignals(filter);

      expect(filteredSignals).toHaveLength(1);
      expect(filteredSignals[0].type).toBe('rug_pull_detected');
      expect(filteredSignals[0].agent).toBe('Scam Sentinel');
    });

    it('should filter signals by category', () => {
      const filter: SignalStreamFilter = { category: 'detection' };
      const filteredSignals = getRecentSignals(filter);

      expect(filteredSignals).toHaveLength(2);
      filteredSignals.forEach(signal => {
        expect(signal.metadata?.category).toBe('detection');
      });
    });

    it('should filter signals by priority', () => {
      const filter: SignalStreamFilter = { priority: 'critical' };
      const filteredSignals = getRecentSignals(filter);

      expect(filteredSignals).toHaveLength(1);
      expect(filteredSignals[0].metadata?.priority).toBe('critical');
      expect(filteredSignals[0].agent).toBe('Scam Sentinel');
    });

    it('should filter signals by minimum confidence', () => {
      const filter: SignalStreamFilter = { minConfidence: 0.9 };
      const filteredSignals = getRecentSignals(filter);

      expect(filteredSignals).toHaveLength(1);
      expect(filteredSignals[0].confidence).toBeGreaterThanOrEqual(0.9);
      expect(filteredSignals[0].agent).toBe('Liquidity Agent');
    });

    it('should apply multiple filters simultaneously', () => {
      const filter: SignalStreamFilter = {
        category: 'detection',
        minConfidence: 0.9
      };
      const filteredSignals = getRecentSignals(filter);

      expect(filteredSignals).toHaveLength(1);
      expect(filteredSignals[0].agent).toBe('Liquidity Agent');
      expect(filteredSignals[0].metadata?.category).toBe('detection');
      expect(filteredSignals[0].confidence).toBeGreaterThanOrEqual(0.9);
    });

    it('should limit the number of returned signals', () => {
      const allSignals = getRecentSignals();
      expect(allSignals).toHaveLength(3);

      const limitedSignals = getRecentSignals(undefined, 2);
      expect(limitedSignals).toHaveLength(2);
    });
  });

  describe('Statistics', () => {
    it('should return signal stream statistics', () => {
      const stats = getSignalStreamStats();

      expect(stats).toHaveProperty('totalSignalsEmitted');
      expect(stats).toHaveProperty('recentSignalsCount');
      expect(stats).toHaveProperty('activeClients');
      expect(stats).toHaveProperty('clientStats');

      expect(typeof stats.totalSignalsEmitted).toBe('number');
      expect(typeof stats.recentSignalsCount).toBe('number');
      expect(typeof stats.activeClients).toBe('number');
      expect(Array.isArray(stats.clientStats)).toBe(true);
    });

    it('should track client statistics correctly', () => {
      const clientId = generateSignalStreamClientId();
      const mockResponse = new MockResponse();

      registerSignalStreamClient(clientId, mockResponse);

      const stats = getSignalStreamStats();
      expect(stats.activeClients).toBe(1);
      
      const clientStats = stats.clientStats.find(client => client.clientId === clientId);
      expect(clientStats).toBeDefined();
      expect(clientStats?.signalCount).toBe(0);

      unregisterSignalStreamClient(clientId);
    });
  });

  describe('Error Handling', () => {
    it('should handle unregistering non-existent client gracefully', () => {
      const nonExistentClientId = 'non_existent_client';
      
      expect(() => {
        unregisterSignalStreamClient(nonExistentClientId);
      }).not.toThrow();
    });

    it('should handle signal emission with missing optional fields', () => {
      const minimalSignal = {
        agent: 'Minimal Agent',
        type: 'minimal_signal',
        glyph: 'M',
        hash: 'minimal_hash',
        timestamp: new Date().toISOString()
      };

      expect(() => {
        const streamedSignal = emitSignalToStream(minimalSignal);
        expect(streamedSignal).toBeDefined();
        expect(streamedSignal.confidence).toBeUndefined();
        expect(streamedSignal.details).toBeUndefined();
        expect(streamedSignal.metadata).toBeUndefined();
      }).not.toThrow();
    });
  });
}); 