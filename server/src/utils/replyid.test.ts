// src/utils/replyid.test.ts
import { generateId } from './replyid';

describe('generateId', () => {
  it('should generate a valid base64 string for given channelId and counter', () => {
    const channelId = 1;
    const counter = 1;
    const id = generateId(channelId, counter);
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('should throw an error if channelId is out of range', () => {
    expect(() => generateId(-1, 1)).toThrow('channelId must be between 0 and 4095');
    expect(() => generateId(4096, 1)).toThrow('channelId must be between 0 and 4095');
  });

  it('should throw an error if counter is out of range', () => {
    expect(() => generateId(1, -1)).toThrow('counter must be between 0 and 4095');
    expect(() => generateId(1, 4096)).toThrow('counter must be between 0 and 4095');
  });

  it('should generate different ids for different channelIds or counters', () => {
    const id1 = generateId(1, 1);
    const id2 = generateId(1, 2);
    const id3 = generateId(2, 1);
    expect(id1).not.toBe(id2);
    expect(id1).not.toBe(id3);
  });
});
