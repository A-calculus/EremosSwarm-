/**
 * Signal Registry Demonstration
 * Shows how to use the centralized signal registry and enhanced signal utilities
 */

import { 
  SIGNAL_REGISTRY,
  validateSignal,
  createStandardSignal,
  getAgentSignalTypes,
  getSignalMetadata,
  getAllSignalTypes
} from '../agents';
import { AGENT_GLYPHS } from '../types/glyphs';
import { emitSignal } from '../utils/signal-emitter';

console.log('🔗 Eremos Signal Registry Demonstration\n');

// 1. Show all registered agents and their glyphs
console.log('📋 Registered Agents:');
const agents = Object.values(AGENT_GLYPHS);
agents.forEach(agent => {
  console.log(`   ${agent.glyph} ${agent.agentName} (${agent.agentId}) - ${agent.role}`);
});

console.log('\n🎯 Signal Types:');
const signalTypes = getAllSignalTypes();
signalTypes.forEach(type => {
  const metadata = getSignalMetadata(type);
  console.log(`   ${metadata?.glyph} ${type} - ${metadata?.description} [${metadata?.priority}]`);
});

console.log('\n🧪 Testing Signal Creation and Validation:\n');

// 2. Create valid signals for different agents
console.log('✅ Creating valid signals:');

// Example agent signal
const exampleResult = emitSignal('template_log', 'agent-xxx', {
  details: { test: 'demonstration' }
});

// Theron archival signal
const theronResult = emitSignal('archival', 'agent-000', {
  details: { anomalyType: 'wallet_cluster', severity: 'medium' }
});

// LaunchTracker signal
const launchResult = emitSignal('launch_detected', 'agent-launch', {
  confidence: 0.95,
  details: { 
    sourceExchange: 'binance',
    bundleCount: 7,
    fundingAmount: 50000
  }
});

console.log('\n❌ Testing invalid signal:');

// Try to create an invalid signal (missing required fields)
try {
  const invalidSignal = createStandardSignal('launch_detected', 'agent-launch', {
    // Missing confidence (required field)
    details: { test: 'invalid' }
  });
  
  const validation = validateSignal(invalidSignal);
  if (!validation.valid) {
    console.log('   Validation caught errors:', validation.errors);
  }
} catch (error) {
  console.log('   Error creating signal:', error instanceof Error ? error.message : 'Unknown error');
}

console.log('\n📊 Agent Statistics:');

// 3. Show statistics for each agent
agents.forEach(agent => {
  const supportedSignals = getAgentSignalTypes(agent.agentId);
  console.log(`   ${agent.glyph} ${agent.agentName}:`);
  console.log(`     Signal Types: ${supportedSignals.join(', ')}`);
  console.log(`     Total Types: ${supportedSignals.length}`);
});

console.log('\n🔍 Signal Schema Examples:');

// 4. Show schema for a complex signal type
const launchMetadata = getSignalMetadata('launch_detected');
if (launchMetadata) {
  console.log(`\n   ${launchMetadata.glyph} ${launchMetadata.type} Schema:`);
  console.log(`     Required: ${launchMetadata.schema.required.join(', ')}`);
  console.log(`     Optional: ${launchMetadata.schema.optional.join(', ')}`);
  console.log(`     Example:`, JSON.stringify(launchMetadata.schema.examples, null, 2));
}

console.log('\n✨ Registry demonstration complete!');
console.log('   The signal registry provides standardized metadata,');
console.log('   validation, and consistent signal structures across');
console.log('   the entire Eremos agent ecosystem.'); 