//Enhanced Theron Agent: Integrates with memory logging system for comprehensive tracking

import { Agent } from "../types/agent";
import { emitSignal } from "../utils/signal-emitter";
import { 
  initializeAgentState, 
  updateAgentState, 
  logEventProcessing,
  generateMemorySnapshot 
} from "../utils/memory-logger";

export const TheronEnhanced: Agent = {
  id: "agent-000",
  name: "Theron",
  role: "memory_vault",
  watchType: "anomaly_detection",
  glyph: "Ϸ",
  triggerThreshold: Infinity,
  lastSignal: "ancient",
  originTimestamp: "2023-01-01T00:00:00.000Z",

  description:
    "Enhanced memory vault. Archives anomalies with comprehensive state tracking and historical logging.",

  observe: (event) => {
    const startTime = Date.now();
    
    //Initialize state on first use
    initializeAgentState("agent-000", "Theron");
    
    //Update status to processing
    updateAgentState("agent-000", { currentStatus: 'processing' });
    
    if (event?.type === "anomaly") {
      try {
        //Emit signal with memory tracking
        const result = emitSignal('archival', 'agent-000', {
          details: { 
            anomalyType: event.anomalyType || 'unknown',
            severity: event.severity || 'medium',
            source: event.source || 'unknown',
            patterns: event.patterns || []
          }
        });
        
        const processingTime = Date.now() - startTime;
        
        //Log event processing
        logEventProcessing(
          "agent-000",
          "anomaly",
          event,
          result.success ? 'triggered' : 'error',
          processingTime
        );
        
        //Update agent metadata
        updateAgentState("agent-000", {
          currentStatus: 'active',
          metadata: {
            lastAnomalyType: event.anomalyType,
            lastProcessingTime: processingTime,
            archivalCount: (updateAgentState("agent-000", {}).metadata?.archivalCount || 0) + 1
          }
        });
        
      } catch (error) {
        const processingTime = Date.now() - startTime;
        
        logEventProcessing(
          "agent-000",
          "anomaly",
          event,
          'error',
          processingTime
        );
        
        updateAgentState("agent-000", { currentStatus: 'error' });
        console.error(`Theron archival error:`, error);
      }
    } else {
      //Log ignored events
      const processingTime = Date.now() - startTime;
      logEventProcessing(
        "agent-000",
        event?.type || 'unknown',
        event,
        'ignored',
        processingTime
      );
      
      updateAgentState("agent-000", { currentStatus: 'idle' });
    }
  },

  getMemory: () => {
    //Get comprehensive memory snapshot
    const snapshot = generateMemorySnapshot("agent-000");
    
    if (snapshot) {
      return [
        `memory_fragments: ${snapshot.memoryEntries.length}`,
        `signals_archived: ${snapshot.state.totalSignalsEmitted}`,
        `events_processed: ${snapshot.state.totalEventsProcessed}`,
        `current_status: ${snapshot.state.currentStatus}`,
        `success_rate: ${snapshot.statistics.successRate * 100}%`,
        `avg_processing: ${snapshot.statistics.avgProcessingTime}ms`,
        ...snapshot.recentSignals.slice(-3).map(s => 
          `recent_signal: ${s.signalType} [${s.timestamp.slice(11, 19)}]`
        )
      ];
    }
    
    return [
      "fragment_03c9",
      "fragment_12b7", 
      "signal_α-vii",
      "ripple.undeclared"
    ];
  },
}; 