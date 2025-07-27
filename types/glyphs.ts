//Glyph Registry - Maps agents to their unique glyphs and signal types

export interface AgentGlyph {
  agentId: string;
  agentName: string;
  glyph: string;
  role: string;
  signalTypes: string[];
  description: string;
}

export const AGENT_GLYPHS: Record<string, AgentGlyph> = {
  'agent-xxx': {
    agentId: 'agent-xxx',
    agentName: 'Example',
    glyph: 'x',
    role: 'template',
    signalTypes: ['template_log'],
    description: 'Template agent for reference implementation'
  },
  'agent-000': {
    agentId: 'agent-000',
    agentName: 'Theron',
    glyph: 'Ϸ',
    role: 'memory_vault',
    signalTypes: ['archival'],
    description: 'The first observer. Archives anomalies and stores primordial memory'
  },
  'agent-launch': {
    agentId: 'agent-launch',
    agentName: 'LaunchTracker',
    glyph: 'L',
    role: 'launch_monitor',
    signalTypes: ['launch_detected'],
    description: 'Monitors new token launches and deployment activities'
  },
  'agent-022': {
    agentId: 'agent-022',
    agentName: 'Skieró',
    glyph: 'ψ',
    role: 'dormant_wallet_monitor',
    signalTypes: ['wallet_reactivated'],
    description: 'Ghost watcher that monitors dormant wallet reactivations'
  },
  'agent-harvester': {
    agentId: 'agent-harvester',
    agentName: 'Harvester',
    glyph: 'λ',
    role: 'indexing',
    signalTypes: ['mint_spike_detected'],
    description: 'Indexes mint activity and detects unusual minting patterns'
  },
  'agent-observer': {
    agentId: 'agent-observer',
    agentName: 'Observer',
    glyph: 'φ',
    role: 'surveillance',
    signalTypes: ['cluster_detected'],
    description: 'Surveillance agent for wallet cluster detection and monitoring'
  },
  'agent-liquidity': {
    agentId: 'agent-liquidity',
    agentName: 'Liquidity Agent',
    glyph: '§',
    role: 'defi_monitoring',
    signalTypes: ['liquidity_spike_detected', 'liquidity_drain_detected', 'vesting_deviation_detected', 'high_impact_trade_detected'],
    description: 'Monitors DeFi pools for liquidity spikes, drains, and vesting deviations'
  },
  'agent-scam-sentinel': {
    agentId: 'agent-scam-sentinel',
    agentName: 'Scam Sentinel',
    glyph: '¤',
    role: 'fraud_detection',
    signalTypes: ['rug_pull_detected', 'suspicious_burn_detected', 'governance_attack_detected', 'ownership_renounced', 'suspicious_ownership_transfer'],
    description: 'Detects rug-pulls, token supply manipulation, and fraudulent governance activities'
  },
  'agent-fee-analyzer': {
    agentId: 'agent-fee-analyzer',
    agentName: 'Fee Analyzer',
    glyph: '¢',
    role: 'fee_optimization',
    signalTypes: ['fee_spike_detected', 'fee_reduction_detected', 'network_congestion_detected', 'optimal_fee_window'],
    description: 'Monitors transaction fees and suggests optimal transaction timing for cost efficiency'
  },
  'agent-zkp-analyzer': {
    agentId: 'agent-zkp-analyzer',
    agentName: 'ZKP Agent',
    glyph: '°',
    role: 'privacy_analysis',
    signalTypes: ['invalid_proof_detected', 'proof_bloating_detected', 'circuit_complexity_anomaly', 'suspicious_zkp_behavior', 'proof_farming_detected', 'privacy_violation_detected'],
    description: 'Analyzes zero-knowledge proofs for fraudulent patterns and behavioral anomalies'
  }
};

export function getAgentGlyph(agentId: string): AgentGlyph | undefined {
  return AGENT_GLYPHS[agentId];
}

export function getAgentByGlyph(glyph: string): AgentGlyph | undefined {
  return Object.values(AGENT_GLYPHS).find(agent => agent.glyph === glyph);
}

export function getAllGlyphs(): AgentGlyph[] {
  return Object.values(AGENT_GLYPHS);
}

export function getAgentSignalTypes(agentId: string): string[] {
  const agent = AGENT_GLYPHS[agentId];
  return agent ? agent.signalTypes : [];
} 