import { emitSignalToStream } from './signal-stream';
import { getSignalMetadata } from '../agents/signal-registry';

export function logSignal(signal: {
  agent: string;
  type: string;
  glyph: string;
  hash: string;
  timestamp: string;
  confidence?: number;
  details?: Record<string, any>;
}) {
  const confidenceInfo = signal.confidence !== undefined ? ` [confidence: ${signal.confidence}]` : '';
  console.log(`[${signal.agent}] stored signal ${signal.hash} (${signal.type}) at ${signal.timestamp}${confidenceInfo}`);
  if (signal.details) {
    console.log(`├─ context:`, JSON.stringify(signal.details, null, 2));
  }

  // Emit to streaming system
  try {
    const metadata = getSignalMetadata(signal.type);
    
    emitSignalToStream({
      ...signal,
      metadata: metadata ? {
        priority: metadata.priority,
        category: metadata.category,
        source: metadata.description || signal.agent
      } : undefined
    });
  } catch (error) {
    console.error('Failed to emit signal to stream:', error);
  }
}
