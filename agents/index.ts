export { ExampleAgent } from "./example";
export { Theron } from "./theron";
export { LaunchTracker } from "./launchtracker";
export { GhostWatcher } from "./skieró";
export { Harvester } from "./harvester";
export { Observer } from "./observer";

// Export all agents as an array for easy iteration
import { ExampleAgent } from "./example";
import { Theron } from "./theron";
import { LaunchTracker } from "./launchtracker";
import { GhostWatcher } from "./skieró";
import { Harvester } from "./harvester";
import { Observer } from "./observer";

export const agents = [
  ExampleAgent,
  Theron,
  LaunchTracker,
  GhostWatcher,
  Harvester,
  Observer,
];

// Signal Registry exports
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
} from "./signal-registry"; 