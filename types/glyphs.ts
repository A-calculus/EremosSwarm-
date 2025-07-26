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
    description: 'Template agent used as a reference for custom swarm agent creation'
  },
  'agent-000': {
    agentId: 'agent-000',
    agentName: 'Theron',
    glyph: 'Ϸ',
    role: 'memory_vault',
    signalTypes: ['archival'],
    description: 'The first observer. Archives anomalies but does not emit'
  },
  'agent-launch': {
    agentId: 'agent-launch',
    agentName: 'LaunchTracker',
    glyph: 'L',
    role: 'launch_monitor',
    signalTypes: ['launch_detected'],
    description: 'Monitors freshly funded wallets from CEX sources'
  },
  'agent-022': {
    agentId: 'agent-022',
    agentName: 'Skieró',
    glyph: 'ψ',
    role: 'dormant_wallet_monitor',
    signalTypes: ['wallet_reactivated'],
    description: 'Tracks long-dormant wallets that suddenly reactivate'
  },
  'agent-harvester': {
    agentId: 'agent-harvester',
    agentName: 'Harvester',
    glyph: 'λ',
    role: 'indexing',
    signalTypes: ['mint_spike_detected'],
    description: 'Indexes mint data for high-volume collections'
  },
  'agent-observer': {
    agentId: 'agent-observer',
    agentName: 'Observer',
    glyph: 'φ',
    role: 'surveillance',
    signalTypes: ['cluster_detected'],
    description: 'A passive agent that logs unusual wallet clustering'
  }
};

//Lookup functions for easy glyph access
export const getAgentGlyph = (agentId: string): string => {
  return AGENT_GLYPHS[agentId]?.glyph || '?';
};

export const getAgentByGlyph = (glyph: string): AgentGlyph | undefined => {
  return Object.values(AGENT_GLYPHS).find(agent => agent.glyph === glyph);
};

export const getAllGlyphs = (): string[] => {
  return Object.values(AGENT_GLYPHS).map(agent => agent.glyph);
};

export const getAgentSignalTypes = (agentId: string): string[] => {
  return AGENT_GLYPHS[agentId]?.signalTypes || [];
}; 