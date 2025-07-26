//Enhanced Observer Agent: Surveillance with comprehensive memory tracking

import { Agent } from "../types/agent";
import { emitSignal } from "../utils/signal-emitter";
import { 
  initializeAgentState, 
  updateAgentState, 
  logEventProcessing,
  generateMemorySnapshot 
} from "../utils/memory-logger";

export const ObserverEnhanced: Agent = {
  id: "agent-observer",
  name: "Observer",
  role: "surveillance",
  watchType: "wallet_activity",
  glyph: "φ",
  triggerThreshold: 3,
  lastSignal: null,
  originTimestamp: new Date().toISOString(),

  description: "Enhanced surveillance agent. Logs unusual wallet clustering with detailed memory tracking.",

  observe: (event) => {
    const startTime = Date.now();
    
    //Initialize state on first use
    initializeAgentState("agent-observer", "Observer");
    
    //Update status to processing
    updateAgentState("agent-observer", { currentStatus: 'processing' });
    
    if (event?.type === "wallet_activity" && event.cluster?.length > 3) {
      try {
        //Emit cluster detection signal
        const result = emitSignal('cluster_detected', 'agent-observer', {
          details: { 
            clusterSize: event.cluster.length,
            wallets: event.cluster,
            suspiciousActivity: event.suspiciousActivity || false,
            riskScore: event.riskScore || 0.5,
            timeWindow: event.timeWindow || '1h'
          }
        });
        
        const processingTime = Date.now() - startTime;
        
        //Log event processing
        logEventProcessing(
          "agent-observer",
          "wallet_activity",
          event,
          result.success ? 'triggered' : 'error',
          processingTime
        );
        
        //Update agent metadata with surveillance stats
        const currentState = updateAgentState("agent-observer", {});
        updateAgentState("agent-observer", {
          currentStatus: 'active',
          metadata: {
            lastClusterSize: event.cluster.length,
            lastRiskScore: event.riskScore,
            lastProcessingTime: processingTime,
            clustersDetected: (currentState.metadata?.clustersDetected || 0) + 1,
            avgClusterSize: Math.round(
              ((currentState.metadata?.avgClusterSize || 3) + event.cluster.length) / 2
            )
          }
        });
        
      } catch (error) {
        const processingTime = Date.now() - startTime;
        
        logEventProcessing(
          "agent-observer",
          "wallet_activity",
          event,
          'error',
          processingTime
        );
        
        updateAgentState("agent-observer", { currentStatus: 'error' });
        console.error(`Observer cluster detection error:`, error);
      }
    } else {
      //Log all wallet activity events for surveillance history
      const processingTime = Date.now() - startTime;
      const outcome = event?.type === "wallet_activity" ? 'ignored' : 'ignored';
      
      logEventProcessing(
        "agent-observer",
        event?.type || 'unknown',
        event,
        outcome,
        processingTime
      );
      
      updateAgentState("agent-observer", { currentStatus: 'idle' });
    }
  },

  getMemory: () => {
    //Get comprehensive memory snapshot
    const snapshot = generateMemorySnapshot("agent-observer");
    
    if (snapshot) {
      const metadata = snapshot.state.metadata || {};
      
      return [
        `surveillance_status: ${snapshot.state.currentStatus}`,
        `clusters_detected: ${metadata.clustersDetected || 0}`,
        `events_monitored: ${snapshot.state.totalEventsProcessed}`,
        `signals_emitted: ${snapshot.state.totalSignalsEmitted}`,
        `avg_cluster_size: ${metadata.avgClusterSize || 'N/A'}`,
        `last_risk_score: ${metadata.lastRiskScore || 'N/A'}`,
        `success_rate: ${snapshot.statistics.successRate * 100}%`,
        `today_events: ${snapshot.statistics.eventsToday}`,
        ...snapshot.recentEvents.slice(-3).map(e => 
          `recent_event: ${e.eventType} [${e.outcome}] ${e.timestamp.slice(11, 19)}`
        )
      ];
    }
    
    return [
      "surveillance_active",
      "cluster_patterns_tracked",
      "anomaly_threshold_3+"
    ];
  },
}; 