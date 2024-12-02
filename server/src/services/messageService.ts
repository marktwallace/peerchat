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
    console.log('Adding client:', client.clientMetadata);
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
    console.log('Sending client list to client:', clientList);
    client.send(JSON.stringify({ type: 'clientList', clientList }));
  }

  broadcastMessage(message: any): void {
    //const signedMessage = signMessage(message);

    console.log('Broadcasting message:', message);
    // Broadcast the signed message to all connected clients
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
        console.log('Sent message to client',client.clientMetadata?.publicKey);
      }
    });
  }

  signallingMessage(message: any, recipientPublicKey: string): void {
    console.log('Signalling message:', message);
    // Find the recipient client and send the signed message
    this.clients.forEach((client) => {
      if (client.clientMetadata && client.clientMetadata.publicKey === recipientPublicKey && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
        console.log('Sent signalling message to client');
      }
    });
  }
}

const messageService = new MessageService();

export default messageService;
