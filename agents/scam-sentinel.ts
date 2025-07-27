//Scam Sentinel: Detects rug-pulls via token supply changes, voting patterns, and suspicious behaviors

import { Agent } from '../types/agent';
import { generateSignalHash } from "../utils/signal";
import { logSignal } from "../utils/logger";
import { recordEventProcessing, recordSignalEmission, recordAgentError } from '../utils/agent-metrics';

export interface ScamEvent {
  type: 'mint' | 'burn' | 'governance_vote' | 'ownership_transfer' | 'liquidity_removal';
  token: string;
  contractAddress: string;
  timestamp: string;
  details: {
    supply_change?: number;
    supply_before?: number;
    supply_after?: number;
    voting_power?: number;
    proposal_id?: string;
    vote_outcome?: string;
    ownership_from?: string;
    ownership_to?: string;
    liquidity_removed?: number;
    timeframe?: string;
  };
}

export const ScamSentinel: Agent = {
  id: 'agent-scam-sentinel',
  name: 'Scam Sentinel',
  role: 'fraud_detection',
  glyph: '¤',
  watchType: 'scam_detection',
  triggerThreshold: 0.8,
  lastSignal: null,
  originTimestamp: new Date().toISOString(),
  description: 'Detects rug-pulls, token supply manipulation, and fraudulent governance activities',

  observe: (event: ScamEvent) => {
    const startTime = Date.now();
    
    try {
      console.log(`[ScamSentinel] Processing ${event.type} for token ${event.token}`);

      switch (event.type) {
        case 'mint':
        case 'burn':
          analyzeSupplyChange(event);
          break;
        case 'governance_vote':
          analyzeGovernanceVoting(event);
          break;
        case 'ownership_transfer':
          analyzeOwnershipTransfer(event);
          break;
        case 'liquidity_removal':
          analyzeLiquidityRemoval(event);
          break;
        default:
          console.log(`[ScamSentinel] Ignored event type: ${event.type}`);
      }

      // Record successful event processing
      const processingTime = Date.now() - startTime;
      recordEventProcessing(ScamSentinel.name, event.type, processingTime, true);
      
    } catch (error) {
      console.error(`[ScamSentinel] Error processing event:`, error);
      
      // Record failed event processing
      const processingTime = Date.now() - startTime;
      recordEventProcessing(ScamSentinel.name, event.type, processingTime, false);
      recordAgentError(ScamSentinel.name, 'processing_error', error instanceof Error ? error.message : 'Unknown error');
    }
  },

  getMemory: () => {
    return [
      `scam_detection: active`,
      `supply_change_threshold: 10.0%`,
      `liquidity_removal_threshold: 50.0%`,
      `voting_power_threshold: 49.0%`,
      `monitoring: rug_pulls,governance_attacks,ownership_transfers`,
      `status: scanning_for_threats`
    ];
  }
};

const supplyChangeThreshold = 0.1; // 10% supply change threshold
const liquidityRemovalThreshold = 0.5; // 50% liquidity removal threshold
const votingPowerThreshold = 0.49; // 49% voting power concentration

function analyzeSupplyChange(event: ScamEvent): void {
  const { details } = event;
  
  if (details.supply_change && Math.abs(details.supply_change) > supplyChangeThreshold) {
    const isInflation = details.supply_change > 0;
    const severity = Math.abs(details.supply_change);
    
    // Detect massive supply inflation (potential rug-pull preparation)
    if (isInflation && severity > 0.5) {
      const hashed = generateSignalHash({
        type: 'rug_pull_detected',
        token: event.token,
        supply_change: details.supply_change,
        timestamp: event.timestamp
      });

      logSignal({
        agent: ScamSentinel.name,
        type: 'rug_pull_detected',
        glyph: '¤',
        hash: hashed,
        timestamp: event.timestamp,
        details: {
          token: event.token,
          contract_address: event.contractAddress,
          supply_change: details.supply_change,
          supply_before: details.supply_before,
          supply_after: details.supply_after,
          inflation_severity: severity,
          risk_level: calculateRiskLevel(severity),
          confidence: calculateSupplyChangeConfidence(severity)
        }
      });
    }
    
    // Detect suspicious burn events (potential evidence destruction)
    else if (!isInflation && severity > 0.3) {
      const hashed = generateSignalHash({
        type: 'suspicious_burn_detected',
        token: event.token,
        burn_amount: Math.abs(details.supply_change),
        timestamp: event.timestamp
      });

      logSignal({
        agent: ScamSentinel.name,
        type: 'suspicious_burn_detected',
        glyph: '¤',
        hash: hashed,
        timestamp: event.timestamp,
        details: {
          token: event.token,
          contract_address: event.contractAddress,
          burn_amount: Math.abs(details.supply_change),
          supply_before: details.supply_before,
          supply_after: details.supply_after,
          confidence: Math.min(0.85, 0.6 + severity * 0.5)
        }
      });
    }
  }
}

function analyzeGovernanceVoting(event: ScamEvent): void {
  const { details } = event;
  
  // Detect voting power concentration (potential governance attack)
  if (details.voting_power && details.voting_power > votingPowerThreshold) {
    const hashed = generateSignalHash({
      type: 'governance_attack_detected',
      token: event.token,
      voting_power: details.voting_power,
      timestamp: event.timestamp
    });

    logSignal({
      agent: ScamSentinel.name,
      type: 'governance_attack_detected',
      glyph: '¤',
      hash: hashed,
      timestamp: event.timestamp,
      details: {
        token: event.token,
        contract_address: event.contractAddress,
        voting_power: details.voting_power,
        proposal_id: details.proposal_id,
        vote_outcome: details.vote_outcome,
        concentration_risk: details.voting_power > 0.75 ? 'critical' : 'high',
        confidence: Math.min(0.95, 0.7 + (details.voting_power - 0.5) * 0.5)
      }
    });
  }
}

function analyzeOwnershipTransfer(event: ScamEvent): void {
  const { details } = event;
  
  // Detect ownership transfer to suspicious addresses (potential preparation for rug-pull)
  if (details.ownership_from && details.ownership_to) {
    const isToNullAddress = details.ownership_to === '0x0000000000000000000000000000000000000000';
    
    if (isToNullAddress) {
      // Ownership renounced - could be legitimate or suspicious
      const hashed = generateSignalHash({
        type: 'ownership_renounced',
        token: event.token,
        previous_owner: details.ownership_from,
        timestamp: event.timestamp
      });

      logSignal({
        agent: ScamSentinel.name,
        type: 'ownership_renounced',
        glyph: '¤',
        hash: hashed,
        timestamp: event.timestamp,
        details: {
          token: event.token,
          contract_address: event.contractAddress,
          previous_owner: details.ownership_from,
          risk_assessment: 'monitor_required',
          confidence: 0.6
        }
      });
    } else {
      // Ownership transferred to unknown address
      const hashed = generateSignalHash({
        type: 'suspicious_ownership_transfer',
        token: event.token,
        new_owner: details.ownership_to,
        timestamp: event.timestamp
      });

      logSignal({
        agent: ScamSentinel.name,
        type: 'suspicious_ownership_transfer',
        glyph: '¤',
        hash: hashed,
        timestamp: event.timestamp,
        details: {
          token: event.token,
          contract_address: event.contractAddress,
          previous_owner: details.ownership_from,
          new_owner: details.ownership_to,
          confidence: 0.75
        }
      });
    }
  }
}

function analyzeLiquidityRemoval(event: ScamEvent): void {
  const { details } = event;
  
  if (details.liquidity_removed && details.liquidity_removed > liquidityRemovalThreshold) {
    const severity = details.liquidity_removed;
    const timeBasedRisk = assessTimeBasedRisk(event.timestamp, details.timeframe);
    
    const hashed = generateSignalHash({
      type: 'rug_pull_detected',
      token: event.token,
      liquidity_removed: details.liquidity_removed,
      timestamp: event.timestamp
    });

    logSignal({
      agent: ScamSentinel.name,
      type: 'rug_pull_detected',
      glyph: '¤',
      hash: hashed,
      timestamp: event.timestamp,
      details: {
        token: event.token,
        contract_address: event.contractAddress,
        liquidity_removed: details.liquidity_removed,
        removal_severity: severity,
        timeframe: details.timeframe,
        time_based_risk: timeBasedRisk,
        confidence: Math.min(0.98, 0.8 + severity * 0.15 + timeBasedRisk * 0.1)
      }
    });
  }
}

function calculateSupplyChangeConfidence(severity: number): number {
  // Higher severity = higher confidence in rug-pull detection
  let confidence = 0.6;
  
  if (severity > 1.0) confidence = 0.95; // 100%+ supply change is extremely suspicious
  else if (severity > 0.5) confidence = 0.85; // 50%+ supply change is highly suspicious
  else confidence = 0.6 + severity * 0.5; // Scale confidence with severity
  
  return Math.min(0.98, confidence);
}

function calculateRiskLevel(severity: number): string {
  if (severity > 1.0) return 'critical';
  if (severity > 0.5) return 'high';
  if (severity > 0.2) return 'medium';
  return 'low';
}

function assessTimeBasedRisk(timestamp: string, timeframe?: string): number {
  // Assess risk based on timing patterns (e.g., weekend dumps, after-hours activity)
  const eventTime = new Date(timestamp);
  const hour = eventTime.getUTCHours();
  const dayOfWeek = eventTime.getUTCDay();
  
  let riskMultiplier = 0;
  
  // Weekend activity (higher risk)
  if (dayOfWeek === 0 || dayOfWeek === 6) riskMultiplier += 0.2;
  
  // After-hours activity (higher risk)
  if (hour < 6 || hour > 22) riskMultiplier += 0.15;
  
  // Very rapid timeframe (higher risk)
  if (timeframe && timeframe.includes('minutes')) riskMultiplier += 0.3;
  
  return Math.min(1.0, riskMultiplier);
} 