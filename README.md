# Eremos Swarm

**Autonomous swarm agents for early on-chain signal detection**

Eremos is a modular framework for deploying intelligent agents that monitor blockchain activity in real-time. Built for developers who need low-noise, high-confidence signals from the edges of on-chain activity - tracking wallet clusters, token launches, fraud patterns, DeFi liquidity movements, and zero-knowledge proof integrity.

---

## Architecture

### Swarm Intelligence Design

Eremos operates as a **swarm of specialized agents**, each designed for specific blockchain monitoring tasks. The framework addresses the challenge of signal noise in blockchain data by providing focused, intelligent agents that work independently while sharing common infrastructure.

```
┌─────────────────────────────────────────────────────────┐
│                    Eremos Swarm                         │
├─────────────────────────────────────────────────────────┤
│  Core Agents          │  Specialized Agents             │
│  ┌─────────────────┐  │  ┌─────────────────────────────┐ │
│  │ Theron (Ϸ)      │  │  │ Liquidity Agent (§)         │ │
│  │ Observer (φ)     │  │  │ Scam Sentinel (¤)           │ │
│  │ Harvester (λ)    │  │  │ Fee Analyzer (¢)            │ │
│  │ LaunchTracker(L) │  │  │ ZKP Agent (°)               │ │
│  │ GhostWatcher(ψ)  │  │  └─────────────────────────────┘ │
│  └─────────────────────┘  │                               │
└─────────────────────────────────────────────────────────┘
           │                           │
           ▼                           ▼
┌─────────────────────────────────────────────────────────┐
│                Signal Registry                          │
│  • Standardized schemas & validation                   │
│  • Agent glyph mappings                                │
│  • Signal metadata & categorization                    │
└─────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────┐
│              Memory & Analytics Layer                   │
│  • Historical signal tracking                          │
│  • Performance metrics                                 │
│  • Real-time streaming                                 │
│  • Forensic investigation                              │
└─────────────────────────────────────────────────────────┘
```

### Signal-Driven Workflow

```
Event → Agent Processing → Signal Validation → Storage & Streaming → External Systems
  │           │                    │                  │                     │
  ▼           ▼                    ▼                  ▼                     ▼
┌─────┐  ┌─────────┐      ┌──────────────┐   ┌──────────────┐    ┌─────────────┐
│Chain│  │Pattern  │      │Schema        │   │Memory System │    │Dashboards   │
│Data │  │Analysis │      │Validation    │   │Metrics DB    │    │Trading Bots │
│     │  │Filter   │      │Confidence    │   │Stream Feeds  │    │Alert Systems│
└─────┘  └─────────┘      └──────────────┘   └──────────────┘    └─────────────┘
```

---

## Agent Ecosystem

### Core Monitoring Agents

#### **Theron (Ϸ)** - Memory Vault & Anomaly Archival
Addresses the challenge of **signal persistence and anomaly tracking**. Traditional blockchain monitoring loses historical context when signals are processed. Theron solves this by maintaining a comprehensive archive of anomalies with full context, enabling pattern recognition across time periods.

**Enhanced Features:**
- Archives anomalies with comprehensive tracking
- Tracks anomaly types, severity levels, and sources
- Measures archival processing time and success rates
- Maintains archival count and pattern analysis

#### **Observer (φ)** - Wallet Clustering Detection
Solves the problem of **coordinated wallet activity detection**. In complex DeFi operations, related wallets often act in coordination but appear unrelated. Observer identifies unusual clustering patterns that indicate potential market manipulation or coordinated trading strategies.

**Enhanced Features:**
- Tracks wallet clustering with detailed metrics
- Monitors cluster sizes, risk scores, and suspicious activity
- Records surveillance events and detection outcomes
- Calculates average cluster sizes and risk assessments

#### **Harvester (λ)** - Mint Activity Indexing
Addresses **high-frequency mint tracking and spike detection**. During NFT drops or token events, massive mint activity can overwhelm standard monitoring. Harvester efficiently indexes mint patterns and detects volume spikes that indicate significant market events.

**Enhanced Features:**
- Indexes mint activity with performance tracking
- Tracks mint counts, collections, and spike detection
- Records processing efficiency and throughput metrics
- Monitors unique collections and volume patterns

#### **LaunchTracker (L)** - Token Launch Detection
Solves the challenge of **early token launch identification**. Identifying legitimate token launches from CEX-funded wallets vs. potential scams requires sophisticated pattern matching. LaunchTracker analyzes funding sources, deployment patterns, and bundle activity to provide high-confidence launch signals.

#### **GhostWatcher (ψ)** - Dormant Wallet Monitoring
Addresses the problem of **reactivated wallet detection**. Long-dormant wallets suddenly becoming active often signal significant events - returning developers, compromised accounts, or strategic moves. GhostWatcher tracks wallet lifecycle patterns to identify these reactivation events.

### Specialized DeFi & Security Agents

#### **Liquidity Agent (§)** - DeFi Pool Monitoring
Solves **real-time liquidity movement tracking**. DeFi protocols experience rapid liquidity changes that can signal market opportunities or risks. This agent monitors pool dynamics, vesting schedule deviations, and unusual liquidity patterns that traditional tools miss.

**Configuration:**
- **ID**: `agent-liquidity`
- **Role**: `defi_monitoring`
- **Watch Type**: `liquidity_tracking`
- **Trigger Threshold**: 2.0 (200% change threshold)

**Signal Types:**
- `liquidity_spike_detected` - Sudden large liquidity additions (>200% increase)
- `liquidity_drain_detected` - Significant liquidity removals (>50% decrease)
- `vesting_deviation_detected` - Deviations from expected vesting schedules (>15%)
- `high_impact_trade_detected` - Trades with significant price impact (>5%)

**Thresholds:**
- **Liquidity Threshold**: $1,000,000 minimum for spike detection
- **Vesting Deviation**: 15% variance from expected schedule
- **Price Impact**: 5% threshold for high-impact trade alerts
- **Drain Ratio**: 50% removal threshold for drain detection

#### **Scam Sentinel (¤)** - Fraud Detection
Addresses **automated rug-pull and fraud detection**. Manual fraud detection is too slow for fast-moving blockchain scams. Scam Sentinel analyzes token supply changes, governance attacks, ownership transfers, and liquidity removals to automatically detect fraudulent activity.

**Configuration:**
- **ID**: `agent-scam-sentinel`
- **Role**: `fraud_detection`
- **Watch Type**: `scam_detection`
- **Trigger Threshold**: 0.8 (80% confidence threshold)

**Signal Types:**
- `rug_pull_detected` - Massive supply inflation or liquidity removal
- `suspicious_burn_detected` - Large token burns (potential evidence destruction)
- `governance_attack_detected` - Voting power concentration (>49%)
- `ownership_renounced` - Contract ownership renouncement
- `suspicious_ownership_transfer` - Ownership transfers to unknown addresses

**Risk Levels:**
- **Critical**: >100% supply change, >95% liquidity removal
- **High**: 50-100% supply change, 75-95% liquidity removal
- **Medium**: 20-50% supply change, 50-75% liquidity removal
- **Low**: <20% supply change, <50% liquidity removal

#### **Fee Analyzer (¢)** - Transaction Optimization
Solves the problem of **optimal transaction timing**. Network congestion and fee volatility make transaction timing crucial but complex. Fee Analyzer monitors network conditions across multiple chains and identifies optimal execution windows for cost-effective operations.

**Configuration:**
- **ID**: `agent-fee-analyzer`
- **Role**: `fee_optimization`
- **Watch Type**: `fee_monitoring`
- **Trigger Threshold**: 1.5 (50% fee increase threshold)

**Signal Types:**
- `fee_spike_detected` - Significant fee increases (>50%)
- `fee_reduction_detected` - Notable fee decreases (>30%)
- `network_congestion_detected` - High network congestion (>80%)
- `optimal_fee_window` - Identified low-fee time periods

**Supported Networks:**
- **Ethereum**: Primary focus for fee monitoring
- **Polygon**: Layer 2 alternative tracking
- **Solana**: High-throughput network monitoring
- **Arbitrum**: Optimistic rollup fee tracking

#### **ZKP Agent (°)** - Zero-Knowledge Proof Integrity
Addresses **privacy-preserving verification challenges**. As ZK technology grows, detecting fraudulent proofs and circuit manipulation becomes critical. ZKP Agent validates proof integrity, detects behavioral anomalies, and identifies potential privacy violations in zero-knowledge systems.

**Configuration:**
- **ID**: `agent-zkp-analyzer`
- **Role**: `privacy_analysis`
- **Watch Type**: `zkp_verification`
- **Trigger Threshold**: 0.7 (70% suspicion threshold)

**Signal Types:**
- `invalid_proof_detected` - Failed proof verification
- `proof_bloating_detected` - Unusually large proof sizes (>10KB)
- `circuit_complexity_anomaly` - Excessive circuit constraints (>1M)
- `suspicious_zkp_behavior` - Behavioral patterns indicating fraud
- `proof_farming_detected` - Repeated identical proofs (>10 repeats)
- `privacy_violation_detected` - Potential data leakage in circuits

**Supported Circuit Types:**
- **PLONK**: Universal SNARKs with preprocessing
- **Groth16**: Efficient pairing-based SNARKs
- **STARK**: Scalable transparent arguments
- **Bulletproofs**: Range proofs without trusted setup

---

## Problems Solved

### 🔍 **Signal Standardization Challenge**
**Problem**: Inconsistent signal formats across different monitoring tools lead to integration difficulties and misinterpretation.
**Solution**: Centralized signal registry with enforced schemas, validation rules, and standardized metadata. Every signal follows the same structure, making integration seamless.

### 📊 **Historical Context Loss**
**Problem**: Most blockchain monitoring provides real-time data but loses historical context needed for pattern recognition.
**Solution**: Comprehensive memory system that tracks agent states, signal history, and event processing over time. Enables forensic investigation and pattern analysis.

### ⚡ **Performance Bottleneck Identification**
**Problem**: Unknown performance issues in complex monitoring systems make optimization difficult.
**Solution**: Built-in metrics tracking for every agent operation - processing times, success rates, error patterns. Identifies bottlenecks before they impact operations.

### 🔄 **Real-Time Integration Barriers**
**Problem**: Building real-time dashboards and automated systems requires complex integration with monitoring tools.
**Solution**: Server-sent event streams with advanced filtering provide real-time signal feeds that integrate directly into existing systems via standard web APIs.

### 🎯 **Signal Accuracy & Confidence**
**Problem**: False positives and unclear confidence levels make automated decision-making risky.
**Solution**: Confidence scoring system and detailed signal metadata enable intelligent filtering and automated responses based on signal quality.

### 🏗️ **Custom Agent Development Complexity**
**Problem**: Creating specialized monitoring agents requires extensive blockchain expertise and infrastructure development.
**Solution**: Agent creation framework with templates, utilities, and standardized interfaces. Focus on monitoring logic rather than infrastructure.

### 📈 **Audit Trail & Compliance**
**Problem**: Regulatory compliance and auditing require immutable logs of monitoring decisions and signal accuracy.
**Solution**: Immutable memory logs enable complete audit trails of agent decisions, signal accuracy, and system performance for compliance reporting.

---

## Core Challenges Addressed

### **Noise Reduction in Blockchain Data**
The blockchain generates massive amounts of data, most irrelevant for specific use cases. Eremos agents provide intelligent filtering, focusing only on patterns that matter for their specific monitoring domain.

### **Coordinated Activity Detection**
Modern blockchain activities often involve multiple wallets, contracts, and transactions working in coordination. Individual transaction monitoring misses these patterns. Eremos agents are designed to detect coordinated behaviors across multiple entities.

### **Real-Time Decision Making**
Traditional blockchain analysis is retrospective. Eremos provides real-time signal generation with confidence scoring, enabling automated systems to make decisions based on current blockchain state.

### **Cross-Chain Monitoring Consistency**
Different blockchains have different data structures and patterns. Eremos provides a consistent framework for monitoring across multiple chains while respecting chain-specific characteristics.

### **Developer Integration Simplicity**
Building blockchain monitoring requires deep expertise. Eremos abstracts this complexity, providing high-level signals that developers can integrate into applications without blockchain expertise.

---

## Signal Ecosystem

### Signal Categories

- **Detection**: Active threat or opportunity identification
- **Monitoring**: Ongoing surveillance and pattern tracking  
- **Analysis**: Deep insights and behavioral pattern recognition
- **Archival**: Historical data preservation and context

### Confidence Scoring

Every signal includes confidence scores (0.0-1.0) based on:
- **Pattern Strength**: How closely data matches known patterns
- **Historical Accuracy**: Past accuracy of similar signals
- **Data Quality**: Completeness and reliability of source data
- **Context Relevance**: Situational factors affecting signal reliability

### Glyph System

Each agent has a unique visual identifier (glyph) for quick signal source identification:
- **Ϸ** Theron - Memory & archival
- **φ** Observer - Clustering detection  
- **λ** Harvester - Mint activity
- **L** LaunchTracker - Token launches
- **ψ** GhostWatcher - Dormant wallets
- **§** Liquidity Agent - DeFi monitoring
- **¤** Scam Sentinel - Fraud detection
- **¢** Fee Analyzer - Transaction optimization
- **°** ZKP Agent - Privacy verification


### Signal Registry

The Eremos Signal Registry provides a centralized system for managing signal metadata, schemas, and agent glyph mappings. This ensures all agents adhere to a unified signal structure across the ecosystem.

**Registry Components:**
- **Signal Metadata**: Type definitions, schemas, and validation rules
- **Glyph Mappings**: Agent-to-glyph associations and lookup functions
- **Validation System**: Automatic schema validation and type checking
- **REST API**: Endpoints for querying signal data programmatically

**Available Endpoints:**
- `GET /signals/registry` - All registered signal types with complete metadata
- `GET /signals/registry/:type` - Metadata for a specific signal type
- `GET /signals/glyphs` - All agent glyph mappings
- `GET /signals/glyphs/:agentId` - Glyph information for a specific agent
- `GET /signals/agent/:agentId` - All signal types associated with an agent
- `GET /signals/stats` - Comprehensive statistics about the signal registry

---

## Memory & Analytics System

### Memory Architecture

The Eremos Memory Logging System provides comprehensive tracking and querying capabilities for agent states, historical signals, and events processed. This system enables real-time monitoring, performance analysis, and forensic investigation of agent behaviors.

**Memory Components:**
- **Agent States**: Real-time status, counters, and metadata
- **Signal Emissions**: Success/failure tracking with performance metrics
- **Event Processing**: Detailed logs of all processed events with outcomes

**Memory Limits:**
- **Memory Entries**: 1000 per agent (oldest removed first)
- **Signal Memories**: 500 per agent
- **Event Memories**: 500 per agent
- **Cleanup**: Configurable (default 7 days)

### Memory API Endpoints

**Agent Management:**
- `GET /agents/` - Overview of all registered agents with their current states
- `GET /agents/:agentId` - Detailed state information for a specific agent

**Memory Queries:**
- `GET /agents/memory/:agentId` - Query memory entries for a specific agent with filtering options
- `GET /agents/snapshot/:agentId` - Generate comprehensive memory snapshot with statistics

**Cross-Agent Queries:**
- `GET /agents/memory/search` - Search memory entries across all agents with filtering
- `GET /agents/activity/recent` - Get recent memory entries across all agents
- `GET /agents/memory/stats` - Comprehensive statistics across the entire memory system

### Performance Monitoring

**Key Metrics Tracked:**
- **Processing Time**: Millisecond precision for all operations
- **Success Rates**: Signal emission and event processing success percentages
- **Throughput**: Events and signals processed per time period
- **Error Rates**: Failed operations and error categorization
- **Resource Usage**: Memory consumption and entry counts

**Metrics API Endpoints:**
- `GET /metrics/agent?name=X` - Agent-specific metrics
- `GET /metrics/system` - System-wide metrics
- `GET /metrics/summary` - Performance overview

---

## Real-Time Streaming API

### Overview

The Eremos streaming API provides real-time access to:
- **Agent Performance Metrics**: System health, processing statistics, and operational intelligence
- **Signal Activity**: Live signal emissions from all agents with filtering capabilities
- **Historical Data**: Recent activity and comprehensive statistics

This enables building responsive dashboards, alert systems, monitoring tools, and automated trading systems.

### Streaming Endpoints

**Metrics Streaming:**
- `GET /stream/metrics/system` - Real-time system-wide performance metrics and health indicators
- `GET /stream/metrics/agent?name={AgentName}` - Real-time metrics for a specific agent
- `GET /stream/metrics/summary` - Dashboard-friendly summary of all agents with key performance indicators

**Signal Streaming:**
- `GET /stream/signals/activity` - Real-time feed of all agent signal emissions
- `GET /stream/signals/agent?name={AgentName}&id={AgentId}` - Real-time signals from a specific agent
- `GET /stream/signals/type/{signalType}` - Real-time signals of a specific type
- `GET /stream/signals/filtered?[filters]` - Custom filtered signal stream with multiple criteria

**Available Filters:**
- `agentName`: Filter by agent name
- `agentId`: Filter by agent ID
- `signalType`: Filter by signal type
- `category`: Filter by signal category (detection, optimization, analysis, template)
- `priority`: Filter by priority level (low, medium, high, critical)
- `minConfidence`: Filter by minimum confidence threshold (0.0-1.0)

### Client Integration

**Browser Integration (JavaScript):**
```javascript
// All signal activity stream
const signalStream = new EventSource('http://localhost:3000/stream/signals/activity');

signalStream.onmessage = function(event) {
  const data = JSON.parse(event.data);
  
  if (data.type === 'signal_emission') {
    console.log('New signal:', data.data);
    handleNewSignal(data.data);
  }
};
```

**Agent-Specific Signal Monitoring:**
```javascript
// Monitor specific agent signals
const agentName = 'Scam Sentinel';
const agentSignalStream = new EventSource(
  `http://localhost:3000/stream/signals/agent?name=${encodeURIComponent(agentName)}`
);
```

**Filtered High-Confidence Alert Stream:**
```javascript
// Monitor only high-confidence alerts
const alertStream = new EventSource(
  'http://localhost:3000/stream/signals/filtered?minConfidence=0.9&priority=high'
);
```

### Performance and Scalability

**Update Frequencies:**
- **Signal Streams**: Immediate (event-driven)
- **Metrics Streams**: Every 2 seconds
- **Connection Checks**: Every 1 second
- **Cleanup Operations**: Every 30 seconds

**Resource Management:**
- **Signal Buffer**: 1000 recent signals in memory
- **Automatic Cleanup**: Disconnected clients removed after 60 seconds
- **Connection Limits**: No hard limits (monitor server resources)
- **Memory Efficient**: Circular buffer for signal history

---

## Getting Started

### Installation

```bash
git clone https://github.com/A-calculus/EremosSwarm-.git
cd EREMOSSWARM-
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Configure your environment variables
npm run dev
```

### Available Commands

```bash
# Development
npm run dev          # Start development environment
npm run build        # Build for production
npm test            # Run test suite

# API & Streaming
npm run api         # Start REST API server
npm run demo:streaming  # View streaming examples

# Agent Operations  
npm run validate    # Validate agent configurations
npm run demo:specialized  # Run specialized agents demo
npm run demo:memory     # Demonstrate memory system

# Signal Registry
npm run demo:registry   # Explore signal registry
npm run demo:metrics    # View performance metrics
```

### Creating Custom Agents

The framework provides utilities for rapid custom agent development:

**Agent Creation**: Use the built-in agent template system to create domain-specific monitoring agents without blockchain infrastructure complexity.

**Signal Definition**: Define custom signal types with automatic validation, ensuring consistency across your monitoring ecosystem.

**Memory Integration**: Automatic state tracking and historical logging for every custom agent, providing instant analytics and forensic capabilities.

**Performance Monitoring**: Built-in metrics tracking for custom agents, identifying performance issues and optimization opportunities.

### Custom Signal Registration

**Step 1: Define Signal Metadata**
```typescript
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
    }
  }
};
```

**Step 2: Register Agent Glyph**
```typescript
AGENT_GLYPHS['agent-custom'] = {
  agentId: 'agent-custom',
  agentName: 'CustomAgent',
  glyph: '⚡',
  role: 'custom_detection',
  signalTypes: ['my_custom_signal'],
  description: 'Specialized agent for custom detection patterns'
};
```

**Step 3: Register Signal Type**
```typescript
SIGNAL_REGISTRY['my_custom_signal'] = customSignalMetadata;
```

---

## API Access

### REST Endpoints

```bash
# Signal Registry
GET /signals/registry          # All signal types
GET /signals/glyphs           # Agent glyph mappings
GET /signals/stats            # Registry statistics

# Agent Memory
GET /agents/memory/:agentId   # Agent memory logs  
GET /agents/snapshot/:agentId # Memory snapshots
GET /agents/memory/search     # Cross-agent search

# Performance Metrics
GET /metrics/system           # System-wide metrics
GET /metrics/agent?name=X     # Agent-specific metrics
GET /metrics/summary          # Performance overview
```

### Real-Time Streaming

```bash
# Signal Activity Streams
GET /stream/signals/activity           # All signal emissions
GET /stream/signals/agent?name=X       # Agent-specific signals
GET /stream/signals/type/{signalType}  # Signal type streams
GET /stream/signals/filtered?[filters] # Custom filtered streams

# Performance Metrics Streams  
GET /stream/metrics/system             # Real-time system health
GET /stream/metrics/agent?name=X       # Agent performance streams
GET /stream/metrics/summary            # Dashboard data streams
```

### Testing and Development
**Demo Scripts:**
```bash
# Start API server
npm run api

# Generate sample metrics data
npm run demo:metrics

# Generate signal activity
npm run demo:specialized

# View metrics streaming guide
npm run demo:streaming

# View signal streaming guide
npm run demo:signal-streaming
```

---

## Use Cases

### **DeFi Trading Automation**
Real-time liquidity signals and fee optimization data enable automated trading strategies that respond to market conditions faster than manual analysis.

### **Security Monitoring**
Fraud detection and anomaly signals provide immediate alerts for potential threats, enabling rapid response to emerging security issues.

### **Compliance & Auditing**
Immutable signal logs and comprehensive memory tracking provide audit trails for regulatory compliance and internal risk management.

### **Market Intelligence**
Pattern recognition across multiple agents provides insights into market movements, whale activity, and emerging trends.

### **Portfolio Management**
Early launch detection and wallet reactivation signals help portfolio managers identify new opportunities and risks before they become widely known.

---

## Tech Stack

- **Core**: TypeScript, Node.js
- **API**: Express.js with CORS support
- **Streaming**: Server-Sent Events (SSE)
- **Testing**: Jest with TypeScript integration
- **Build**: TypeScript compiler with source maps

---

## Contributing

Eremos is open to contributors building the next generation of blockchain monitoring tools. Whether you're developing new agent types, improving signal accuracy, or building integration tools - your contributions advance the entire ecosystem.

Focus areas for contribution:
- **Agent Development**: New monitoring patterns and use cases
- **Signal Enhancement**: Improved accuracy and confidence algorithms  
- **Integration Tools**: Libraries and connectors for external systems
- **Performance Optimization**: Efficiency improvements and scaling solutions

---

## License

MIT © EremosCore

Built for the blockchain community. Use it, fork it, build your own swarm.

---

## Links

- **Documentation**: [Full documentation and guides](./docs/)
- **Twitter/X**: [@EremosCore](https://x.com/EremosCore)
- **Website**: [Eremos.io](https://www.eremos.io/)

*Eremos: Intelligence at the edges of blockchain activity* 