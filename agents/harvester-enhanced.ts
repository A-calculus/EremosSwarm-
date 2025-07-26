//Enhanced Harvester Agent: Indexing with comprehensive memory and performance tracking

import { Agent } from "../types/agent";
import { emitSignal } from "../utils/signal-emitter";
import { 
  initializeAgentState, 
  updateAgentState, 
  logEventProcessing,
  generateMemorySnapshot 
} from "../utils/memory-logger";

export const HarvesterEnhanced: Agent = {
  id: "agent-harvester",
  name: "Harvester",
  role: "indexing",
  watchType: "mint_activity",
  glyph: "λ",
  triggerThreshold: 2,
  lastSignal: null,
  originTimestamp: new Date().toISOString(),

  description: "Enhanced indexing agent. Tracks mint data with detailed performance metrics and memory logging.",

  observe: (event) => {
    const startTime = Date.now();
    
    //Initialize state on first use
    initializeAgentState("agent-harvester", "Harvester");
    
    //Update status to processing
    updateAgentState("agent-harvester", { currentStatus: 'processing' });
    
    if (event?.type === "mint_activity" && event.amount > 10) {
      try {
        //Emit mint spike detection signal
        const result = emitSignal('mint_spike_detected', 'agent-harvester', {
          details: { 
            mintCount: event.amount,
            collection: event.collection || 'unknown',
            priceFloor: event.priceFloor || 0,
            volume24h: event.volume24h || 0,
            uniqueMintersCount: event.uniqueMintersCount || 0,
            timeframe: event.timeframe || '1h'
          }
        });
        
        const processingTime = Date.now() - startTime;
        
        //Log event processing
        logEventProcessing(
          "agent-harvester",
          "mint_activity",
          event,
          result.success ? 'triggered' : 'error',
          processingTime
        );
        
        //Update agent metadata with indexing stats
        const currentState = updateAgentState("agent-harvester", {});
        const metadata = currentState.metadata || {};
        
        updateAgentState("agent-harvester", {
          currentStatus: 'active',
          metadata: {
            lastMintCount: event.amount,
            lastCollection: event.collection,
            lastProcessingTime: processingTime,
            totalMintsIndexed: (metadata.totalMintsIndexed || 0) + event.amount,
            spikesDetected: (metadata.spikesDetected || 0) + 1,
            avgMintSize: Math.round(
              ((metadata.avgMintSize || 10) + event.amount) / 2
            ),
            collectionsTracked: new Set([
              ...(metadata.collectionsTracked || []),
              event.collection
            ]).size
          }
        });
        
      } catch (error) {
        const processingTime = Date.now() - startTime;
        
        logEventProcessing(
          "agent-harvester",
          "mint_activity",
          event,
          'error',
          processingTime
        );
        
        updateAgentState("agent-harvester", { currentStatus: 'error' });
        console.error(`Harvester indexing error:`, error);
      }
    } else {
      //Log all mint activity for indexing history
      const processingTime = Date.now() - startTime;
      const outcome = event?.type === "mint_activity" ? 'ignored' : 'ignored';
      
      logEventProcessing(
        "agent-harvester",
        event?.type || 'unknown',
        event,
        outcome,
        processingTime
      );
      
      //Update indexing stats even for ignored events
      if (event?.type === "mint_activity") {
        const currentState = updateAgentState("agent-harvester", {});
        const metadata = currentState.metadata || {};
        
        updateAgentState("agent-harvester", {
          currentStatus: 'idle',
          metadata: {
            ...metadata,
            totalMintsIndexed: (metadata.totalMintsIndexed || 0) + (event.amount || 0),
            lastSmallMint: event.amount || 0
          }
        });
      }
    }
  },

  getMemory: () => {
    //Get comprehensive memory snapshot
    const snapshot = generateMemorySnapshot("agent-harvester");
    
    if (snapshot) {
      const metadata = snapshot.state.metadata || {};
      
      return [
        `indexing_status: ${snapshot.state.currentStatus}`,
        `total_mints_indexed: ${metadata.totalMintsIndexed || 0}`,
        `spikes_detected: ${metadata.spikesDetected || 0}`,
        `collections_tracked: ${metadata.collectionsTracked || 0}`,
        `avg_mint_size: ${metadata.avgMintSize || 'N/A'}`,
        `last_collection: ${metadata.lastCollection || 'N/A'}`,
        `events_processed: ${snapshot.state.totalEventsProcessed}`,
        `signals_emitted: ${snapshot.state.totalSignalsEmitted}`,
        `success_rate: ${snapshot.statistics.successRate * 100}%`,
        `avg_processing: ${snapshot.statistics.avgProcessingTime}ms`,
        ...snapshot.recentSignals.slice(-2).map(s => 
          `recent_spike: ${s.details?.mintCount || 'N/A'} mints [${s.timestamp.slice(11, 19)}]`
        )
      ];
    }
    
    return [
      "indexing_active",
      "mint_patterns_tracked",
      "volume_threshold_10+"
    ];
  },
}; 