# Signal Registry

The Eremos Signal Registry provides a centralized system for managing signal metadata, schemas, and agent glyph mappings. This ensures all agents adhere to a unified signal structure across the ecosystem.

## Table of Contents
- [Overview](#overview)
- [Signal Types](#signal-types)
- [Glyph Mappings](#glyph-mappings)
- [API Endpoints](#api-endpoints)
- [Custom Signal Registration](#custom-signal-registration)
- [Examples](#examples)

## Overview

The signal registry consists of:
- **Signal Metadata**: Type definitions, schemas, and validation rules
- **Glyph Mappings**: Agent-to-glyph associations and lookup functions
- **Validation System**: Automatic schema validation and type checking
- **REST API**: Endpoints for querying signal data programmatically

## Signal Types

All registered signal types with their metadata:

| Glyph | Signal Type | Agent | Priority | Category | Description |
|-------|-------------|-------|----------|----------|-------------|
| `x` | template_log | Example | low | template | Template signal for reference implementation |
| `Ϸ` | archival | Theron | medium | archival | Archival signal for anomaly storage |
| `L` | launch_detected | LaunchTracker | high | detection | High-confidence token launch detection |
| `ψ` | wallet_reactivated | Skieró | medium | detection | Long-dormant wallet reactivation |
| `λ` | mint_spike_detected | Harvester | medium | monitoring | High-volume mint activity detection |
| `φ` | cluster_detected | Observer | medium | monitoring | Unusual wallet clustering detection |

### Signal Schema Structure

Each signal type includes:
- **Required Fields**: Must be present for validation to pass
- **Optional Fields**: Additional data that can be included
- **Data Types**: Type definitions for validation
- **Examples**: Sample data showing proper structure

## Glyph Mappings

Agent glyph associations and their meanings:

| Glyph | Agent | ID | Role | Signal Types |
|-------|-------|----|----- |-------------|
| `x` | Example | agent-xxx | template | template_log |
| `Ϸ` | Theron | agent-000 | memory_vault | archival |
| `L` | LaunchTracker | agent-launch | launch_monitor | launch_detected |
| `ψ` | Skieró | agent-022 | dormant_wallet_monitor | wallet_reactivated |
| `λ` | Harvester | agent-harvester | indexing | mint_spike_detected |
| `φ` | Observer | agent-observer | surveillance | cluster_detected |

## API Endpoints

The signal registry provides REST endpoints for programmatic access:

### Base URL
```
http://localhost:3000
```

### Available Endpoints

#### Health Check
```http
GET /health
```
Returns API status and service information.

#### Get All Signal Types
```http
GET /signals/registry
```
Returns all registered signal types with complete metadata.

**Response:**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "type": "launch_detected",
      "agentId": "agent-launch",
      "glyph": "L",
      "description": "High-confidence token launch detection signal",
      "category": "detection",
      "priority": "high",
      "schema": { ... }
    }
  ]
}
```

#### Get Specific Signal Metadata
```http
GET /signals/registry/:type
```
Returns metadata for a specific signal type.

**Example:**
```http
GET /signals/registry/launch_detected
```

#### Get All Agent Glyphs
```http
GET /signals/glyphs
```
Returns all agent glyph mappings.

#### Get Specific Agent Glyph
```http
GET /signals/glyphs/:agentId
```
Returns glyph information for a specific agent.

**Example:**
```http
GET /signals/glyphs/agent-launch
```

#### Get Agent's Signal Types
```http
GET /signals/agent/:agentId
```
Returns all signal types associated with an agent.

#### Get Registry Statistics
```http
GET /signals/stats
```
Returns comprehensive statistics about the signal registry.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSignalTypes": 6,
    "totalAgents": 6,
    "categoryBreakdown": {
      "detection": 2,
      "monitoring": 2,
      "archival": 1,
      "template": 1
    },
    "priorityBreakdown": {
      "high": 1,
      "medium": 4,
      "low": 1
    },
    "agents": [...]
  }
}
```

## Custom Signal Registration

### Step 1: Define Signal Metadata

Create metadata for your custom signal type:

```typescript
import { SignalMetadata } from '../agents/signal-registry';

const customSignalMetadata: SignalMetadata = {
  type: 'my_custom_signal',
  agentId: 'agent-custom',
  glyph: '⚡',
  description: 'Custom signal for specialized detection',
  category: 'detection',
  priority: 'medium',
  schema: {
    required: ['agent', 'type', 'glyph', 'hash', 'timestamp'],
    optional: ['details', 'customField'],
    dataTypes: {
      agent: 'string',
      type: 'string',
      glyph: 'string',
      hash: 'string',
      timestamp: 'string',
      customField: 'number',
      details: 'object'
    },
    examples: {
      agent: 'CustomAgent',
      type: 'my_custom_signal',
      glyph: '⚡',
      hash: 'sig_custom_abc',
      timestamp: '2025-01-01T00:00:00.000Z',
      customField: 42
    }
  }
};
```

### Step 2: Register Agent Glyph

Add your agent to the glyph registry:

```typescript
import { AGENT_GLYPHS } from '../types/glyphs';

AGENT_GLYPHS['agent-custom'] = {
  agentId: 'agent-custom',
  agentName: 'CustomAgent',
  glyph: '⚡',
  role: 'custom_detection',
  signalTypes: ['my_custom_signal'],
  description: 'Specialized agent for custom detection patterns'
};
```

### Step 3: Register Signal Type

Add your signal to the registry:

```typescript
import { SIGNAL_REGISTRY } from '../agents/signal-registry';

SIGNAL_REGISTRY['my_custom_signal'] = customSignalMetadata;
```

### Step 4: Create Agent Implementation

```typescript
import { Agent } from '../types/agent';
import { emitSignal } from '../utils/signal-emitter';

export const CustomAgent: Agent = {
  id: "agent-custom",
  name: "CustomAgent",
  role: "custom_detection",
  watchType: "custom_activity",
  glyph: "⚡",
  triggerThreshold: 5,
  lastSignal: null,
  originTimestamp: new Date().toISOString(),
  description: "Specialized agent for custom detection patterns",

  observe: (event) => {
    if (event?.type === "custom_activity") {
      emitSignal('my_custom_signal', 'agent-custom', {
        details: { customField: event.value },
        confidence: 0.8
      });
    }
  },

  getMemory: () => {
    return ["custom_memory_1", "custom_memory_2"];
  }
};
```

## Examples

### Basic Signal Creation

```typescript
import { createStandardSignal, validateSignal } from '../agents';

// Create a signal
const signal = createStandardSignal('launch_detected', 'agent-launch', {
  confidence: 0.95,
  details: {
    sourceExchange: 'binance',
    bundleCount: 7,
    fundingAmount: 50000
  }
});

// Validate the signal
const validation = validateSignal(signal);
if (validation.valid) {
  console.log('Signal is valid:', signal);
} else {
  console.error('Validation errors:', validation.errors);
}
```

### Signal Emission with Validation

```typescript
import { emitSignal } from '../utils/signal-emitter';

// Emit a validated signal
const result = emitSignal('wallet_reactivated', 'agent-022', {
  confidence: 0.78,
  details: {
    walletAge: 365,
    lastActivity: '2024-01-01T00:00:00.000Z'
  }
});

if (result.success) {
  console.log('Signal emitted successfully:', result.signal);
} else {
  console.error('Emission failed:', result.errors);
}
```

### Querying the Registry

```typescript
import { 
  getAllSignalTypes,
  getSignalMetadata,
  getAgentSignalTypes 
} from '../agents';

// Get all signal types
const allTypes = getAllSignalTypes();
console.log('All signal types:', allTypes);

// Get metadata for a specific signal
const metadata = getSignalMetadata('launch_detected');
console.log('Launch detected metadata:', metadata);

// Get signal types for an agent
const agentSignals = getAgentSignalTypes('agent-000');
console.log('Theron signal types:', agentSignals);
```

```

## Validation Rules

### Required Fields
All signals must include:
- `agent`: String identifying the emitting agent
- `type`: String matching a registered signal type
- `glyph`: String matching the agent's glyph
- `hash`: Unique string identifier for the signal
- `timestamp`: ISO 8601 timestamp string

### Data Type Validation
The registry validates:
- Field presence (required vs optional)
- Data types (string, number, boolean, object, array)
- Signal type existence in registry
- Agent-signal type associations

### Priority Levels
- `critical`: Immediate attention required
- `high`: Important signals requiring prompt review
- `medium`: Standard operational signals
- `low`: Informational or template signals

### Categories
- `detection`: Active threat or opportunity detection
- `monitoring`: Ongoing surveillance and tracking
- `alert`: Immediate notification signals
- `archival`: Historical data storage
- `template`: Reference implementations

## Testing

Run validation tests:
```bash
npm run validate
npm test
```

Start the API server:
```bash
npm run api
```

Run signal registry demonstration:
```bash
npm run demo:registry
``` 