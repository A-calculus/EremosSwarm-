# Specialized Agents Documentation

This document provides comprehensive information about the four new specialized agents in the Eremos ecosystem, their capabilities, metrics integration, and usage patterns.

## Overview

The Eremos framework has been expanded with four specialized monitoring agents, each designed for specific blockchain and DeFi use cases. These agents integrate with the global metrics system for performance tracking and provide real-time monitoring capabilities.

### Quick Reference

| Agent | Glyph | Role | Primary Function |
|-------|-------|------|------------------|
| **Liquidity Agent** | `§` | DeFi Monitoring | Pool liquidity tracking, vesting analysis |
| **Scam Sentinel** | `¤` | Fraud Detection | Rug-pull detection, governance monitoring |
| **Fee Analyzer** | `¢` | Fee Optimization | Transaction cost monitoring, timing optimization |
| **ZKP Agent** | `°` | Privacy Analysis | Zero-knowledge proof validation, anomaly detection |

---

## Liquidity Agent (`§`)

### Purpose
Monitors DeFi pools for liquidity spikes, drains, and vesting schedule deviations to detect unusual market activity and potential manipulation.

### Agent Configuration
```typescript
{
  id: 'agent-liquidity',
  name: 'Liquidity Agent',
  role: 'defi_monitoring',
  glyph: '§',
  watchType: 'liquidity_tracking',
  triggerThreshold: 2.0, // 200% change threshold
  description: 'Monitors DeFi pools for liquidity spikes, drains, and vesting deviations'
}
```

### Signal Types
- `liquidity_spike_detected` - Sudden large liquidity additions (>200% increase)
- `liquidity_drain_detected` - Significant liquidity removals (>50% decrease)
- `vesting_deviation_detected` - Deviations from expected vesting schedules (>15%)
- `high_impact_trade_detected` - Trades with significant price impact (>5%)

### Event Types Monitored
```typescript
interface LiquidityEvent {
  type: 'pool_activity' | 'vesting_event' | 'liquidity_change';
  poolAddress: string;
  tokenPair: string;
  liquidityAmount: number;
  priceImpact: number;
  timestamp: string;
  details: {
    beforeAmount?: number;
    afterAmount?: number;
    vestingSchedule?: any;
    deviation?: number;
    volumeSpike?: boolean;
  };
}
```

### Thresholds & Parameters
- **Liquidity Threshold**: $1,000,000 minimum for spike detection
- **Vesting Deviation**: 15% variance from expected schedule
- **Price Impact**: 5% threshold for high-impact trade alerts
- **Drain Ratio**: 50% removal threshold for drain detection

### Usage Example
```typescript
import { LiquidityAgent, LiquidityEvent } from '../agents/liquidity-agent';

const event: LiquidityEvent = {
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

LiquidityAgent.observe(event);
```

---

## Scam Sentinel (`¤`)

### Purpose
Detects rug-pulls, token supply manipulation, and fraudulent governance activities through behavioral analysis and pattern recognition.

### Agent Configuration
```typescript
{
  id: 'agent-scam-sentinel',
  name: 'Scam Sentinel',
  role: 'fraud_detection',
  glyph: '¤',
  watchType: 'scam_detection',
  triggerThreshold: 0.8, // 80% confidence threshold
  description: 'Detects rug-pulls, token supply manipulation, and fraudulent governance activities'
}
```

### Signal Types
- `rug_pull_detected` - Massive supply inflation or liquidity removal
- `suspicious_burn_detected` - Large token burns (potential evidence destruction)
- `governance_attack_detected` - Voting power concentration (>49%)
- `ownership_renounced` - Contract ownership renouncement
- `suspicious_ownership_transfer` - Ownership transfers to unknown addresses

### Event Types Monitored
```typescript
interface ScamEvent {
  type: 'mint' | 'burn' | 'governance_vote' | 'ownership_transfer' | 'liquidity_removal';
  token: string;
  contractAddress: string;
  timestamp: string;
  details: {
    supply_change?: number;
    supply_before?: number;
    supply_after?: number;
    voting_power?: number;
    proposal_id?: string;
    vote_outcome?: string;
    ownership_from?: string;
    ownership_to?: string;
    liquidity_removed?: number;
    timeframe?: string;
  };
}
```

### Detection Algorithms
- **Supply Change Analysis**: Detects >50% supply inflation as rug-pull preparation
- **Governance Monitoring**: Flags voting power concentration >49%
- **Time-based Risk Assessment**: Higher risk for weekend/after-hours activity
- **Liquidity Drain Detection**: Monitors >50% liquidity removal events

### Risk Levels
- **Critical**: >100% supply change, >95% liquidity removal
- **High**: 50-100% supply change, 75-95% liquidity removal
- **Medium**: 20-50% supply change, 50-75% liquidity removal
- **Low**: <20% supply change, <50% liquidity removal

---

## Fee Analyzer (`¢`)

### Purpose
Monitors transaction fees across multiple networks, detects fee spikes, and suggests optimal transaction timing for cost-effective operations.

### Agent Configuration
```typescript
{
  id: 'agent-fee-analyzer',
  name: 'Fee Analyzer',
  role: 'fee_optimization',
  glyph: '¢',
  watchType: 'fee_monitoring',
  triggerThreshold: 1.5, // 50% fee increase threshold
  description: 'Monitors transaction fees and suggests optimal transaction timing for cost efficiency'
}
```

### Signal Types
- `fee_spike_detected` - Significant fee increases (>50%)
- `fee_reduction_detected` - Notable fee decreases (>30%)
- `network_congestion_detected` - High network congestion (>80%)
- `optimal_fee_window` - Identified low-fee time periods

### Supported Networks
- **Ethereum**: Primary focus for fee monitoring
- **Polygon**: Layer 2 alternative tracking
- **Solana**: High-throughput network monitoring
- **Arbitrum**: Optimistic rollup fee tracking

### Event Types Monitored
```typescript
interface FeeEvent {
  type: 'fee_spike' | 'fee_drop' | 'network_congestion' | 'optimal_window';
  network: string;
  avgFee: number;
  timestamp: string;
  details: {
    previousAvgFee?: number;
    percentChange?: number;
    congestionLevel?: number;
    blockUtilization?: number;
    recommendedAction?: string;
    optimalTimeWindow?: string;
  };
}
```

### Optimization Strategies
- **Fee Spike Detection**: Recommends transaction delays during high-fee periods
- **Congestion Analysis**: Provides estimated transaction delays
- **Optimal Window Identification**: Suggests low-fee time periods (typically 2-4 AM UTC)
- **Cross-chain Recommendations**: Suggests alternative networks during congestion

---

## ZKP Agent (`°`)

### Purpose
Analyzes zero-knowledge proofs for fraudulent patterns, behavioral anomalies, and circuit manipulation through advanced cryptographic validation.

### Agent Configuration
```typescript
{
  id: 'agent-zkp-analyzer',
  name: 'ZKP Agent',
  role: 'privacy_analysis',
  glyph: '°',
  watchType: 'zkp_verification',
  triggerThreshold: 0.7, // 70% suspicion threshold
  description: 'Analyzes zero-knowledge proofs for fraudulent patterns and behavioral anomalies'
}
```

### Signal Types
- `invalid_proof_detected` - Failed proof verification
- `proof_bloating_detected` - Unusually large proof sizes (>10KB)
- `circuit_complexity_anomaly` - Excessive circuit constraints (>1M)
- `suspicious_zkp_behavior` - Behavioral patterns indicating fraud
- `proof_farming_detected` - Repeated identical proofs (>10 repeats)
- `privacy_violation_detected` - Potential data leakage in circuits

### Supported Circuit Types
- **PLONK**: Universal SNARKs with preprocessing
- **Groth16**: Efficient pairing-based SNARKs
- **STARK**: Scalable transparent arguments
- **Bulletproofs**: Range proofs without trusted setup

### Event Types Monitored
```typescript
interface ZKPEvent {
  type: 'proof_verification' | 'circuit_analysis' | 'behavioral_anomaly' | 'privacy_violation';
  proofId: string;
  circuitType: string;
  timestamp: string;
  details: {
    verificationResult?: boolean;
    proofSize?: number;
    computationTime?: number;
    gasUsed?: number;
    suspiciousPatterns?: string[];
    behavioralScore?: number;
    circuitComplexity?: number;
    proverAddress?: string;
    verifierContract?: string;
    repeatCount?: number;
  };
}
```

### Analysis Techniques
- **Proof Size Analysis**: Detects circuit bloating attacks
- **Complexity Monitoring**: Identifies resource exhaustion attempts
- **Behavioral Scoring**: Pattern analysis for automated fraud detection
- **Privacy Leakage Detection**: Circuit auditing for information disclosure

---

## Metrics Integration

All specialized agents are integrated with the global metrics system for comprehensive performance monitoring.

### Tracked Metrics

#### Performance Metrics
- **Event Processing**: Total events processed, success/failure rates
- **Signal Emission**: Signals generated, confidence scores, processing times
- **Error Tracking**: Error counts, failure patterns, recovery times
- **Throughput**: Events per hour, signals per hour, processing efficiency

#### Quality Metrics
- **Success Rate**: Percentage of successful operations
- **Average Processing Time**: Mean processing duration in milliseconds
- **Confidence Scores**: Signal confidence distribution and trends
- **Error Patterns**: Common failure modes and resolution strategies

### Metrics API Endpoints

#### Agent-Specific Metrics
```bash
# Get metrics for a specific agent
GET /metrics/agent?name=Liquidity%20Agent

# Response format
{
  "success": true,
  "data": {
    "agentName": "Liquidity Agent",
    "totalEvents": 142,
    "totalSignals": 89,
    "successRate": 0.97,
    "averageProcessingTime": 23.4,
    "signalsPerHour": 12.7,
    "errorCount": 3,
    "lastActivity": "2025-01-15T10:30:00.000Z",
    "agentInfo": {
      "agentId": "agent-liquidity",
      "glyph": "§",
      "role": "defi_monitoring",
      "description": "Monitors DeFi pools..."
    }
  }
}
```

#### System-Wide Metrics
```bash
# Get system overview
GET /metrics/system

# Get performance summary
GET /metrics/summary

# Get agent comparison
GET /metrics/comparison
```

### Performance Monitoring

#### Real-time Tracking
Each agent automatically tracks:
- Event processing start/end times
- Signal generation success/failure
- Error occurrences with context
- Confidence score distributions

#### Historical Analysis
- Recent performance history (last 100 operations)
- Processing time trends and anomalies
- Success rate patterns over time
- Signal type distribution analysis

---

## Integration Examples

### Basic Agent Usage
```typescript
// Import the desired agent
import { LiquidityAgent } from '../agents/liquidity-agent';

// Create event data
const event = {
  type: 'liquidity_change',
  poolAddress: '0x...',
  tokenPair: 'ETH/USDC',
  liquidityAmount: 1000000,
  priceImpact: 0.03,
  timestamp: new Date().toISOString(),
  details: { /* event-specific data */ }
};

// Process the event
LiquidityAgent.observe(event);
```

### Metrics Monitoring
```typescript
import { getAgentMetrics } from '../utils/agent-metrics';

// Get current performance data
const metrics = getAgentMetrics('Liquidity Agent');
console.log(`Success Rate: ${(metrics.successRate * 100).toFixed(1)}%`);
console.log(`Avg Processing: ${metrics.averageProcessingTime.toFixed(1)}ms`);
```

### API Integration
```javascript
// Fetch agent performance via REST API
const response = await fetch('/metrics/agent?name=Scam%20Sentinel');
const data = await response.json();

if (data.success) {
  console.log('Agent Performance:', data.data);
}
```

---

## Testing & Demos

### Available Demo Scripts
```bash
# Test specialized agents
npm run demo:specialized

# Test metrics system
npm run demo:metrics

# Validate agent configurations
npm run validate
```

### Demo Scenarios
The demo scripts include realistic scenarios:
- **Liquidity Events**: Pool spikes, drains, vesting deviations
- **Fraud Detection**: Rug-pulls, governance attacks, ownership transfers
- **Fee Analysis**: Network congestion, optimal windows, cross-chain comparisons
- **ZKP Validation**: Invalid proofs, circuit anomalies, behavioral patterns

---

## Best Practices

### Agent Development
1. **Consistent Glyphs**: Use assigned keyboard characters for all signals
2. **Error Handling**: Implement comprehensive try-catch blocks
3. **Metrics Integration**: Record all events and signals for monitoring
4. **Confidence Scoring**: Provide meaningful confidence values (0.0-1.0)

### Performance Optimization
1. **Processing Efficiency**: Minimize computation in observe() methods
2. **Memory Management**: Limit stored data to essential information
3. **Error Recovery**: Graceful degradation during failures
4. **Rate Limiting**: Prevent excessive signal generation

### Monitoring & Alerting
1. **Success Rate Monitoring**: Alert when success rate drops below 95%
2. **Performance Thresholds**: Monitor processing times for anomalies
3. **Error Pattern Analysis**: Identify and address recurring failures
4. **Capacity Planning**: Use metrics for scaling decisions

---

## Troubleshooting

### Common Issues

#### Agent Not Processing Events
- Verify event structure matches expected interface
- Check agent configuration and thresholds
- Review error logs for processing failures

#### Missing Metrics Data
- Ensure metrics tracking is properly integrated
- Check if agent name matches exactly in queries
- Verify API server is running and accessible

#### Signal Generation Problems
- Validate signal registry configuration
- Check glyph mappings and consistency
- Review confidence calculation logic

### Debugging Tools
```bash
# View agent validation results
npm run validate

# Test metrics generation
npm run demo:metrics

# Check API endpoints
curl http://localhost:3000/metrics/summary
```

---

## Future Enhancements

### Planned Features
1. **Advanced Analytics**: Machine learning integration for pattern detection
2. **Cross-Agent Correlation**: Multi-agent signal correlation analysis
3. **Real-time Dashboards**: Web-based monitoring interfaces
4. **Historical Data**: Long-term trend analysis and reporting

### Extension Points
- Custom signal types and schemas
- Pluggable analysis algorithms
- Multi-chain monitoring expansion

---

## Support & Resources

### Documentation Links
- [Signal Registry Documentation](./signal_registry.md)
- [Memory Logs Documentation](./memory_logs.md)

### Contact Information
For questions or support regarding the specialized agents:
- GitHub Issues: [EremosCore Repository]
- Documentation: [Eremos Docs]

---

*Last Updated: 2025-01-26*
*Version: 1.0.0* 