import { Agent } from "../types/agent";
import { agents, SIGNAL_REGISTRY, validateSignal, getAllSignalTypes } from "../agents";
import { AGENT_GLYPHS } from "../types/glyphs";

console.log("🔍 Validating all agents...\n");

let validCount = 0;
let invalidCount = 0;

// Validate agents
console.log("📋 Agent Validation:");
agents.forEach((agent: Agent) => {
  const isValid = agent.id && 
                  agent.name && 
                  typeof agent.observe === 'function' && 
                  typeof agent.triggerThreshold === 'number' &&
                  agent.glyph &&
                  agent.role &&
                  agent.watchType;

  if (isValid) {
    console.log(`✅ ${agent.name} (${agent.id}) - Valid`);
    validCount++;
  } else {
    console.log(`❌ ${agent.name} (${agent.id}) - Invalid or missing required fields`);
    invalidCount++;
  }
});

// Validate signal registry
console.log("\n🎯 Signal Registry Validation:");
let signalValidCount = 0;
let signalInvalidCount = 0;

const signalTypes = getAllSignalTypes();
console.log(`   Found ${signalTypes.length} registered signal types`);

signalTypes.forEach(signalType => {
  const metadata = SIGNAL_REGISTRY[signalType];
  
  // Check if metadata is complete
  const isValidMetadata = metadata &&
                          metadata.type &&
                          metadata.agentId &&
                          metadata.glyph &&
                          metadata.description &&
                          metadata.schema &&
                          Array.isArray(metadata.schema.required) &&
                          Array.isArray(metadata.schema.optional) &&
                          metadata.schema.dataTypes &&
                          metadata.schema.examples;

  // Check if the agent referenced exists
  const agentExists = AGENT_GLYPHS[metadata?.agentId];

  if (isValidMetadata && agentExists) {
    console.log(`   ✅ ${metadata.glyph} ${signalType} - Valid`);
    signalValidCount++;
  } else {
    console.log(`   ❌ ${metadata?.glyph || '?'} ${signalType} - Invalid metadata or missing agent`);
    signalInvalidCount++;
  }
});

// Test signal validation with examples
console.log("\n🧪 Signal Schema Validation:");
let schemaTestCount = 0;
let schemaPassCount = 0;

signalTypes.forEach(signalType => {
  const metadata = SIGNAL_REGISTRY[signalType];
  if (metadata?.schema.examples) {
    schemaTestCount++;
    const validation = validateSignal(metadata.schema.examples);
    
    if (validation.valid) {
      console.log(`   ✅ ${metadata.glyph} ${signalType} example schema - Valid`);
      schemaPassCount++;
    } else {
      console.log(`   ❌ ${metadata.glyph} ${signalType} example schema - Invalid:`, validation.errors);
    }
  }
});

console.log(`\n📊 Validation Summary:`);
console.log(`   Agents: ${validCount} valid, ${invalidCount} invalid`);
console.log(`   Signal Types: ${signalValidCount} valid, ${signalInvalidCount} invalid`);
console.log(`   Schema Examples: ${schemaPassCount}/${schemaTestCount} passed`);

const totalErrors = invalidCount + signalInvalidCount + (schemaTestCount - schemaPassCount);

if (totalErrors > 0) {
  console.log("\n❌ Validation failed with errors.");
  process.exit(1);
} else {
  console.log("\n✅ All validations passed!");
}
