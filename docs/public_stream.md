# Real-Time Streaming API Documentation

This document provides comprehensive information about the Eremos real-time streaming endpoints using Server-Sent Events (SSE) for live metrics monitoring, signal activity tracking, and dashboard integration.

## Overview

The Eremos streaming API provides real-time access to:
- **Agent Performance Metrics**: System health, processing statistics, and operational intelligence
- **Signal Activity**: Live signal emissions from all agents with filtering capabilities
- **Historical Data**: Recent activity and comprehensive statistics

This enables building responsive dashboards, alert systems, monitoring tools, and automated trading systems.

### Key Features

- **Real-time Updates**: Automatic data streaming with configurable intervals
- **Low Latency**: Immediate delivery of performance metrics and signal events
- **Browser Compatible**: Standard EventSource API support
- **Connection Management**: Automatic cleanup and reconnection handling
- **CORS Enabled**: Ready for cross-origin requests
- **Error Resilient**: Graceful handling of network issues
- **Advanced Filtering**: Comprehensive filter options for targeted monitoring

---

## Available Streaming Endpoints

### Base URLs
Streaming endpoints are available under:
```
http://localhost:3000/stream/metrics/    # Performance metrics
http://localhost:3000/stream/signals/    # Signal activity
```

---

## 📊 Metrics Streaming Endpoints

### 1. System Metrics Stream

**Endpoint**: `GET /stream/metrics/system`

**Purpose**: Real-time system-wide performance metrics and health indicators

**Use Cases**:
- System health dashboards
- Infrastructure monitoring
- Capacity planning
- Performance overview screens

### 2. Agent-Specific Metrics Stream

**Endpoint**: `GET /stream/metrics/agent?name={AgentName}`

**Parameters**:
- `name` (required): Agent name (URL encoded for spaces)

**Purpose**: Real-time metrics for a specific agent

**Use Cases**:
- Agent-specific monitoring screens
- Performance debugging
- Individual agent health checks
- Specialized dashboards

### 3. Metrics Summary Stream

**Endpoint**: `GET /stream/metrics/summary`

**Purpose**: Dashboard-friendly summary of all agents with key performance indicators

**Use Cases**:
- Executive dashboards
- Quick status overview
- Agent comparison views
- Operations center displays

---

## 🚨 Signal Streaming Endpoints

### 1. All Signal Activity Stream

**Endpoint**: `GET /stream/signals/activity`

**Purpose**: Real-time feed of all agent signal emissions

**Use Cases**:
- Live signal activity monitoring
- System-wide alert feeds
- Signal analytics and logging
- Real-time dashboard updates

### 2. Agent-Specific Signal Stream

**Endpoint**: `GET /stream/signals/agent?name={AgentName}&id={AgentId}`

**Parameters**:
- `name` (optional): Agent name (e.g., "Liquidity Agent")
- `id` (optional): Agent ID (e.g., "agent-liquidity")

**Purpose**: Real-time signals from a specific agent

**Use Cases**:
- Agent-specific signal monitoring
- Focused security alerts
- Individual agent performance tracking
- Specialized alert systems

### 3. Signal Type Stream

**Endpoint**: `GET /stream/signals/type/{signalType}`

**Parameters**:
- `signalType` (required): Specific signal type to monitor

**Purpose**: Real-time signals of a specific type

**Example URLs**:
```bash
/stream/signals/type/liquidity_spike_detected
/stream/signals/type/rug_pull_detected
/stream/signals/type/fee_spike_detected
/stream/signals/type/invalid_proof_detected
```

**Use Cases**:
- Event-specific monitoring
- Targeted alert systems
- Signal type analytics
- Specialized trading signals

### 4. Advanced Filtered Signal Stream

**Endpoint**: `GET /stream/signals/filtered?[filters]`

**Available Filters**:
- `agentName`: Filter by agent name
- `agentId`: Filter by agent ID
- `signalType`: Filter by signal type
- `category`: Filter by signal category (detection, optimization, analysis, template)
- `priority`: Filter by priority level (low, medium, high, critical)
- `minConfidence`: Filter by minimum confidence threshold (0.0-1.0)

**Purpose**: Custom filtered signal stream with multiple criteria

**Example URLs**:
```bash
# High-confidence detection signals
/stream/signals/filtered?category=detection&minConfidence=0.8

# High-priority fraud alerts
/stream/signals/filtered?agentName=Scam%20Sentinel&priority=high

# Critical signals from any agent
/stream/signals/filtered?priority=critical

# DeFi monitoring signals with high confidence
/stream/signals/filtered?agentId=agent-liquidity&minConfidence=0.9
```

**Use Cases**:
- Custom alert systems
- Precision monitoring
- Automated trading triggers
- Security incident response

---

## Client Integration

### Browser Integration (JavaScript)

#### Basic Signal Stream Usage
```javascript
// All signal activity stream
const signalStream = new EventSource('http://localhost:3000/stream/signals/activity');

signalStream.onmessage = function(event) {
  const data = JSON.parse(event.data);
  
  if (data.type === 'signal_emission') {
    console.log('New signal:', data.data);
    handleNewSignal(data.data);
  } else if (data.type === 'signal_history') {
    console.log('Signal history:', data.data);
    loadSignalHistory(data.data);
  }
};

signalStream.onerror = function(event) {
  console.error('Signal stream error:', event);
  // Implement reconnection logic
};
```

#### Agent-Specific Signal Monitoring
```javascript
// Monitor specific agent signals
const agentName = 'Scam Sentinel';
const agentSignalStream = new EventSource(
  `http://localhost:3000/stream/signals/agent?name=${encodeURIComponent(agentName)}`
);

agentSignalStream.onmessage = function(event) {
  const data = JSON.parse(event.data);
  
  if (data.type === 'signal_emission') {
    const signal = data.data;
    
    // Handle different signal types
    switch(signal.type) {
      case 'rug_pull_detected':
        triggerSecurityAlert(signal);
        break;
      case 'suspicious_burn_detected':
        logSuspiciousActivity(signal);
        break;
      default:
        updateSignalDisplay(signal);
    }
  }
};
```

#### Filtered High-Confidence Alert Stream
```javascript
// Monitor only high-confidence alerts
const alertStream = new EventSource(
  'http://localhost:3000/stream/signals/filtered?minConfidence=0.9&priority=high'
);

alertStream.onmessage = function(event) {
  const data = JSON.parse(event.data);
  
  if (data.type === 'signal_emission') {
    const signal = data.data;
    
    // Trigger immediate alert for high-confidence signals
    showCriticalAlert({
      title: `${signal.agent} Alert`,
      message: `${signal.type} detected with ${Math.round(signal.confidence * 100)}% confidence`,
      data: signal.details,
      timestamp: signal.timestamp
    });
  }
};
```

### Advanced Integration Patterns

#### Multi-Stream Signal Monitor
```javascript
class SignalMonitor {
  constructor() {
    this.streams = new Map();
    this.handlers = new Map();
    this.isActive = false;
  }

  addStream(name, endpoint, handler) {
    const stream = new EventSource(endpoint);
    
    stream.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'signal_emission') {
        handler(data.data);
      }
    };

    stream.onerror = (event) => {
      console.error(`Stream ${name} error:`, event);
      this.handleStreamError(name, endpoint, handler);
    };

    this.streams.set(name, stream);
    this.handlers.set(name, { endpoint, handler });
  }

  handleStreamError(name, endpoint, handler) {
    // Implement exponential backoff reconnection
    setTimeout(() => {
      if (this.isActive) {
        this.addStream(name, endpoint, handler);
      }
    }, 5000);
  }

  start() {
    this.isActive = true;
  }

  stop() {
    this.isActive = false;
    this.streams.forEach(stream => stream.close());
    this.streams.clear();
    this.handlers.clear();
  }
}

// Usage for comprehensive monitoring
const signalMonitor = new SignalMonitor();

// Security monitoring
signalMonitor.addStream('security', 
  'http://localhost:3000/stream/signals/agent?name=Scam%20Sentinel',
  (signal) => handleSecuritySignal(signal)
);

// Liquidity monitoring
signalMonitor.addStream('liquidity', 
  'http://localhost:3000/stream/signals/type/liquidity_spike_detected',
  (signal) => handleLiquiditySignal(signal)
);

// High-priority alerts
signalMonitor.addStream('alerts', 
  'http://localhost:3000/stream/signals/filtered?priority=high',
  (signal) => handleCriticalAlert(signal)
);

signalMonitor.start();
```

#### Combined Metrics and Signal Monitoring
```javascript
class EremosMonitor {
  constructor() {
    this.metricsStream = null;
    this.signalStream = null;
    this.callbacks = {
      onMetricsUpdate: null,
      onSignalEmission: null,
      onError: null
    };
  }

  connect(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };

    // Metrics monitoring
    this.metricsStream = new EventSource('http://localhost:3000/stream/metrics/summary');
    this.metricsStream.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (this.callbacks.onMetricsUpdate) {
        this.callbacks.onMetricsUpdate(data.data);
      }
    };

    // Signal monitoring
    this.signalStream = new EventSource('http://localhost:3000/stream/signals/activity');
    this.signalStream.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'signal_emission' && this.callbacks.onSignalEmission) {
        this.callbacks.onSignalEmission(data.data);
      }
    };

    // Error handling
    [this.metricsStream, this.signalStream].forEach(stream => {
      stream.onerror = (event) => {
        if (this.callbacks.onError) {
          this.callbacks.onError(event);
        }
      };
    });
  }

  disconnect() {
    if (this.metricsStream) this.metricsStream.close();
    if (this.signalStream) this.signalStream.close();
  }
}

// Usage
const monitor = new EremosMonitor();

monitor.connect({
  onMetricsUpdate: (metrics) => {
    updatePerformanceDashboard(metrics);
  },
  onSignalEmission: (signal) => {
    addToSignalFeed(signal);
    
    // Check for critical conditions
    if (signal.confidence > 0.95) {
      triggerAlert(signal);
    }
  },
  onError: (error) => {
    console.error('Monitor error:', error);
    showConnectionStatus('error');
  }
});
```

## Testing and Development

### Using cURL for Testing

#### Signal Stream Testing
```bash
# Test all signal activity stream
curl -N http://localhost:3000/stream/signals/activity

# Test agent-specific signal stream
curl -N "http://localhost:3000/stream/signals/agent?name=Liquidity%20Agent"

# Test signal type stream
curl -N http://localhost:3000/stream/signals/type/liquidity_spike_detected

# Test filtered stream
curl -N "http://localhost:3000/stream/signals/filtered?category=detection&minConfidence=0.8"
```

#### Metrics Stream Testing
```bash
# Test system metrics stream
curl -N http://localhost:3000/stream/metrics/system

# Test agent-specific metrics stream
curl -N "http://localhost:3000/stream/metrics/agent?name=Liquidity%20Agent"

# Test summary stream
curl -N http://localhost:3000/stream/metrics/summary
```

### Demo Scripts

#### Available Demo Commands
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

#### Testing Workflow
```bash
# Terminal 1: Start the API server
npm run api

# Terminal 2: Monitor signal activity
curl -N http://localhost:3000/stream/signals/activity

# Terminal 3: Generate signals
npm run demo:specialized

# Watch Terminal 2 for real-time signal updates
```

### Non-Streaming Test Endpoints

#### Recent Signals (for testing)
```bash
# Get last 10 signals
curl http://localhost:3000/stream/signals/recent?limit=10

# Get recent signals from specific agent
curl "http://localhost:3000/stream/signals/recent?agentName=Liquidity%20Agent&limit=5"

# Get recent signals of specific type
curl "http://localhost:3000/stream/signals/recent?signalType=liquidity_spike_detected"
```

#### Stream Statistics
```bash
# Signal stream statistics
curl http://localhost:3000/stream/signals/stats

# Metrics stream statistics (if implemented)
curl http://localhost:3000/stream/metrics/stats
```

---


## Performance and Scalability

### Update Frequencies
- **Signal Streams**: Immediate (event-driven)
- **Metrics Streams**: Every 2 seconds
- **Connection Checks**: Every 1 second
- **Cleanup Operations**: Every 30 seconds

### Resource Management
- **Signal Buffer**: 1000 recent signals in memory
- **Automatic Cleanup**: Disconnected clients removed after 60 seconds
- **Connection Limits**: No hard limits (monitor server resources)
- **Memory Efficient**: Circular buffer for signal history

### Optimization Tips

#### Client-Side
- Use specific filters to reduce data volume
- Implement proper error handling and reconnection
- Buffer signals client-side for smooth UI updates
- Close unused streams to preserve resources

#### Server-Side
- Monitor memory usage for signal buffer
- Implement rate limiting for high-frequency signals
- Consider horizontal scaling for high-load scenarios
- Use connection pooling for multiple streams

---

## Error Handling

### Common Error Scenarios

#### 1. Agent/Signal Type Not Found (404)
```json
{
  "success": false,
  "error": "Agent not found",
  "message": "Agent 'InvalidAgent' does not exist",
  "availableAgents": ["Liquidity Agent", "Scam Sentinel", "Fee Analyzer", "ZKP Agent"]
}
```

#### 2. Missing Parameters (400)
```json
{
  "success": false,
  "error": "Missing agent parameter",
  "message": "Please provide agent name (?name=AgentName) or agent ID (?id=agent-id)"
}
```

#### 3. Connection Errors
- Network timeouts
- Server overload
- Invalid endpoints
- Stream interruptions

### Error Recovery Strategies

#### Automatic Reconnection with Exponential Backoff
```javascript
class ResilientStream {
  constructor(endpoint, onData, maxRetries = 5) {
    this.endpoint = endpoint;
    this.onData = onData;
    this.maxRetries = maxRetries;
    this.retryCount = 0;
    this.retryDelay = 1000;
  }

  connect() {
    this.eventSource = new EventSource(this.endpoint);
    
    this.eventSource.onmessage = (event) => {
      this.retryCount = 0; // Reset on success
      this.retryDelay = 1000;
      this.onData(JSON.parse(event.data));
    };

    this.eventSource.onerror = () => {
      this.handleError();
    };
  }

  handleError() {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`Reconnecting in ${this.retryDelay}ms (attempt ${this.retryCount})`);
      
      setTimeout(() => {
        this.connect();
      }, this.retryDelay);
      
      this.retryDelay = Math.min(this.retryDelay * 2, 30000); // Cap at 30 seconds
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
```

---

## Security Considerations

### CORS Configuration
Streams are configured with permissive CORS for development:
```javascript
'Access-Control-Allow-Origin': '*'
```

**Production Recommendation**: Restrict to specific domains:
```javascript
'Access-Control-Allow-Origin': 'https://yourdashboard.com'
```

### Authentication
Current implementation doesn't include authentication. For production:

1. **API Keys**: Add API key validation for stream access
2. **JWT Tokens**: Implement bearer token authentication
3. **Rate Limiting**: Prevent abuse with connection and signal limits
4. **IP Whitelisting**: Restrict access to known clients

### Data Sensitivity
Streaming data includes:
- Signal details with potentially sensitive information
- Agent performance statistics
- System operational data

Consider data classification and access controls based on sensitivity.

---

## Use Cases and Applications

### 🚨 Security and Fraud Detection
### 💹 Trading and DeFi Automation
### 📊 Operations Dashboard
---

## Troubleshooting

### Common Issues

#### 1. No Signal Data Received
**Symptoms**: Stream connects but no signal events
**Solutions**:
- Ensure agents are actively processing events (`npm run demo:specialized`)
- Check server logs for signal emission errors
- Verify endpoint URL and parameters
- Test with non-streaming endpoint: `/stream/signals/recent`

#### 2. Stream Disconnections
**Symptoms**: Frequent connection drops
**Solutions**:
- Implement reconnection logic with exponential backoff
- Check network stability and firewall settings
- Monitor server resource usage
- Reduce stream frequency if possible

#### 3. High Memory Usage
**Symptoms**: Server memory increases over time
**Solutions**:
- Monitor signal buffer size (default: 1000 signals)
- Implement client-side signal buffering
- Check for memory leaks in event handlers
- Restart server periodically if needed

#### 4. Missing Signals
**Symptoms**: Some signals not appearing in stream
**Solutions**:
- Check signal emission errors in server logs
- Verify logSignal function is being called
- Test signal registry validation
- Monitor signal buffer overflow

### Debugging Commands

```bash
# Check server health
curl http://localhost:3000/health

# Test signal registry
curl http://localhost:3000/signals/registry

# Check recent signals
curl http://localhost:3000/stream/signals/recent?limit=5

# View signal stream statistics
curl http://localhost:3000/stream/signals/stats

# Test specific agent signals
curl "http://localhost:3000/stream/signals/recent?agentName=Liquidity%20Agent"
```

### Log Analysis

Monitor server logs for:
- Signal stream client connections/disconnections
- Signal emission events and errors
- Stream filtering and processing
- Memory usage and cleanup operations

Example log patterns:
```
Signal stream client signal_client_123 connected to activity stream
[Liquidity Agent] stored signal sig_xyz789 (liquidity_spike_detected) at 2025-07-27T10:30:00.000Z [confidence: 0.94]
Signal stream client signal_client_123 disconnected from activity stream
Cleaned up 2 stale signal stream clients
```

---

## Future Enhancements

### Planned Features

1. **Signal Analytics**: Historical signal analysis and patterns
2. **Custom Signal Types**: User-defined signal types and schemas
3. **Signal Aggregation**: Batch signal processing and delivery
4. **WebSocket Alternative**: Full duplex communication option
5. **Signal Replay**: Historical signal playback for testing
6. **Advanced Filters**: Complex query language for signal filtering

### Extension Points

- Custom signal transformation and enrichment
- Integration with external alert systems
- Signal-based automation triggers
- Machine learning signal pattern detection
- Signal correlation and analysis tools

---

## Support Resources

### Documentation Links
- [Agent Documentation](./agents_new.md)
- [Signal Registry](./signal_registry.md)
- [Memory Logs](./memory_logs.md)

### Example Code Repository
Complete integration examples available in:
- `/scripts/demo-signal-streaming.ts`
- `/scripts/demo-streaming-client.ts`
- `/api/signal-streaming.ts`
- `/api/metrics-streaming.ts`

### Testing Tools
- Demo scripts: `npm run demo:signal-streaming`
- Metrics streaming: `npm run demo:streaming`
- API server: `npm run api`
- Signal generation: `npm run demo:specialized`

---

*Last Updated: 2025-07-27*  
*Version: 1.1.0*  
*Streaming API Status: Production Ready*  
*Signal Streaming: Now Available* 