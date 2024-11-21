// src/controllers/messageController.ts
import { Request, Response } from 'express';
import messageService from '../services/messageService';
import { RequestWithPublicKey, Reply } from '../models';
import { generateId } from '../utils/replyid';

let counter = 0;

export function postReply(req: RequestWithPublicKey, res: Response): void {
  console.log('Received body:', req.body);
  const { text, channel = 'AA' } = req.body;

  if (!text) {
    res.status(400).json({ error: 'Message text is required' });
    return;
  }

  counter = (counter + 1) & 0xFF;
  const id = generateId(channel,counter);

  const message: Reply = {
    id,
    pk: req.publicKey!,
    text,
  };

  console.log('Generated message:', message);
  messageService.broadcastMessage(message);
  res.status(200).json({ status: 'OK', messageId: id });
}
