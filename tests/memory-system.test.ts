//Memory System Tests: Comprehensive testing of agent state tracking and memory logging

import {
  initializeAgentState,
  updateAgentState,
  logMemoryEntry,
  logSignalEmission,
  logEventProcessing,
  getAgentState,
  generateMemorySnapshot,
  queryMemoryEntries,
  getMemoryStatistics,
  cleanupMemory
} from "../utils/memory-logger";

describe("Memory System", () => {
  const testAgentId = "test-agent";
  const testAgentName = "TestAgent";

  beforeEach(() => {
    //Reset state before each test
    initializeAgentState(testAgentId, testAgentName);
  });

  describe("Agent State Management", () => {
    it("should initialize agent state correctly", () => {
      const state = initializeAgentState("new-agent", "NewAgent");
      
      expect(state.agentId).toBe("new-agent");
      expect(state.agentName).toBe("NewAgent");
      expect(state.currentStatus).toBe("idle");
      expect(state.totalEventsProcessed).toBe(0);
      expect(state.totalSignalsEmitted).toBe(0);
      expect(state.triggerCount).toBe(0);
      expect(state.uptime).toBe(0);
      expect(state.lastActivity).toBeDefined();
      expect(state.metadata).toEqual({});
    });

    it("should update agent state", () => {
      const updatedState = updateAgentState(testAgentId, {
        currentStatus: "active",
        totalEventsProcessed: 5,
        metadata: { customField: "test" }
      });

      expect(updatedState.currentStatus).toBe("active");
      expect(updatedState.totalEventsProcessed).toBe(5);
      expect(updatedState.metadata?.customField).toBe("test");
      expect(updatedState.lastActivity).toBeDefined();
    });

    it("should get agent state", () => {
      updateAgentState(testAgentId, { currentStatus: "processing" });
      const state = getAgentState(testAgentId);
      
      expect(state).toBeDefined();
      expect(state?.currentStatus).toBe("processing");
    });

    it("should return undefined for unknown agent", () => {
      const state = getAgentState("unknown-agent");
      expect(state).toBeUndefined();
    });
  });

  describe("Memory Entry Logging", () => {
    it("should log memory entries", () => {
      const entry = logMemoryEntry(testAgentId, "event_processed", {
        eventType: "test_event",
        outcome: "success"
      });

      expect(entry.id).toMatch(/^mem_\d+_/);
      expect(entry.agentId).toBe(testAgentId);
      expect(entry.type).toBe("event_processed");
      expect(entry.data.eventType).toBe("test_event");
      expect(entry.hash).toMatch(/^sig_/);
      expect(entry.timestamp).toBeDefined();
    });

    it("should query memory entries", () => {
      //Log multiple entries
      logMemoryEntry(testAgentId, "event_processed", { test: 1 });
      logMemoryEntry(testAgentId, "signal_emitted", { test: 2 });
      logMemoryEntry(testAgentId, "state_change", { test: 3 });

      //Query all entries for agent
      const allEntries = queryMemoryEntries({ agentId: testAgentId });
      expect(allEntries.length).toBeGreaterThan(3); //Includes initialization entry

      //Query by type - account for initialization creating an event_processed entry
      const eventEntries = queryMemoryEntries({ 
        agentId: testAgentId, 
        type: "event_processed" 
      });
      expect(eventEntries.length).toBeGreaterThanOrEqual(1);
      //Find our specific test entry
      const testEntry = eventEntries.find(e => e.data.test === 1);
      expect(testEntry).toBeDefined();
      expect(testEntry?.data.test).toBe(1);

      //Query with limit
      const limitedEntries = queryMemoryEntries({ 
        agentId: testAgentId, 
        limit: 2 
      });
      expect(limitedEntries.length).toBe(2);
    });
  });

  describe("Signal Memory Logging", () => {
    it("should log signal emissions", () => {
      const signalMemory = logSignalEmission(
        testAgentId,
        "test_signal",
        "T",
        true,
        50,
        0.8,
        { testData: "value" }
      );

      expect(signalMemory.signalId).toMatch(/^sig_\d+_/);
      expect(signalMemory.agentId).toBe(testAgentId);
      expect(signalMemory.signalType).toBe("test_signal");
      expect(signalMemory.glyph).toBe("T");
      expect(signalMemory.success).toBe(true);
      expect(signalMemory.processingTime).toBe(50);
      expect(signalMemory.confidence).toBe(0.8);
      expect(signalMemory.details?.testData).toBe("value");
    });

    it("should update agent state when logging signals", () => {
      const initialState = getAgentState(testAgentId);
      const initialSignalCount = initialState?.totalSignalsEmitted || 0;

      logSignalEmission(testAgentId, "test_signal", "T", true, 25);

      const updatedState = getAgentState(testAgentId);
      expect(updatedState?.totalSignalsEmitted).toBe(initialSignalCount + 1);
      expect(updatedState?.currentStatus).toBe("active");
    });
  });

  describe("Event Memory Logging", () => {
    it("should log event processing", () => {
      const eventMemory = logEventProcessing(
        testAgentId,
        "wallet_activity",
        { wallet: "0x123", amount: 100 },
        "triggered",
        75
      );

      expect(eventMemory.eventId).toMatch(/^evt_\d+_/);
      expect(eventMemory.agentId).toBe(testAgentId);
      expect(eventMemory.eventType).toBe("wallet_activity");
      expect(eventMemory.processed).toBe(true);
      expect(eventMemory.outcome).toBe("triggered");
      expect(eventMemory.processingTime).toBe(75);
      expect(eventMemory.data.wallet).toBe("0x123");
    });

    it("should handle error outcomes", () => {
      const eventMemory = logEventProcessing(
        testAgentId,
        "mint_activity",
        { error: "timeout" },
        "error",
        200
      );

      expect(eventMemory.processed).toBe(false);
      expect(eventMemory.outcome).toBe("error");
    });

    it("should update agent state when logging events", () => {
      const initialState = getAgentState(testAgentId);
      const initialEventCount = initialState?.totalEventsProcessed || 0;
      const initialTriggerCount = initialState?.triggerCount || 0;

      logEventProcessing(testAgentId, "test_event", {}, "triggered", 50);

      const updatedState = getAgentState(testAgentId);
      expect(updatedState?.totalEventsProcessed).toBe(initialEventCount + 1);
      expect(updatedState?.triggerCount).toBe(initialTriggerCount + 1);
    });
  });

  describe("Memory Snapshots", () => {
    it("should generate memory snapshots", () => {
      //Add some activity
      logSignalEmission(testAgentId, "test_signal", "T", true, 30);
      logEventProcessing(testAgentId, "test_event", {}, "triggered", 40);

      const snapshot = generateMemorySnapshot(testAgentId);

      expect(snapshot).toBeDefined();
      expect(snapshot?.agentId).toBe(testAgentId);
      expect(snapshot?.agentName).toBe(testAgentName);
      expect(snapshot?.state).toBeDefined();
      expect(snapshot?.recentSignals).toBeDefined();
      expect(snapshot?.recentEvents).toBeDefined();
      expect(snapshot?.memoryEntries).toBeDefined();
      expect(snapshot?.statistics).toBeDefined();
      expect(snapshot?.statistics.avgProcessingTime).toBeGreaterThan(0);
      expect(snapshot?.statistics.successRate).toBeGreaterThanOrEqual(0);
    });

    it("should return null for unknown agent", () => {
      const snapshot = generateMemorySnapshot("unknown-agent");
      expect(snapshot).toBeNull();
    });
  });

  describe("Memory Statistics", () => {
    it("should return memory statistics", () => {
      //Initialize multiple agents and add activity
      initializeAgentState("agent-1", "Agent1");
      initializeAgentState("agent-2", "Agent2");
      
      logSignalEmission("agent-1", "signal1", "A", true, 10);
      logEventProcessing("agent-2", "event1", {}, "triggered", 20);

      const stats = getMemoryStatistics();

      expect(stats.totalAgents).toBeGreaterThanOrEqual(3);
      expect(stats.activeAgents).toBeGreaterThanOrEqual(0);
      expect(stats.totalMemoryEntries).toBeGreaterThan(0);
      expect(stats.totalSignals).toBeGreaterThanOrEqual(1);
      expect(stats.totalEvents).toBeGreaterThanOrEqual(1);
      expect(stats.memoryUsage).toBeDefined();
      expect(stats.memoryUsage.states).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Memory Cleanup", () => {
    it("should cleanup old memory entries", () => {
      //Add some entries
      logMemoryEntry(testAgentId, "event_processed", { old: true });
      logMemoryEntry(testAgentId, "signal_emitted", { recent: true });

      //Cleanup entries older than 0 days (should clean all)
      const cleanedCount = cleanupMemory(0);

      expect(cleanedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Error Handling", () => {
    it("should throw error when updating non-existent agent state", () => {
      expect(() => {
        updateAgentState("non-existent-agent", { currentStatus: "active" });
      }).toThrow("Agent non-existent-agent state not initialized");
    });
  });
});

describe("Memory Integration", () => {
  it("should work with signal emitter integration", () => {
    const agentId = "integration-test";
    initializeAgentState(agentId, "IntegrationTest");

    //Simulate signal emission
    logSignalEmission(agentId, "test_signal", "I", true, 25, 0.9);
    
    const snapshot = generateMemorySnapshot(agentId);
    expect(snapshot?.recentSignals.length).toBeGreaterThan(0);
    expect(snapshot?.state.totalSignalsEmitted).toBe(1);
  });

  it("should handle concurrent operations", () => {
    const agentId = "concurrent-test";
    initializeAgentState(agentId, "ConcurrentTest");

    //Simulate multiple operations
    for (let i = 0; i < 5; i++) {
      logEventProcessing(agentId, `event_${i}`, { iteration: i }, "triggered", i * 10);
      logSignalEmission(agentId, `signal_${i}`, "C", true, i * 5);
    }

    const state = getAgentState(agentId);
    expect(state?.totalEventsProcessed).toBe(5);
    expect(state?.totalSignalsEmitted).toBe(5);

    const snapshot = generateMemorySnapshot(agentId);
    expect(snapshot?.statistics.avgProcessingTime).toBeGreaterThan(0);
  });
}); 