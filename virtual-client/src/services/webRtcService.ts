// webRtcService.ts
import {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  RTCDataChannel,
} from "wrtc";
import { SignalMessage } from "../models";
import WebSocket from "ws";

class WebRtcService {
  private ws: WebSocket;
  private peerConnections: Map<string, any>; // Using 'any' for RTCPeerConnection
  private clientId: string;
  private dataChannels: Map<string, any>; // Using 'any' for RTCDataChannel

  constructor(ws: WebSocket, clientId: string) {
    this.ws = ws;
    this.clientId = clientId;
    this.peerConnections = new Map();
    this.dataChannels = new Map();

    this.setupWebSocketHandlers();
  }

  private setupWebSocketHandlers() {
    this.ws.on("message", async (message: WebSocket.Data) => {
      const data = JSON.parse(message.toString()) as SignalMessage;
      if (data.to !== this.clientId) return;

      switch (data.type) {
        case "sdp-offer":
          await this.handleOffer(data.from, data.payload);
          break;
        case "sdp-answer":
          await this.handleAnswer(data.from, data.payload);
          break;
        case "ice-candidate":
          await this.handleIceCandidate(data.from, data.payload);
          break;
      }
    });
  }

  private async handleOffer(from: string, offer: RTCSessionDescriptionInit) {
    console.log(`Received offer from ${from}`);
    if (this.peerConnections.has(from)) {
      const pc = this.peerConnections.get(from);
      if (pc) {
        if (pc.signalingState === "stable") {
          // Connection exists and is stable; reject the new offer
          console.warn(`Received duplicate offer from ${from}. Ignoring.`);
          // Optionally, send a message back indicating that the offer is rejected
          return;
        } else if (pc.signalingState === "have-local-offer") {
          // Glare detected: both peers have local offers
          if (this.clientId > from) {
            // Our clientId is higher; we accept the incoming offer
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            this.sendSignalingMessage("sdp-answer", from, answer);
          } else {
            // Our clientId is lower; we ignore the incoming offer
            console.warn(
              `Glare detected with ${from}. Ignoring incoming offer.`
            );
            // Optionally, send back a glare notification or handle accordingly
          }
        } else {
          // Connection is in the process; handle accordingly
          console.warn(
            `Received offer from ${from} while connection is in state ${pc.signalingState}.`
          );
          // Decide whether to accept the new offer or ignore it
          return;
        }
      }
    } else {
      // No existing connection; proceed with creating a new one
      const pc = this.createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer back to the offering peer
      this.sendSignalingMessage("sdp-answer", from, answer);
    }
  }

  private async handleAnswer(from: string, answer: any) {
    console.log(`Received answer from ${from}`);
    const pc = this.peerConnections.get(from);
    if (pc) {
      await pc.setRemoteDescription(answer);
    } else {
      console.error(`No peer connection found for ${from}`);
    }
  }

  private async handleIceCandidate(from: string, candidate: any) {
    console.log(`Received ICE candidate from ${from}`);
    const pc = this.peerConnections.get(from);
    if (pc) {
      await pc.addIceCandidate(candidate);
    } else {
      console.error(`No peer connection found for ${from}`);
    }
  }

  private createPeerConnection(peerId: string): any {
    const pc = new RTCPeerConnection();

    pc.onicecandidate = (event: any) => {
      if (event.candidate) {
        this.sendSignalingMessage("ice-candidate", peerId, event.candidate);
      }
    };

    pc.ondatachannel = (event: any) => {
      this.setupDataChannel(peerId, event.channel);
    };

    this.peerConnections.set(peerId, pc);
    return pc;
  }

  private setupDataChannel(peerId: string, dataChannel: any) {
    this.dataChannels.set(peerId, dataChannel);
    dataChannel.onopen = () => {
      console.log(`Data channel with ${peerId} is open`);
    };

    dataChannel.onmessage = (event: any) => {
      try {
        const parsedData = JSON.parse(event.data);
        console.log(`Message from ${peerId}:`, parsedData);
      } catch (err) {
        console.log(`Message from ${peerId}:`, event.data);
      }
    };
  }

  private sendSignalingMessage(type: string, to: string, payload: any) {
    const message: SignalMessage = {
      type,
      from: this.clientId,
      to,
      payload,
    };
    this.ws.send(JSON.stringify(message));
  }

  public async initiateConnection(peerId: string) {
    if (this.peerConnections.has(peerId)) {
      console.log(`Already have a connection with ${peerId}`);
      return;
    }

    const pc = this.createPeerConnection(peerId);

    const dataChannel = pc.createDataChannel("myDataChannel");
    this.setupDataChannel(peerId, dataChannel);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    this.sendSignalingMessage("sdp-offer", peerId, offer);
  }

  public closeConnection(peerId: string) {
    const pc = this.peerConnections.get(peerId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(peerId);
      this.dataChannels.delete(peerId);
      console.log(`Connection with ${peerId} closed`);
    }
  }

  public closeAllConnections() {
    this.peerConnections.forEach((pc, peerId) => {
      pc.close();
      console.log(`Connection with ${peerId} closed`);
    });
    this.peerConnections.clear();
    this.dataChannels.clear();
  }

  public hasConnectionWith(peerId: string): boolean {
    return this.peerConnections.has(peerId);
  }

  public isDataChannelOpen(peerId: string): boolean {
    const dataChannel = this.dataChannels.get(peerId);
    return dataChannel?.readyState === "open";
  }

  public sendData(peerId: string, data: any) {
    const dataChannel = this.dataChannels.get(peerId);
    if (!dataChannel) {
      console.error(`No data channel found for peer ${peerId}`);
      return;
    }

    if (dataChannel.readyState !== "open") {
      console.error(`Data channel for peer ${peerId} is not open`);
      return;
    }

    const messageToSend =
      typeof data === "string" ? data : JSON.stringify(data);
    dataChannel.send(messageToSend);
    console.log(`Sent message to ${peerId}: ${messageToSend}`);
  }
}

export default WebRtcService;
