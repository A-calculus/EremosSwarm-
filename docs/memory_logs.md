# Memory Logs

The Eremos Memory Logging System provides comprehensive tracking and querying capabilities for agent states, historical signals, and events processed. This system enables real-time monitoring, performance analysis, and forensic investigation of agent behaviors.

## Table of Contents
- [Overview](#overview)
- [Memory Architecture](#memory-architecture)
- [API Endpoints](#api-endpoints)
- [Agent Memory Details](#agent-memory-details)
- [Usage Examples](#usage-examples)
- [Memory Types](#memory-types)
- [Performance Monitoring](#performance-monitoring)
- [Troubleshooting](#troubleshooting)

## Overview

The memory logging system captures three primary types of data:
- **Agent States**: Real-time status, counters, and metadata
- **Signal Emissions**: Success/failure tracking with performance metrics
- **Event Processing**: Detailed logs of all processed events with outcomes

### Key Features
- ✅ Real-time agent state tracking
- ✅ Historical data with queryable interface
- ✅ Performance metrics and analytics
- ✅ Automatic memory management with smart limits
- ✅ REST API for programmatic access
- ✅ Comprehensive snapshots and statistics

## Memory Architecture

### Data Storage
```
Memory System
├── Agent States (Map<agentId, AgentState>)
├── Memory Entries (Map<agentId, MemoryEntry[]>)
├── Signal Memories (Map<agentId, SignalMemory[]>)
└── Event Memories (Map<agentId, EventMemory[]>)
```

### Memory Limits
- **Memory Entries**: 1000 per agent (oldest removed first)
- **Signal Memories**: 500 per agent
- **Event Memories**: 500 per agent
- **Cleanup**: Configurable (default 7 days)

### Memory Types

#### AgentState
```typescript
interface AgentState {
  agentId: string;
  agentName: string;
  currentStatus: 'active' | 'idle' | 'processing' | 'error';
  lastActivity: string;
  totalEventsProcessed: number;
  totalSignalsEmitted: number;
  triggerCount: number;
  uptime: number;
  metadata?: Record<string, any>;
}
```

#### MemoryEntry
```typescript
interface MemoryEntry {
  id: string;
  agentId: string;
  timestamp: string;
  type: 'event_processed' | 'signal_emitted' | 'state_change' | 'error';
  data: any;
  hash: string;
}
```

#### SignalMemory
```typescript
interface SignalMemory {
  signalId: string;
  agentId: string;
  signalType: string;
  glyph: string;
  timestamp: string;
  confidence?: number;
  success: boolean;
  processingTime: number;
  details?: Record<string, any>;
}
```

## API Endpoints

### Base URL
```
http://localhost:3000/agents
```

### Agent Management

#### Get All Agents
```http
GET /agents/
```
Returns overview of all registered agents with their current states.

**Response:**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "agentId": "agent-000",
      "agentName": "Theron",
      "glyph": "Ϸ",
      "role": "memory_vault",
      "state": { ... },
      "hasMemoryData": true
    }
  ]
}
```

#### Get Specific Agent
```http
GET /agents/:agentId
```
Returns detailed state information for a specific agent.

**Example:**
```http
GET /agents/agent-000
```

**Response:**
```json
{
  "success": true,
  "agentId": "agent-000",
  "agentName": "Theron",
  "glyph": "Ϸ",
  "role": "memory_vault",
  "hasMemoryData": true,
  "state": {
    "currentStatus": "active",
    "totalEventsProcessed": 25,
    "totalSignalsEmitted": 12,
    "triggerCount": 8,
    "lastActivity": "2025-01-26T10:30:00.000Z",
    "metadata": { ... }
  }
}
```

### Memory Queries

#### Get Agent Memory Logs
```http
GET /agents/memory/:agentId
```
Query memory entries for a specific agent with filtering options.

**Query Parameters:**
- `type` (optional): Filter by entry type
- `startTime` (optional): ISO timestamp filter
- `endTime` (optional): ISO timestamp filter  
- `limit` (optional): Number of entries (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Example:**
```http
GET /agents/memory/agent-000?type=signal_emitted&limit=10
```

**Response:**
```json
{
  "success": true,
  "agentId": "agent-000",
  "agentName": "Theron",
  "glyph": "Ϸ",
  "query": {
    "type": "signal_emitted",
    "startTime": "beginning",
    "endTime": "now",
    "limit": 10,
    "offset": 0
  },
  "count": 8,
  "hasMoreData": false,
  "currentState": { ... },
  "data": [
    {
      "id": "mem_1643203200_abc123",
      "agentId": "agent-000",
      "timestamp": "2025-01-26T10:30:00.000Z",
      "type": "signal_emitted",
      "data": {
        "signalType": "archival",
        "success": true,
        "confidence": 0.95
      },
      "hash": "sig_abc123"
    }
  ]
}
```

#### Get Agent Memory Snapshot
```http
GET /agents/snapshot/:agentId
```
Generate comprehensive memory snapshot with statistics.

**Example:**
```http
GET /agents/snapshot/agent-000
```

**Response:**
```json
{
  "success": true,
  "agentId": "agent-000",
  "agentName": "Theron",
  "hasMemoryData": true,
  "snapshot": {
    "agentId": "agent-000",
    "agentName": "Theron",
    "snapshotTime": "2025-01-26T10:30:00.000Z",
    "state": { ... },
    "recentSignals": [ ... ],
    "recentEvents": [ ... ],
    "memoryEntries": [ ... ],
    "statistics": {
      "signalsToday": 5,
      "eventsToday": 12,
      "avgProcessingTime": 25.5,
      "successRate": 0.96
    }
  }
}
```

### Cross-Agent Queries

#### Search Memory Across All Agents
```http
GET /agents/memory/search
```
Search memory entries across all agents with filtering.

**Query Parameters:**
- `type` (optional): Filter by entry type
- `startTime` (optional): ISO timestamp filter
- `endTime` (optional): ISO timestamp filter
- `limit` (optional): Number of entries (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Example:**
```http
GET /agents/memory/search?type=error&limit=20
```

#### Get Recent Activity
```http
GET /agents/activity/recent
```
Get recent memory entries across all agents.

**Query Parameters:**
- `limit` (optional): Number of entries (default: 20)

#### Get Memory Statistics
```http
GET /agents/memory/stats
```
Comprehensive statistics across the entire memory system.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAgents": 6,
    "activeAgents": 4,
    "totalMemoryEntries": 1250,
    "totalSignals": 340,
    "totalEvents": 890,
    "registeredAgents": 6,
    "memoryUsage": {
      "states": 6,
      "entriesPerAgent": 208.3,
      "signalsPerAgent": 56.7,
      "eventsPerAgent": 148.3
    },
    "agentDetails": [
      {
        "agentId": "agent-000",
        "agentName": "Theron",
        "glyph": "Ϸ",
        "role": "memory_vault",
        "currentStatus": "active",
        "totalEvents": 125,
        "totalSignals": 45,
        "lastActivity": "2025-01-26T10:30:00.000Z"
      }
    ]
  }
}
```

## Agent Memory Details

### Enhanced Agents

The memory system includes enhanced versions of core agents:

#### Theron Enhanced (`agent-000`)
- **Role**: Memory vault and anomaly archival
- **Glyph**: `Ϸ`
- **Memory Features**:
  - Archives anomalies with comprehensive tracking
  - Tracks anomaly types, severity levels, and sources
  - Measures archival processing time and success rates
  - Maintains archival count and pattern analysis

**Enhanced Memory Output:**
```
memory_fragments: 19
signals_archived: 2
events_processed: 2
current_status: active
success_rate: 100%
avg_processing: 3ms
recent_signal: archival [14:29:19]
```

#### Observer Enhanced (`agent-observer`)
- **Role**: Surveillance and cluster detection
- **Glyph**: `φ`
- **Memory Features**:
  - Tracks wallet clustering with detailed metrics
  - Monitors cluster sizes, risk scores, and suspicious activity
  - Records surveillance events and detection outcomes
  - Calculates average cluster sizes and risk assessments

**Enhanced Memory Output:**
```
surveillance_status: idle
clusters_detected: 1
events_monitored: 2
avg_cluster_size: 4
last_risk_score: 0.85
success_rate: 100%
today_events: 2
```

#### Harvester Enhanced (`agent-harvester`)
- **Role**: Indexing and mint activity tracking
- **Glyph**: `λ`
- **Memory Features**:
  - Indexes mint activity with performance tracking
  - Tracks mint counts, collections, and spike detection
  - Records processing efficiency and throughput metrics
  - Monitors unique collections and volume patterns

**Enhanced Memory Output:**
```
indexing_status: idle
total_mints_indexed: 30
spikes_detected: 1
collections_tracked: 1
avg_mint_size: 18
success_rate: 100%
avg_processing: 1.5ms
```

## Usage Examples

### Basic Agent State Query
```bash
# Get Theron's current state
curl http://localhost:3000/agents/agent-000

# Get all agents overview
curl http://localhost:3000/agents/
```

### Memory Log Queries
```bash
# Get recent memory entries for Theron
curl http://localhost:3000/agents/memory/agent-000?limit=10

# Get error entries from last hour
curl "http://localhost:3000/agents/memory/agent-000?type=error&startTime=2025-01-26T09:30:00Z"

# Get comprehensive snapshot
curl http://localhost:3000/agents/snapshot/agent-000
```

### Cross-Agent Analysis
```bash
# Search for errors across all agents
curl "http://localhost:3000/agents/memory/search?type=error&limit=50"

# Get recent activity across all agents
curl "http://localhost:3000/agents/activity/recent?limit=30"

# Get system-wide statistics
curl http://localhost:3000/agents/memory/stats
```

### Filtering and Pagination
```bash
# Get signals from specific time range
curl "http://localhost:3000/agents/memory/agent-harvester?type=signal_emitted&startTime=2025-01-26T00:00:00Z&endTime=2025-01-26T12:00:00Z"

# Paginate through large result sets
curl "http://localhost:3000/agents/memory/search?limit=100&offset=200"
```

## Performance Monitoring

### Key Metrics Tracked
- **Processing Time**: Millisecond precision for all operations
- **Success Rates**: Signal emission and event processing success percentages
- **Throughput**: Events and signals processed per time period
- **Error Rates**: Failed operations and error categorization
- **Resource Usage**: Memory consumption and entry counts

### Real-time Monitoring
```bash

# Check system health
curl http://localhost:3000/agents/activity/recent?limit=5
```

### Performance Analysis
```bash

# Monitor success rates
curl http://localhost:3000/agents/snapshot/agent-observer | jq '.snapshot.statistics.successRate'
```

## Memory Types Reference

### Entry Types
- `event_processed`: Agent processed an incoming event
- `signal_emitted`: Agent emitted a signal
- `state_change`: Agent state was updated
- `error`: Error occurred during processing

### Agent Status Values
- `idle`: Agent is waiting for events
- `active`: Agent recently processed events
- `processing`: Agent is currently processing
- `error`: Agent encountered an error

### Query Filters
- **Time-based**: ISO 8601 timestamps for start/end filtering
- **Type-based**: Filter by memory entry types
- **Pagination**: Limit and offset for large datasets
- **Agent-specific**: Target individual agents or search globally

## Troubleshooting

### Common Issues

#### No Memory Data
```json
{
  "success": true,
  "agentId": "agent-xxx",
  "hasMemoryData": false,
  "message": "Agent exists but has no memory data yet"
}
```
**Solution**: Agent hasn't processed any events yet. Trigger some activity or check if the agent is properly initialized.

#### Agent Not Found
```json
{
  "success": false,
  "error": "Agent not found",
  "message": "Agent 'invalid-id' is not registered"
}
```
**Solution**: Check agent ID spelling or use `GET /agents/` to see all registered agents.

#### Empty Results
```json
{
  "success": true,
  "count": 0,
  "data": []
}
```
**Solution**: Adjust query parameters (time range, type filter) or check if the agent has been active in the specified period.

### Debugging Commands
```bash
# Check if API server is running
curl http://localhost:3000/health

# Verify agent registration
curl http://localhost:3000/agents/ | jq '.data[].agentId'

# Check recent system activity
curl http://localhost:3000/agents/activity/recent?limit=1

# Monitor memory usage
curl http://localhost:3000/agents/memory/stats | jq '.data.memoryUsage'
```

### Performance Optimization

#### Memory Management
- Automatic cleanup removes entries older than 7 days
- Smart limits prevent memory overflow
- Efficient querying with pagination support

#### Best Practices
- Use time-based filtering for large datasets
- Implement proper pagination for UI applications
- Monitor memory statistics regularly
- Set appropriate query limits based on use case

## Integration Examples

### Dashboard Integration
```javascript
// Real-time agent status dashboard
async function fetchAgentStatus() {
  const response = await fetch('/agents/');
  const data = await response.json();
  return data.data.map(agent => ({
    name: agent.agentName,
    status: agent.state?.currentStatus || 'no-data',
    lastActivity: agent.state?.lastActivity
  }));
}
```

### Monitoring Script
```javascript
// Automated monitoring with alerts
async function checkAgentHealth() {
  const stats = await fetch('/agents/memory/stats').then(r => r.json());
  const errors = await fetch('/agents/memory/search?type=error&limit=10').then(r => r.json());
  
  if (stats.data.activeAgents < stats.data.totalAgents * 0.8) {
    console.warn('Low agent activity detected');
  }
  
  if (errors.totalEntries > 0) {
    console.error(`${errors.totalEntries} recent errors detected`);
  }
}
```

The memory logging system provides comprehensive visibility into agent operations, enabling effective monitoring, debugging, and performance optimization across the Eremos ecosystem. 