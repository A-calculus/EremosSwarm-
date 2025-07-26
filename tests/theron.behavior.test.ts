import { Theron } from '../agents/theron';

test('Theron emits signal on wallet cluster', () => {
  const event = { 
    type: "anomaly", 
    wallet: "test_wallet", 
    timestamp: new Date().toISOString() 
  };
  
  // Mock console.log to capture the output
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  
  Theron.observe(event);
  
  // Verify that a log was created (indicating signal emission)
  expect(consoleSpy).toHaveBeenCalledWith(
    expect.stringContaining('[Theron] stored signal')
  );
  
  consoleSpy.mockRestore();
});
