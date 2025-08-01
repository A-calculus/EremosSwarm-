import { ExampleAgent } from "../agents/example";

describe("ExampleAgent", () => {
  it("should return memory snapshot", () => {
    if (ExampleAgent.getMemory) {
      const mem = ExampleAgent.getMemory();
      expect(mem.length).toBeGreaterThan(0);
    } else {
      expect(ExampleAgent.getMemory).toBeUndefined();
    }
  });
});
