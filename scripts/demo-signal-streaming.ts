//Signal Streaming Demo: Tests the real-time signal streaming endpoints

console.log('📡 Eremos Signal Streaming Demo\n');

// Demo instructions and curl examples for testing signal streaming endpoints
function showSignalStreamingExamples(): void {
  console.log('🚨 Real-time Signal Streaming');

  console.log('Signal Emission Event:');
  console.log('```json');
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: "signal_emission",
    data: {
      id: "stream_1707123456_abc123def",
      agent: "Liquidity Agent",
      type: "liquidity_spike_detected",
      glyph: "§",
      hash: "sig_xyz789",
      timestamp: new Date().toISOString(),
      confidence: 0.94,
      details: {
        pool_address: "0x1234...5678",
        token_pair: "ETH/USDC",
        liquidity_change: 2.3,
        volume_spike: true
      },
      metadata: {
        priority: "high",
        category: "detection",
        source: "agent-liquidity"
      }
    }
  }, null, 2));
  console.log('```\n');

  console.log('Signal History Event (initial data):');
  console.log('```json');
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: "signal_history",
    data: [
      {
        id: "stream_1707123400_def456",
        agent: "Scam Sentinel",
        type: "rug_pull_detected",
        glyph: "¤",
        confidence: 0.89,
        timestamp: new Date(Date.now() - 30000).toISOString()
      }
    ]
  }, null, 2));
  console.log('```\n');

  console.log('🎉 Ready to monitor real-time signal activity!');
}

// Show the signal streaming examples and guide
showSignalStreamingExamples(); 