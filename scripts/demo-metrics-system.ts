//Metrics System Demo: Tests the global metrics tracking system with specialized agents

import { LiquidityAgent, LiquidityEvent } from '../agents/liquidity-agent';
import { ScamSentinel, ScamEvent } from '../agents/scam-sentinel';
import { FeeAnalyzer, FeeEvent } from '../agents/fee-analyzer';
import { ZKPAgent, ZKPEvent } from '../agents/zkp-agent';
import { 
  getAgentMetrics, 
  getAllAgentMetrics, 
  getSystemMetricsSnapshot,
  recordEventProcessing,
  recordSignalEmission
} from '../utils/agent-metrics';

console.log(' Eremos Metrics System Demonstration\n');

// Simulate Liquidity Agent activity
console.log('\n💧 Testing Liquidity Agent metrics:');
const liquidityEvent: LiquidityEvent = {
  type: 'liquidity_change',
  poolAddress: '0xPool123...abc',
  tokenPair: 'ETH/USDC',
  liquidityAmount: 5000000,
  priceImpact: 0.02,
  timestamp: new Date().toISOString(),
  details: {
    beforeAmount: 1000000,
    afterAmount: 5000000,
    volumeSpike: true
  }
};

// Process event and manually track metrics since the agent observe method already has tracking
LiquidityAgent.observe(liquidityEvent);

// Simulate some additional metrics for demonstration
recordEventProcessing('Liquidity Agent', 'pool_monitoring', 45, true);
recordSignalEmission('Liquidity Agent', 'liquidity_spike_detected', 12, true, 0.92);
recordEventProcessing('Liquidity Agent', 'vesting_analysis', 38, true);
recordSignalEmission('Liquidity Agent', 'vesting_deviation_detected', 18, true, 0.85);

// Simulate Scam Sentinel activity
console.log('\n🚨 Testing Scam Sentinel metrics:');
const scamEvent: ScamEvent = {
  type: 'mint',
  token: 'SCAM_TOKEN',
  contractAddress: '0xBadContract789...ghi',
  timestamp: new Date().toISOString(),
  details: {
    supply_change: 0.75,
    supply_before: 1000000,
    supply_after: 1750000
  }
};

ScamSentinel.observe(scamEvent);

// Simulate additional metrics
recordEventProcessing('Scam Sentinel', 'supply_analysis', 28, true);
recordSignalEmission('Scam Sentinel', 'rug_pull_detected', 15, true, 0.95);
recordEventProcessing('Scam Sentinel', 'governance_monitoring', 33, true);

// Simulate Fee Analyzer activity
console.log('\n💰 Testing Fee Analyzer metrics:');
const feeEvent: FeeEvent = {
  type: 'fee_spike',
  network: 'ethereum',
  avgFee: 150,
  timestamp: new Date().toISOString(),
  details: {
    previousAvgFee: 25,
    percentChange: 5.0,
    congestionLevel: 0.95
  }
};

FeeAnalyzer.observe(feeEvent);

// Simulate additional metrics
recordEventProcessing('Fee Analyzer', 'fee_monitoring', 22, true);
recordSignalEmission('Fee Analyzer', 'fee_spike_detected', 8, true, 0.88);
recordEventProcessing('Fee Analyzer', 'congestion_analysis', 31, true);

// Simulate ZKP Agent activity
console.log('\n🔐 Testing ZKP Agent metrics:');
const zkpEvent = {
  type: 'proof_verification' as const,
  proofId: 'proof_12345',
  circuitType: 'groth16',
  timestamp: new Date().toISOString(),
  details: {
    verificationResult: false,
    proofSize: 15000,
    gasUsed: 500000,
    computationTime: 2500
  }
};

ZKPAgent.observe(zkpEvent);

// Simulate additional metrics
recordEventProcessing('ZKP Agent', 'proof_verification', 125, true);
recordSignalEmission('ZKP Agent', 'invalid_proof_detected', 42, true, 0.89);
recordEventProcessing('ZKP Agent', 'circuit_analysis', 78, true);

// Add some failure scenarios for realistic metrics
recordEventProcessing('Liquidity Agent', 'error_scenario', 15, false);
recordSignalEmission('Scam Sentinel', 'failed_signal', 5, false);
recordEventProcessing('Fee Analyzer', 'timeout_error', 1000, false);

console.log('\n📈 Generating metrics reports...');

// Wait a moment for metrics to be processed
setTimeout(async () => {

// Display individual agent metrics
console.log('\n🔍 Individual Agent Metrics:');

const agents = ['Liquidity Agent', 'Scam Sentinel', 'Fee Analyzer', 'ZKP Agent'];

for (const agentName of agents) {
  const metrics = getAgentMetrics(agentName);
  if (metrics) {
    console.log(`\n${agentName}:`);
    console.log(`   Total Events: ${metrics.totalEvents}`);
    console.log(`   Total Signals: ${metrics.totalSignals}`);
    console.log(`   Success Rate: ${(metrics.successRate * 100).toFixed(1)}%`);
    console.log(`   Avg Processing: ${metrics.averageProcessingTime.toFixed(1)}ms`);
    console.log(`   Signals/Hour: ${metrics.signalsPerHour.toFixed(1)}`);
    console.log(`   Uptime: ${metrics.uptime.toFixed(2)} hours`);
    console.log(`   Errors: ${metrics.errorCount}`);
    console.log(`   Last Activity: ${metrics.lastActivity}`);
  } else {
    console.log(`\n${agentName}: No metrics available`);
  }
}

// Display system-wide metrics
console.log('\n🌐 System-Wide Metrics:');

const systemSnapshot = getSystemMetricsSnapshot();
console.log(` Total Agents: ${systemSnapshot.totalAgents}`);
console.log(` Active Agents: ${systemSnapshot.activeAgents}`);
console.log(` System Events: ${systemSnapshot.totalSystemEvents}`);
console.log(` System Signals: ${systemSnapshot.totalSystemSignals}`);
console.log(` Avg Performance: ${systemSnapshot.averageSystemPerformance.toFixed(1)}ms`);
console.log(` Top Performer: ${systemSnapshot.topPerformingAgent}`);
console.log(` System Uptime: ${(systemSnapshot.systemUptime / 1000 / 60).toFixed(1)} minutes`);

// Display all metrics summary
console.log('\n📋 All Agent Metrics Summary:');

const allMetrics = getAllAgentMetrics();
for (const [agentName, metrics] of Object.entries(allMetrics)) {
  const recentPerformance = metrics.recentPerformance.slice(-3);
  console.log(`\n${agentName}:`);
  console.log(`  Recent Performance (last 3 operations):`);
  recentPerformance.forEach((perf, idx) => {
    const status = perf.success ? '✅' : '❌';
    console.log(`    ${idx + 1}. ${status} ${perf.eventType} (${perf.processingTime}ms)`);
  });
}

console.log('\n🔗 Available Metrics Endpoints:');
console.log('  GET /metrics/system         - System-wide snapshot');
console.log('  GET /metrics/agent?name=X   - Specific agent metrics');
console.log('  GET /metrics/agents         - All agent metrics');
console.log('  GET /metrics/summary        - Performance summary');
console.log('  GET /metrics/comparison     - Agent comparison');

console.log('\n🚀 Metrics system fully operational!');

}, 100); 