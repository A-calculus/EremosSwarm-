//Centralized Agent Exports: Main export file for all agents and signal registry components

//Individual agent exports
export { ExampleAgent } from './example';
export { Theron } from './theron';
export { LaunchTracker } from './launchtracker';
export { GhostWatcher } from './skieró';
export { Harvester } from './harvester';
export { Observer } from './observer';

//New specialized agents
export { LiquidityAgent } from './liquidity-agent';
export { ScamSentinel } from './scam-sentinel';
export { FeeAnalyzer } from './fee-analyzer';
export { ZKPAgent } from './zkp-agent';

//Enhanced agents with memory integration
export { TheronEnhanced } from './theron-enhanced';
export { ObserverEnhanced } from './observer-enhanced';
export { HarvesterEnhanced } from './harvester-enhanced';

//Import statements for collective array
import { ExampleAgent } from './example';
import { Theron } from './theron';
import { LaunchTracker } from './launchtracker';
import { GhostWatcher } from './skieró';
import { Harvester } from './harvester';
import { Observer } from './observer';
import { LiquidityAgent } from './liquidity-agent';
import { ScamSentinel } from './scam-sentinel';
import { FeeAnalyzer } from './fee-analyzer';
import { ZKPAgent } from './zkp-agent';

//Collective agent array for iteration
export const agents = [
  ExampleAgent,
  Theron,
  LaunchTracker,
  GhostWatcher,
  Harvester,
  Observer,
  LiquidityAgent,
  ScamSentinel,
  FeeAnalyzer,
  ZKPAgent
];

//Signal registry exports
export {
  SIGNAL_REGISTRY,
  validateSignal,
  createStandardSignal,
  getAgentSignalTypes,
  getSignalMetadata,
  getAllSignalTypes,
  type SignalMetadata,
  type SignalSchema,
  type StandardSignal
} from './signal-registry'; 