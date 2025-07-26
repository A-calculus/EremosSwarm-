import { 
  SIGNAL_REGISTRY,
  validateSignal,
  createStandardSignal,
  getAgentSignalTypes,
  getSignalMetadata,
  getAllSignalTypes
} from "../agents";
import { emitSignal } from "../utils/signal-emitter";

describe("Signal Registry", () => {
  describe("SIGNAL_REGISTRY", () => {
    it("should contain all expected signal types", () => {
      const expectedSignalTypes = [
        'template_log',
        'archival',
        'launch_detected',
        'wallet_reactivated',
        'mint_spike_detected',
        'cluster_detected'
      ];
      
      expectedSignalTypes.forEach(type => {
        expect(SIGNAL_REGISTRY[type]).toBeDefined();
        expect(SIGNAL_REGISTRY[type].type).toBe(type);
      });
    });

    it("should have valid metadata for each signal", () => {
      Object.values(SIGNAL_REGISTRY).forEach(metadata => {
        expect(metadata.type).toBeTruthy();
        expect(metadata.agentId).toBeTruthy();
        expect(metadata.glyph).toBeTruthy();
        expect(metadata.description).toBeTruthy();
        expect(['low', 'medium', 'high', 'critical']).toContain(metadata.priority);
        expect(['detection', 'monitoring', 'alert', 'archival', 'template']).toContain(metadata.category);
        expect(metadata.schema).toBeDefined();
        expect(Array.isArray(metadata.schema.required)).toBe(true);
        expect(Array.isArray(metadata.schema.optional)).toBe(true);
      });
    });
  });

  describe("validateSignal", () => {
    it("should validate a correct signal", () => {
      const validSignal = {
        agent: "Example",
        type: "template_log",
        glyph: "x",
        hash: "sig_test123",
        timestamp: "2025-01-01T00:00:00.000Z"
      };

      const result = validateSignal(validSignal);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject signal with missing required fields", () => {
      const invalidSignal = {
        agent: "Example",
        type: "template_log"
        // Missing required fields: glyph, hash, timestamp
      };

      const result = validateSignal(invalidSignal);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('Missing required field'))).toBe(true);
    });

    it("should reject signal with wrong data types", () => {
      const invalidSignal = {
        agent: "LaunchTracker",
        type: "launch_detected",
        glyph: "L",
        hash: "sig_test123",
        timestamp: "2025-01-01T00:00:00.000Z",
        confidence: "high" // Should be number, not string
      };

      const result = validateSignal(invalidSignal);
      expect(result.valid).toBe(false);
      expect(result.errors.some(error => error.includes('should be number'))).toBe(true);
    });

    it("should reject unknown signal type", () => {
      const unknownSignal = {
        agent: "Unknown",
        type: "unknown_signal_type",
        glyph: "?",
        hash: "sig_test123",
        timestamp: "2025-01-01T00:00:00.000Z"
      };

      const result = validateSignal(unknownSignal);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Unknown signal type: unknown_signal_type");
    });
  });

  describe("createStandardSignal", () => {
    it("should create a valid standard signal", () => {
      const signal = createStandardSignal('template_log', 'agent-xxx', {
        details: { test: 'value' }
      });

      expect(signal.agent).toBe('Example');
      expect(signal.type).toBe('template_log');
      expect(signal.glyph).toBe('x');
      expect(signal.hash).toMatch(/^sig_\d+$/);
      expect(signal.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(signal.details).toEqual({ test: 'value' });
      expect(signal.metadata).toBeDefined();
      expect(signal.metadata?.priority).toBe('low');
      expect(signal.metadata?.category).toBe('template');
      expect(signal.metadata?.source).toBe('agent-xxx');
    });

    it("should throw error for unknown signal type", () => {
      expect(() => {
        createStandardSignal('unknown_type', 'agent-xxx', {});
      }).toThrow('Unknown signal type: unknown_type');
    });

    it("should handle confidence field correctly", () => {
      const signal = createStandardSignal('launch_detected', 'agent-launch', {
        confidence: 0.85
      });

      expect(signal.confidence).toBe(0.85);
      expect(signal.agent).toBe('LaunchTracker');
      expect(signal.glyph).toBe('L');
    });
  });

  describe("getAgentSignalTypes", () => {
    it("should return correct signal types for each agent", () => {
      expect(getAgentSignalTypes('agent-xxx')).toEqual(['template_log']);
      expect(getAgentSignalTypes('agent-000')).toEqual(['archival']);
      expect(getAgentSignalTypes('agent-launch')).toEqual(['launch_detected']);
      expect(getAgentSignalTypes('agent-022')).toEqual(['wallet_reactivated']);
      expect(getAgentSignalTypes('agent-harvester')).toEqual(['mint_spike_detected']);
      expect(getAgentSignalTypes('agent-observer')).toEqual(['cluster_detected']);
    });

    it("should return empty array for unknown agent", () => {
      expect(getAgentSignalTypes('unknown-agent')).toEqual([]);
    });
  });

  describe("getSignalMetadata", () => {
    it("should return correct metadata for signal types", () => {
      const metadata = getSignalMetadata('launch_detected');
      
      expect(metadata).toBeDefined();
      expect(metadata?.type).toBe('launch_detected');
      expect(metadata?.agentId).toBe('agent-launch');
      expect(metadata?.glyph).toBe('L');
      expect(metadata?.priority).toBe('high');
      expect(metadata?.category).toBe('detection');
    });

    it("should return undefined for unknown signal type", () => {
      expect(getSignalMetadata('unknown_type')).toBeUndefined();
    });
  });

  describe("getAllSignalTypes", () => {
    it("should return all registered signal types", () => {
      const types = getAllSignalTypes();
      
      expect(types).toContain('template_log');
      expect(types).toContain('archival');
      expect(types).toContain('launch_detected');
      expect(types).toContain('wallet_reactivated');
      expect(types).toContain('mint_spike_detected');
      expect(types).toContain('cluster_detected');
      expect(types.length).toBe(6);
    });
  });
});

describe("Signal Emitter", () => {
  it("should emit valid signals successfully", () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    const result = emitSignal('template_log', 'agent-xxx', {
      details: { test: 'emission' }
    });

    expect(result.success).toBe(true);
    expect(result.signal).toBeDefined();
    expect(result.errors).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it("should handle invalid signals gracefully", () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const result = emitSignal('unknown_type', 'agent-xxx', {});

    expect(result.success).toBe(false);
    expect(result.signal).toBeUndefined();
    expect(result.errors).toBeDefined();
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });
}); 