//Base Server: Main endpoint server that orchestrates all API modules

import express from 'express';
import cors from 'cors';

//Import endpoint modules
import signalEndpoints from './signal-endpoints';
import memoryEndpoints from './memory-endpoints';

const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(cors());
app.use(express.json());

//Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'eremos-api-server',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

//Mount endpoint modules
app.use('/signals', signalEndpoints);
app.use('/agents', memoryEndpoints);

//404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `Endpoint ${req.method} ${req.originalUrl} not found`,
    availableEndpoints: [
      'GET /health',
      'GET /signals/*',
      'GET /agents/*'
    ]
  });
});

//Error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

//Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Eremos API Server running on port ${PORT}`);
    console.log(`📋 Available endpoint groups:`);
    console.log(`   GET /health                    - Health check`);
    console.log(`   GET /signals/*                 - Signal registry endpoints`);
    console.log(`   GET /agents/*                  - Agent memory endpoints`);
  });
}

export default app; 