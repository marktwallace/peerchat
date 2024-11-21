// src/services/messageService.ts
import { signMessage } from '../utils/sign';
import WebSocket from 'ws';

class MessageService {
  private clients: Set<WebSocket>;

  constructor() {
    this.clients = new Set();
  }

  addClient(client: WebSocket): void {
    this.clients.add(client);
  }

  removeClient(client: WebSocket): void {
    this.clients.delete(client);
  }

  broadcastMessage(message: any): void {
    const signedMessage = signMessage(message);

    console.log('Broadcasting message:', signedMessage);
    // Broadcast the signed message to all connected clients
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(signedMessage));
        console.log('Sent message to client');
      }
    });
  }
}

const messageService = new MessageService();

export default messageService;
