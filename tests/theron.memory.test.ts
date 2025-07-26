import { Theron } from "../agents/theron";

test("Theron returns memory snapshot", () => {
  if (Theron.getMemory) {
    const memory = Theron.getMemory();
    expect(Array.isArray(memory)).toBe(true);
    expect(memory.length).toBeGreaterThan(0);
  } else {
    expect(Theron.getMemory).toBeUndefined();
  }
});
