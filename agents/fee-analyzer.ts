//Fee Analyzer: Tracks transaction fee spikes and suggests optimal transaction times

import { Agent } from "../types/agent";
import { generateSignalHash } from "../utils/signal";
import { logSignal } from "../utils/logger";
import { recordEventProcessing, recordSignalEmission, recordAgentError } from '../utils/agent-metrics';

export interface FeeEvent {
  type: 'fee_spike' | 'fee_drop' | 'network_congestion' | 'optimal_window';
  network: string;
  avgFee: number;
  timestamp: string;
  details: {
    previousAvgFee?: number;
    percentChange?: number;
    congestionLevel?: number;
    blockUtilization?: number;
    recommendedAction?: string;
    optimalTimeWindow?: string;
  };
}

export const FeeAnalyzer: Agent = {
  id: "agent-fee-analyzer",
  name: "Fee Analyzer",
  role: "fee_optimization",
  watchType: "fee_monitoring",
  glyph: "¢",
  triggerThreshold: 1.5, // 50% fee increase threshold
  lastSignal: null,
  originTimestamp: new Date().toISOString(),

  description:
    "Monitors transaction fees across networks, detects spikes, and suggests optimal transaction timing for cost-effective operations.",

  observe: (event: FeeEvent) => {
    const startTime = Date.now();
    
    try {
      console.log(`[FeeAnalyzer] Processing ${event.type} on ${event.network}`);

      switch (event.type) {
        case 'fee_spike':
          analyzeFeeSpike(event);
          break;
        case 'fee_drop':
          analyzeFeeReduction(event);
          break;
        case 'network_congestion':
          analyzeNetworkCongestion(event);
          break;
        case 'optimal_window':
          identifyOptimalWindow(event);
          break;
        default:
          console.log(`[FeeAnalyzer] Ignored event type: ${event.type}`);
      }

      // Record successful event processing
      const processingTime = Date.now() - startTime;
      recordEventProcessing(FeeAnalyzer.name, event.type, processingTime, true);
      
    } catch (error) {
      console.error(`[FeeAnalyzer] Error processing event:`, error);
      
      // Record failed event processing
      const processingTime = Date.now() - startTime;
      recordEventProcessing(FeeAnalyzer.name, event.type, processingTime, false);
      recordAgentError(FeeAnalyzer.name, 'processing_error', error instanceof Error ? error.message : 'Unknown error');
    }
  },

  getMemory: () => {
    return [
      `fee_monitoring: active`,
      `spike_threshold: 50%`,
      `networks_tracked: ethereum,polygon,solana,arbitrum`,
      `optimization_target: cost_efficiency`,
      `status: monitoring_gas_prices`
    ];
  }
};

function analyzeFeeSpike(event: FeeEvent): void {
  const { details } = event;
  
  if (details.percentChange && details.percentChange > 0.5) { // 50% increase
    const severity = calculateFeeSeverity(details.percentChange);
    const hashed = generateSignalHash({
      type: 'fee_spike_detected',
      network: event.network,
      avgFee: event.avgFee,
      percentChange: details.percentChange
    });

    logSignal({
      agent: FeeAnalyzer.name,
      type: 'fee_spike_detected',
      glyph: '¢',
      hash: hashed,
      timestamp: event.timestamp,
      details: {
        network: event.network,
        current_fee: event.avgFee,
        previous_fee: details.previousAvgFee,
        percent_change: details.percentChange,
        severity: severity,
        recommendation: generateRecommendation('high_fee', severity)
      }
    });
  }
}

function analyzeFeeReduction(event: FeeEvent): void {
  const { details } = event;
  
  if (details.percentChange && details.percentChange < -0.3) { // 30% decrease
    const hashed = generateSignalHash({
      type: 'fee_reduction_detected',
      network: event.network,
      avgFee: event.avgFee,
      percentChange: details.percentChange
    });

    logSignal({
      agent: FeeAnalyzer.name,
      type: 'fee_reduction_detected',
      glyph: '¢',
      hash: hashed,
      timestamp: event.timestamp,
      details: {
        network: event.network,
        current_fee: event.avgFee,
        percent_reduction: Math.abs(details.percentChange),
        opportunity: 'favorable_transaction_window',
        recommendation: 'Execute pending transactions now'
      }
    });
  }
}

function analyzeNetworkCongestion(event: FeeEvent): void {
  const { details } = event;
  
  if (details.congestionLevel && details.congestionLevel > 0.8) { // 80% congestion
    const hashed = generateSignalHash({
      type: 'network_congestion_detected',
      network: event.network,
      congestionLevel: details.congestionLevel,
      blockUtilization: details.blockUtilization
    });

    logSignal({
      agent: FeeAnalyzer.name,
      type: 'network_congestion_detected',
      glyph: '¢',
      hash: hashed,
      timestamp: event.timestamp,
      details: {
        network: event.network,
        congestion_level: details.congestionLevel,
        block_utilization: details.blockUtilization,
        estimated_delay: calculateEstimatedDelay(details.congestionLevel),
        recommendation: generateRecommendation('congestion', details.congestionLevel)
      }
    });
  }
}

function identifyOptimalWindow(event: FeeEvent): void {
  const { details } = event;
  
  if (details.optimalTimeWindow) {
    const hashed = generateSignalHash({
      type: 'optimal_fee_window',
      network: event.network,
      timeWindow: details.optimalTimeWindow,
      avgFee: event.avgFee
    });

    logSignal({
      agent: FeeAnalyzer.name,
      type: 'optimal_fee_window',
      glyph: '¢',
      hash: hashed,
      timestamp: event.timestamp,
      details: {
        network: event.network,
        optimal_window: details.optimalTimeWindow,
        estimated_fee: event.avgFee,
        savings_potential: calculateSavingsPotential(event.avgFee, details.previousAvgFee),
        recommendation: `Execute transactions during ${details.optimalTimeWindow}`
      }
    });
  }
}

function calculateFeeSeverity(percentChange: number): string {
  if (percentChange > 2.0) return 'critical'; // 200%+ increase
  if (percentChange > 1.0) return 'high';     // 100%+ increase
  if (percentChange > 0.5) return 'medium';   // 50%+ increase
  return 'low';
}

function calculateEstimatedDelay(congestionLevel: number): string {
  if (congestionLevel > 0.9) return '15+ minutes';
  if (congestionLevel > 0.8) return '10-15 minutes';
  if (congestionLevel > 0.7) return '5-10 minutes';
  return '< 5 minutes';
}

function calculateSavingsPotential(currentFee: number, previousFee?: number): string {
  if (!previousFee) return 'unknown';
  
  const savings = ((previousFee - currentFee) / previousFee) * 100;
  if (savings > 50) return 'high (50%+)';
  if (savings > 25) return 'medium (25-50%)';
  if (savings > 10) return 'low (10-25%)';
  return 'minimal (<10%)';
}

function generateRecommendation(scenario: string, value: number | string): string {
  switch (scenario) {
    case 'high_fee':
      if (typeof value === 'number' && value > 1.5) {
        return 'Delay non-urgent transactions. Consider Layer 2 solutions.';
      }
      return 'Monitor fees closely. Consider batching transactions.';
    
    case 'congestion':
      if (typeof value === 'number' && value > 0.9) {
        return 'Network heavily congested. Avoid transactions unless urgent.';
      }
      return 'Moderate congestion. Use higher gas prices for faster confirmation.';
    
    default:
      return 'Monitor network conditions and adjust transaction timing accordingly.';
  }
} 