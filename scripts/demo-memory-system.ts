//Memory System Demonstration: Shows agent state tracking and memory logging

import { TheronEnhanced } from "../agents/theron-enhanced";
import { ObserverEnhanced } from "../agents/observer-enhanced";
import { HarvesterEnhanced } from "../agents/harvester-enhanced";
import { 
  generateMemorySnapshot,
  getMemoryStatistics,
  queryMemoryEntries 
} from "../utils/memory-logger";

console.log(" Eremos Memory System Demonstration\n");

//Simulate events for different agents
console.log(" Simulating Agent Activities...\n");

//Theron processing anomalies
console.log("🔹 Theron - Processing Anomalies:");
TheronEnhanced.observe({
  type: "anomaly",
  anomalyType: "wallet_cluster",
  severity: "high",
  source: "blockchain_monitor",
  patterns: ["rapid_transfers", "circular_transactions"]
});

TheronEnhanced.observe({
  type: "anomaly", 
  anomalyType: "contract_spawn",
  severity: "medium",
  source: "deploy_watcher"
});

//Observer detecting clusters
console.log("\n🔹 Observer - Detecting Wallet Clusters:");
ObserverEnhanced.observe({
  type: "wallet_activity",
  cluster: ["0xabc123", "0xdef456", "0x789ghi", "0xjkl012", "0xmno345"],
  suspiciousActivity: true,
  riskScore: 0.85,
  timeWindow: "2h"
});

ObserverEnhanced.observe({
  type: "wallet_activity",
  cluster: ["0xpqr678", "0xstu901"],
  suspiciousActivity: false,
  riskScore: 0.2
});

//Harvester indexing mint activity
console.log("\n🔹 Harvester - Indexing Mint Activity:");
HarvesterEnhanced.observe({
  type: "mint_activity",
  amount: 25,
  collection: "BoredApes",
  priceFloor: 2.5,
  volume24h: 1250,
  uniqueMintersCount: 18
});

HarvesterEnhanced.observe({
  type: "mint_activity",
  amount: 5, //Below threshold
  collection: "CryptoPunks",
  priceFloor: 80
});

//Wait a moment for processing
setTimeout(() => {
  console.log("\n📊 Memory System Analysis:\n");

  //Show memory statistics
  const stats = getMemoryStatistics();
  console.log("🔍 Overall Memory Statistics:");
  console.log(`   Total Agents: ${stats.totalAgents}`);
  console.log(`   Active Agents: ${stats.activeAgents}`);
  console.log(`   Total Memory Entries: ${stats.totalMemoryEntries}`);
  console.log(`   Total Signals: ${stats.totalSignals}`);
  console.log(`   Total Events: ${stats.totalEvents}`);
  console.log(`   Avg Entries/Agent: ${stats.memoryUsage.entriesPerAgent.toFixed(1)}`);

  //Show detailed snapshots for each agent
  console.log("\n📸 Agent Memory Snapshots:\n");

  //Theron snapshot
  const theronSnapshot = generateMemorySnapshot("agent-000");
  if (theronSnapshot) {
    console.log(`🔹 ${theronSnapshot.agentName} Memory Snapshot:`);
    console.log(`   Status: ${theronSnapshot.state.currentStatus}`);
    console.log(`   Events Processed: ${theronSnapshot.state.totalEventsProcessed}`);
    console.log(`   Signals Emitted: ${theronSnapshot.state.totalSignalsEmitted}`);
    console.log(`   Success Rate: ${theronSnapshot.statistics.successRate * 100}%`);
    console.log(`   Avg Processing Time: ${theronSnapshot.statistics.avgProcessingTime}ms`);
    console.log(`   Recent Memory:`);
    theronSnapshot.memoryEntries.slice(-3).forEach(entry => {
      console.log(`     • ${entry.type}: ${entry.timestamp.slice(11, 19)}`);
    });
  }

  //Observer snapshot
  const observerSnapshot = generateMemorySnapshot("agent-observer");
  if (observerSnapshot) {
    console.log(`\n🔹 ${observerSnapshot.agentName} Memory Snapshot:`);
    console.log(`   Status: ${observerSnapshot.state.currentStatus}`);
    console.log(`   Events Processed: ${observerSnapshot.state.totalEventsProcessed}`);
    console.log(`   Signals Emitted: ${observerSnapshot.state.totalSignalsEmitted}`);
    console.log(`   Success Rate: ${observerSnapshot.statistics.successRate * 100}%`);
    console.log(`   Clusters Detected: ${observerSnapshot.state.metadata?.clustersDetected || 0}`);
    console.log(`   Recent Events:`);
    observerSnapshot.recentEvents.slice(-2).forEach(event => {
      console.log(`     • ${event.eventType} [${event.outcome}]: ${event.timestamp.slice(11, 19)}`);
    });
  }

  //Harvester snapshot
  const harvesterSnapshot = generateMemorySnapshot("agent-harvester");
  if (harvesterSnapshot) {
    console.log(`\n🔹 ${harvesterSnapshot.agentName} Memory Snapshot:`);
    console.log(`   Status: ${harvesterSnapshot.state.currentStatus}`);
    console.log(`   Events Processed: ${harvesterSnapshot.state.totalEventsProcessed}`);
    console.log(`   Signals Emitted: ${harvesterSnapshot.state.totalSignalsEmitted}`);
    console.log(`   Success Rate: ${harvesterSnapshot.statistics.successRate * 100}%`);
    console.log(`   Mints Indexed: ${harvesterSnapshot.state.metadata?.totalMintsIndexed || 0}`);
    console.log(`   Spikes Detected: ${harvesterSnapshot.state.metadata?.spikesDetected || 0}`);
    console.log(`   Recent Signals:`);
    harvesterSnapshot.recentSignals.forEach(signal => {
      console.log(`     • ${signal.signalType}: ${signal.timestamp.slice(11, 19)} [${signal.success ? 'SUCCESS' : 'FAILED'}]`);
    });
  }

  //Query recent memory entries
  console.log("\n🔍 Recent Memory Entries Across All Agents:");
  const recentEntries = queryMemoryEntries({ limit: 5 });
  recentEntries.forEach(entry => {
    console.log(`   ${entry.timestamp.slice(11, 19)} | ${entry.agentId} | ${entry.type}`);
  });

  //Show enhanced getMemory() output
  console.log("\n🧠 Enhanced Agent Memory Output:\n");

  console.log("🔹 Theron Enhanced Memory:");
  if (TheronEnhanced.getMemory) {
    const theronMemory = TheronEnhanced.getMemory();
    if (theronMemory) {
      theronMemory.forEach(item => console.log(`   ${item}`));
    }
  }

  console.log("\n🔹 Observer Enhanced Memory:");
  if (ObserverEnhanced.getMemory) {
    const observerMemory = ObserverEnhanced.getMemory();
    if (observerMemory) {
      observerMemory.forEach(item => console.log(`   ${item}`));
    }
  }

  console.log("\n🔹 Harvester Enhanced Memory:");
  if (HarvesterEnhanced.getMemory) {
    const harvesterMemory = HarvesterEnhanced.getMemory();
    if (harvesterMemory) {
      harvesterMemory.forEach(item => console.log(`   ${item}`));
    }
  }

  console.log("\n✨ Memory System Demonstration Complete!");
  console.log("   The memory logging system provides comprehensive tracking of:");
  console.log("   • Agent states and status changes");
  console.log("   • Signal emissions with success/failure tracking");
  console.log("   • Event processing with performance metrics");
  console.log("   • Historical data with queryable interface");
  console.log("   • Real-time statistics and analytics");

}, 100); 