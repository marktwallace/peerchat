// src/services/messageService.test.ts
import messageService from './messageService';
import WebSocket from 'ws';
import { signMessage } from '../utils/sign';

jest.mock('../utils/sign', () => ({
  signMessage: jest.fn((message) => ({ message, signature: 'mock-signature' }))
}));

describe('MessageService', () => {
  let mockClient: jest.Mocked<WebSocket>;

  beforeEach(() => {
    mockClient = {
      send: jest.fn(),
      close: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    } as unknown as jest.Mocked<WebSocket>;

    Object.defineProperty(mockClient, 'readyState', {
      value: WebSocket.OPEN,
      writable: true,
    });

    messageService.addClient(mockClient);
  });

  afterEach(() => {
    messageService.removeClient(mockClient);
    jest.clearAllMocks();
  });

  it('should add a client', () => {
    expect(messageService["clients"].has(mockClient)).toBe(true);
  });

  it('should remove a client', () => {
    messageService.removeClient(mockClient);
    expect(messageService["clients"].has(mockClient)).toBe(false);
  });

  it('should broadcast a message to all clients', () => {
    const message = { text: 'Hello, World!' };
    messageService.broadcastMessage(message);

    expect(mockClient.send).toHaveBeenCalledWith(JSON.stringify({
      message,
      signature: 'mock-signature'
    }));
  });

  it('should not broadcast to clients that are not open', () => {
    Object.defineProperty(mockClient, 'readyState', {
      value: WebSocket.CLOSED,
    });

    const message = { text: 'Hello, World!' };
    messageService.broadcastMessage(message);

    expect(mockClient.send).not.toHaveBeenCalled();
  });
});
