//Signal Emitter Utility: Provides standardized signal emission and logging functionality

import { validateSignal, createStandardSignal, type StandardSignal } from "../agents/signal-registry";
import { logSignal } from "./logger";
import { 
  initializeAgentState, 
  logSignalEmission, 
  updateAgentState 
} from "./memory-logger";

export interface SignalEmissionResult {
  success: boolean;
  signal?: StandardSignal;
  errors?: string[];
}

//Emit a validated signal with proper logging
export const emitSignal = (
  type: string,
  agentId: string,
  data: Partial<StandardSignal> = {}
): SignalEmissionResult => {
  const startTime = Date.now();
  
  //Initialize agent state if needed
  initializeAgentState(agentId, data.agent || 'Unknown');
  
  //Update agent status to processing
  updateAgentState(agentId, { currentStatus: 'processing' });
  
  try {
    //Create standardized signal
    const signal = createStandardSignal(type, agentId, data);
    
    //Validate against schema
    const validation = validateSignal(signal);
    
    const processingTime = Date.now() - startTime;
    
    if (!validation.valid) {
      console.error(`❌ Signal emission failed for ${type}:`, validation.errors);
      
      //Log failed signal emission
      logSignalEmission(
        agentId,
        type,
        signal.glyph,
        false,
        processingTime,
        data.confidence,
        { errors: validation.errors }
      );
      
      updateAgentState(agentId, { currentStatus: 'error' });
      
      return {
        success: false,
        errors: validation.errors
      };
    }

    //Log the signal using the existing logger
    logSignal({
      agent: signal.agent,
      type: signal.type,
      glyph: signal.glyph,
      hash: signal.hash,
      timestamp: signal.timestamp,
      confidence: signal.confidence,
      details: signal.details
    });

    //Enhanced logging with metadata
    if (signal.metadata) {
      console.log(`├─ priority: ${signal.metadata.priority}, category: ${signal.metadata.category}`);
    }

    //Log successful signal emission to memory
    logSignalEmission(
      agentId,
      type,
      signal.glyph,
      true,
      processingTime,
      signal.confidence,
      signal.details
    );
    
    updateAgentState(agentId, { currentStatus: 'active' });

    return {
      success: true,
      signal
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const processingTime = Date.now() - startTime;
    
    console.error(`❌ Signal emission failed for ${type}:`, errorMessage);
    
    //Log error in memory
    logSignalEmission(
      agentId,
      type,
      'ERROR',
      false,
      processingTime,
      undefined,
      { error: errorMessage }
    );
    
    updateAgentState(agentId, { currentStatus: 'error' });
    
    return {
      success: false,
      errors: [errorMessage]
    };
  }
};

//Generate a hash for the signal based on content
export const generateSignalHash = (event: any, agentId: string): string => {
  const content = {
    event,
    agentId,
    timestamp: Date.now()
  };
  const base = JSON.stringify(content);
  const hash = Buffer.from(base).toString("base64").slice(0, 10);
  return `sig_${hash}`;
}; 