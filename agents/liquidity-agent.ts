//Liquidity Agent: Monitors DeFi pools for liquidity spikes and vesting deviations

import { Agent } from '../types/agent';
import { generateSignalHash } from "../utils/signal";
import { logSignal } from "../utils/logger";
import { recordEventProcessing, recordSignalEmission, recordAgentError } from '../utils/agent-metrics';

export interface LiquidityEvent {
  type: 'pool_activity' | 'vesting_event' | 'liquidity_change';
  poolAddress: string;
  tokenPair: string;
  liquidityAmount: number;
  priceImpact: number;
  timestamp: string;
  details: {
    beforeAmount?: number;
    afterAmount?: number;
    vestingSchedule?: any;
    deviation?: number;
    volumeSpike?: boolean;
  };
}

export const LiquidityAgent: Agent = {
  id: 'agent-liquidity',
  name: 'Liquidity Agent',
  role: 'defi_monitoring',
  glyph: '§',
  watchType: 'liquidity_tracking',
  triggerThreshold: 2.0, // 200% change threshold
  lastSignal: null,
  originTimestamp: new Date().toISOString(),
  description: 'Monitors DeFi pools for liquidity spikes, drains, and vesting deviations',

  observe: (event: LiquidityEvent) => {
    const startTime = Date.now();
    
    try {
      console.log(`[LiquidityAgent] Processing ${event.type} for pool ${event.poolAddress}`);

      switch (event.type) {
        case 'liquidity_change':
          analyzeLiquidityChange(event);
          break;
        case 'vesting_event':
          analyzeVestingDeviation(event);
          break;
        case 'pool_activity':
          analyzePoolActivity(event);
          break;
        default:
          console.log(`[LiquidityAgent] Ignored event type: ${event.type}`);
      }

      // Record successful event processing
      const processingTime = Date.now() - startTime;
      recordEventProcessing(LiquidityAgent.name, event.type, processingTime, true);
      
    } catch (error) {
      console.error(`[LiquidityAgent] Error processing event:`, error);
      
      // Record failed event processing
      const processingTime = Date.now() - startTime;
      recordEventProcessing(LiquidityAgent.name, event.type, processingTime, false);
      recordAgentError(LiquidityAgent.name, 'processing_error', error instanceof Error ? error.message : 'Unknown error');
    }
  },

  getMemory: () => {
    return [
      `liquidity_monitor: active`,
      `pools_tracked: monitoring`,
      `spike_threshold: $1,000,000`,
      `vesting_deviation_limit: 15.0%`,
      `price_impact_threshold: 5.0%`,
      `status: scanning_defi_pools`
    ];
  }
};

const liquidityThreshold = 1000000; // can be gotten for specific tokens
const vestingDeviationThreshold = 0.15; // 15% deviation for this use case
const priceImpactThreshold = 0.05; // 5% price impact for this use case

function analyzeLiquidityChange(event: LiquidityEvent): void {
  const { liquidityAmount, details } = event;
  
  // Detect liquidity spikes (sudden large additions)
  if (liquidityAmount > liquidityThreshold) {
    const changeRatio = details.afterAmount && details.beforeAmount 
      ? (details.afterAmount - details.beforeAmount) / details.beforeAmount 
      : 0;

    if (changeRatio > 2.0) { // 200% increase
      const signalStartTime = Date.now();
      
      try {
        const hashed = generateSignalHash({
          type: 'liquidity_spike_detected',
          poolAddress: event.poolAddress,
          liquidityAmount: liquidityAmount,
          changeRatio: changeRatio
        });

        logSignal({
          agent: LiquidityAgent.name,
          type: 'liquidity_spike_detected',
          glyph: '§',
          hash: hashed,
          timestamp: event.timestamp,
          details: {
            pool_address: event.poolAddress,
            token_pair: event.tokenPair,
            liquidity_amount: liquidityAmount,
            change_ratio: changeRatio,
            price_impact: event.priceImpact,
            confidence: calculateConfidence(changeRatio, event.priceImpact)
          }
        });

        // Record successful signal emission
        const signalProcessingTime = Date.now() - signalStartTime;
        recordSignalEmission(LiquidityAgent.name, 'liquidity_spike_detected', signalProcessingTime, true, calculateConfidence(changeRatio, event.priceImpact));
        
      } catch (error) {
        const signalProcessingTime = Date.now() - signalStartTime;
        recordSignalEmission(LiquidityAgent.name, 'liquidity_spike_detected', signalProcessingTime, false);
        recordAgentError(LiquidityAgent.name, 'signal_emission_error', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }

  // Detect liquidity drains (sudden large removals)
  if (details.beforeAmount && details.afterAmount) {
    const drainRatio = (details.beforeAmount - details.afterAmount) / details.beforeAmount;
    
    if (drainRatio > 0.5 && details.beforeAmount > liquidityThreshold) {
      const signalStartTime = Date.now();
      
      try {
        const hashed = generateSignalHash({
          type: 'liquidity_drain_detected',
          poolAddress: event.poolAddress,
          drainAmount: details.beforeAmount - details.afterAmount,
          drainRatio: drainRatio
        });

        logSignal({
          agent: LiquidityAgent.name,
          type: 'liquidity_drain_detected',
          glyph: '§',
          hash: hashed,
          timestamp: event.timestamp,
          details: {
            pool_address: event.poolAddress,
            token_pair: event.tokenPair,
            drain_amount: details.beforeAmount - details.afterAmount,
            drain_ratio: drainRatio,
            remaining_liquidity: details.afterAmount,
            confidence: Math.min(0.95, 0.7 + drainRatio * 0.3)
          }
        });

        // Record successful signal emission
        const signalProcessingTime = Date.now() - signalStartTime;
        recordSignalEmission(LiquidityAgent.name, 'liquidity_drain_detected', signalProcessingTime, true, Math.min(0.95, 0.7 + drainRatio * 0.3));
        
      } catch (error) {
        const signalProcessingTime = Date.now() - signalStartTime;
        recordSignalEmission(LiquidityAgent.name, 'liquidity_drain_detected', signalProcessingTime, false);
        recordAgentError(LiquidityAgent.name, 'signal_emission_error', error instanceof Error ? error.message : 'Unknown error');
      }
    }
  }
}

function analyzeVestingDeviation(event: LiquidityEvent): void {
  const { details } = event;
  
  if (details.deviation && Math.abs(details.deviation) > vestingDeviationThreshold) {
    const signalStartTime = Date.now();
    
    try {
      const hashed = generateSignalHash({
        type: 'vesting_deviation_detected',
        poolAddress: event.poolAddress,
        deviation: details.deviation,
        timestamp: event.timestamp
      });

      const confidence = Math.min(0.9, 0.6 + Math.abs(details.deviation) * 2);

      logSignal({
        agent: LiquidityAgent.name,
        type: 'vesting_deviation_detected',
        glyph: '§',
        hash: hashed,
        timestamp: event.timestamp,
        details: {
          pool_address: event.poolAddress,
          token_pair: event.tokenPair,
          expected_amount: details.vestingSchedule?.expectedAmount,
          actual_amount: event.liquidityAmount,
          deviation: details.deviation,
          vesting_schedule: details.vestingSchedule,
          confidence: confidence
        }
      });

      // Record successful signal emission
      const signalProcessingTime = Date.now() - signalStartTime;
      recordSignalEmission(LiquidityAgent.name, 'vesting_deviation_detected', signalProcessingTime, true, confidence);
      
    } catch (error) {
      const signalProcessingTime = Date.now() - signalStartTime;
      recordSignalEmission(LiquidityAgent.name, 'vesting_deviation_detected', signalProcessingTime, false);
      recordAgentError(LiquidityAgent.name, 'signal_emission_error', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

function analyzePoolActivity(event: LiquidityEvent): void {
  const { priceImpact, details } = event;
  
  // Detect significant price impact events
  if (priceImpact > priceImpactThreshold && details.volumeSpike) {
    const signalStartTime = Date.now();
    
    try {
      const hashed = generateSignalHash({
        type: 'high_impact_trade_detected',
        poolAddress: event.poolAddress,
        priceImpact: priceImpact,
        volumeSpike: details.volumeSpike
      });

      const confidence = calculateTradeImpactConfidence(priceImpact);

      logSignal({
        agent: LiquidityAgent.name,
        type: 'high_impact_trade_detected',
        glyph: '§',
        hash: hashed,
        timestamp: event.timestamp,
        details: {
          pool_address: event.poolAddress,
          token_pair: event.tokenPair,
          price_impact: priceImpact,
          liquidity_amount: event.liquidityAmount,
          volume_spike: details.volumeSpike,
          confidence: confidence
        }
      });

      // Record successful signal emission
      const signalProcessingTime = Date.now() - signalStartTime;
      recordSignalEmission(LiquidityAgent.name, 'high_impact_trade_detected', signalProcessingTime, true, confidence);
      
    } catch (error) {
      const signalProcessingTime = Date.now() - signalStartTime;
      recordSignalEmission(LiquidityAgent.name, 'high_impact_trade_detected', signalProcessingTime, false);
      recordAgentError(LiquidityAgent.name, 'signal_emission_error', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

function calculateConfidence(changeRatio: number, priceImpact: number): number {
  // Base confidence on magnitude of change and price impact
  let confidence = 0.5;
  
  // Higher change ratio increases confidence
  confidence += Math.min(0.3, changeRatio * 0.1);
  
  // Higher price impact increases confidence
  confidence += Math.min(0.2, priceImpact * 4);
  
  return Math.min(0.95, confidence);
}

function calculateTradeImpactConfidence(priceImpact: number): number {
  // Confidence increases with price impact severity
  return Math.min(0.95, 0.6 + priceImpact * 5);
} 