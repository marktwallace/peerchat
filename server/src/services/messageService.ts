// src/services/messageService.ts
import { WebSocketWithMetadata } from '../models';
import { signMessage } from '../utils/sign';
import WebSocket from 'ws';
import { ClientMetadata } from '../models';

class MessageService {
  private clients: Set<WebSocketWithMetadata>;

  constructor() {
    this.clients = new Set();
  }

  addClient(client: WebSocketWithMetadata): void {
    this.clients.add(client);
    this.sendClientList(client);
    this.broadcastMessage({ type: 'connect', metadata: client.clientMetadata });
  }

  removeClient(client: WebSocketWithMetadata): void {
    this.clients.delete(client);
    this.broadcastMessage({ type: 'disconnect', metadata: client.clientMetadata });
  }

  sendClientList(client: WebSocketWithMetadata): void {
    const clientList = Array.from(this.clients).map((client) => client.clientMetadata);
    client.send(JSON.stringify({ type: 'clientList', clientList }));
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
