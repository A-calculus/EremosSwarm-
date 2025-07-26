//Signal Registry: This ensures all agents adhere to a unified signal structure

import { AGENT_GLYPHS, getAgentGlyph } from "../types/glyphs";

export interface SignalMetadata {
  type: string;
  agentId: string;
  glyph: string;
  description: string;
  schema: SignalSchema;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'detection' | 'monitoring' | 'alert' | 'archival' | 'template';
}

export interface SignalSchema {
  required: string[];
  optional: string[];
  dataTypes: Record<string, 'string' | 'number' | 'boolean' | 'object' | 'array'>;
  examples: Record<string, any>;
}

export interface StandardSignal {
  agent: string;
  type: string;
  glyph: string;
  hash: string;
  timestamp: string;
  confidence?: number;
  details?: Record<string, any>;
  metadata?: {
    priority: string;
    category: string;
    source?: string;
  };
}

//Registry of all signal types across the Eremos ecosystem
export const SIGNAL_REGISTRY: Record<string, SignalMetadata> = {
  'template_log': {
    type: 'template_log',
    agentId: 'agent-xxx',
    glyph: 'x',
    description: 'Template signal for reference implementation',
    category: 'template',
    priority: 'low',
    schema: {
      required: ['agent', 'type', 'glyph', 'hash', 'timestamp'],
      optional: ['details'],
      dataTypes: {
        agent: 'string',
        type: 'string',
        glyph: 'string',
        hash: 'string',
        timestamp: 'string',
        details: 'object'
      },
      examples: {
        agent: 'Example',
        type: 'template_log',
        glyph: 'x',
        hash: 'sig_abc123',
        timestamp: '2025-01-01T00:00:00.000Z'
      }
    }
  },
  
  'archival': {
    type: 'archival',
    agentId: 'agent-000',
    glyph: 'Ϸ',
    description: 'Archival signal for anomaly storage by Theron',
    category: 'archival',
    priority: 'medium',
    schema: {
      required: ['agent', 'type', 'glyph', 'hash', 'timestamp'],
      optional: ['details', 'anomalyType'],
      dataTypes: {
        agent: 'string',
        type: 'string',
        glyph: 'string',
        hash: 'string',
        timestamp: 'string',
        anomalyType: 'string',
        details: 'object'
      },
      examples: {
        agent: 'Theron',
        type: 'archival',
        glyph: 'Ϸ',
        hash: 'sig_fragment_abc',
        timestamp: '2025-01-01T00:00:00.000Z',
        anomalyType: 'wallet_cluster'
      }
    }
  },

  'launch_detected': {
    type: 'launch_detected',
    agentId: 'agent-launch',
    glyph: 'L',
    description: 'High-confidence token launch detection signal',
    category: 'detection',
    priority: 'high',
    schema: {
      required: ['agent', 'type', 'glyph', 'hash', 'timestamp', 'confidence'],
      optional: ['details', 'sourceExchange', 'fundingAmount', 'bundleCount'],
      dataTypes: {
        agent: 'string',
        type: 'string',
        glyph: 'string',
        hash: 'string',
        timestamp: 'string',
        confidence: 'number',
        sourceExchange: 'string',
        fundingAmount: 'number',
        bundleCount: 'number',
        details: 'object'
      },
      examples: {
        agent: 'LaunchTracker',
        type: 'launch_detected',
        glyph: 'L',
        hash: 'sig_launch_xyz',
        timestamp: '2025-01-01T00:00:00.000Z',
        confidence: 0.91,
        sourceExchange: 'kraken',
        bundleCount: 5
      }
    }
  },

  'wallet_reactivated': {
    type: 'wallet_reactivated',
    agentId: 'agent-022',
    glyph: 'ψ',
    description: 'Long-dormant wallet reactivation signal',
    category: 'detection',
    priority: 'medium',
    schema: {
      required: ['agent', 'type', 'glyph', 'hash', 'timestamp', 'confidence'],
      optional: ['details', 'walletAge', 'lastActivity'],
      dataTypes: {
        agent: 'string',
        type: 'string',
        glyph: 'string',
        hash: 'string',
        timestamp: 'string',
        confidence: 'number',
        walletAge: 'number',
        lastActivity: 'string',
        details: 'object'
      },
      examples: {
        agent: 'Skieró',
        type: 'wallet_reactivated',
        glyph: 'ψ',
        hash: 'sig_ghost_def',
        timestamp: '2025-01-01T00:00:00.000Z',
        confidence: 0.78,
        walletAge: 365
      }
    }
  },

  'mint_spike_detected': {
    type: 'mint_spike_detected',
    agentId: 'agent-harvester',
    glyph: 'λ',
    description: 'High-volume mint activity detection',
    category: 'monitoring',
    priority: 'medium',
    schema: {
      required: ['agent', 'type', 'glyph', 'hash', 'timestamp'],
      optional: ['details', 'mintCount', 'collection'],
      dataTypes: {
        agent: 'string',
        type: 'string',
        glyph: 'string',
        hash: 'string',
        timestamp: 'string',
        mintCount: 'number',
        collection: 'string',
        details: 'object'
      },
      examples: {
        agent: 'Harvester',
        type: 'mint_spike_detected',
        glyph: 'λ',
        hash: 'sig_mint_ghi',
        timestamp: '2025-01-01T00:00:00.000Z',
        mintCount: 15
      }
    }
  },

  'cluster_detected': {
    type: 'cluster_detected',
    agentId: 'agent-observer',
    glyph: 'φ',
    description: 'Unusual wallet clustering detection',
    category: 'monitoring',
    priority: 'medium',
    schema: {
      required: ['agent', 'type', 'glyph', 'hash', 'timestamp'],
      optional: ['details', 'clusterSize', 'wallets'],
      dataTypes: {
        agent: 'string',
        type: 'string',
        glyph: 'string',
        hash: 'string',
        timestamp: 'string',
        clusterSize: 'number',
        wallets: 'array',
        details: 'object'
      },
      examples: {
        agent: 'Observer',
        type: 'cluster_detected',
        glyph: 'φ',
        hash: 'sig_cluster_jkl',
        timestamp: '2025-01-01T00:00:00.000Z',
        clusterSize: 4
      }
    }
  }
};

//Signal Registry Utility Functions
export const validateSignal = (signal: any): { valid: boolean; errors: string[] } => {
  const metadata = SIGNAL_REGISTRY[signal.type];
  if (!metadata) {
    return { valid: false, errors: [`Unknown signal type: ${signal.type}`] };
  }

  const errors: string[] = [];
  const schema = metadata.schema;

  // Check required fields
  for (const field of schema.required) {
    if (!(field in signal)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check data types
  for (const [field, expectedType] of Object.entries(schema.dataTypes)) {
    if (field in signal) {
      const actualType = Array.isArray(signal[field]) ? 'array' : typeof signal[field];
      if (actualType !== expectedType) {
        errors.push(`Field ${field} should be ${expectedType}, got ${actualType}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
};

//Create a standardized signal with proper metadata
export const createStandardSignal = (
  type: string,
  agentId: string,
  data: Partial<StandardSignal>
): StandardSignal => {
  const metadata = SIGNAL_REGISTRY[type];
  if (!metadata) {
    throw new Error(`Unknown signal type: ${type}`);
  }

  const glyph = getAgentGlyph(agentId);
  
  return {
    agent: AGENT_GLYPHS[agentId]?.agentName || 'Unknown',
    type,
    glyph,
    hash: data.hash || `sig_${Date.now()}`,
    timestamp: data.timestamp || new Date().toISOString(),
    confidence: data.confidence,
    details: data.details,
    metadata: {
      priority: metadata.priority,
      category: metadata.category,
      source: agentId
    }
  };
};

//Get all signal types for a specific agent
export const getAgentSignalTypes = (agentId: string): string[] => {
  return Object.values(SIGNAL_REGISTRY)
    .filter(metadata => metadata.agentId === agentId)
    .map(metadata => metadata.type);
};

//Get signal metadata by type
export const getSignalMetadata = (type: string): SignalMetadata | undefined => {
  return SIGNAL_REGISTRY[type];
};

//Get all registered signal types
 
export const getAllSignalTypes = (): string[] => {
  return Object.keys(SIGNAL_REGISTRY);
}; 