//Streaming Client Demo: Tests the real-time metrics streaming endpoints

console.log(' Eremos Streaming Client Demo\n');

// Demo instructions and curl examples for testing streaming endpoints
function showStreamingExamples(): void {
  console.log(' Real-time Metrics Streaming');
  console.log('  Make sure the API server is running: npm run api\n');

  console.log('System Metrics Response:');
  console.log('```json');
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: "system_metrics",
    data: {
      totalAgents: 4,
      activeAgents: 3,
      totalSystemEvents: 142,
      totalSystemSignals: 89,
      averageSystemPerformance: 23.4,
      topPerformingAgent: "Liquidity Agent"
    }
  }, null, 2));
  console.log('```\n');

  console.log('Agent Metrics Response:');
  console.log('```json');
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: "agent_metrics",
    agentName: "Liquidity Agent",
    data: {
      totalEvents: 45,
      totalSignals: 23,
      successRate: 0.97,
      averageProcessingTime: 18.5,
      signalsPerHour: 12.3,
      errorCount: 1,
      lastActivity: new Date().toISOString()
    }
  }, null, 2));
  console.log('```\n');

  console.log('🎉 Ready to build real-time monitoring dashboards!');
}

// Show the streaming examples and guide
showStreamingExamples(); 