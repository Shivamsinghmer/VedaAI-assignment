import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { Server } from 'http';
import { redis } from './redis';
import { WsMessage } from '../types';

const PUBSUB_CHANNEL = 'veda:ws-notifications';

// Map of assignmentId → set of connected clients (server-process only)
const clients = new Map<string, Set<WebSocket>>();

export function initWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url || '/', `http://localhost`);
    const assignmentId = url.searchParams.get('assignmentId') || 'global';

    if (!clients.has(assignmentId)) {
      clients.set(assignmentId, new Set());
    }
    clients.get(assignmentId)!.add(ws);

    console.log(`[WS] Client connected for assignment: ${assignmentId}`);

    ws.on('close', () => {
      clients.get(assignmentId)?.delete(ws);
      console.log(`[WS] Client disconnected from assignment: ${assignmentId}`);
    });

    ws.on('error', (err) => console.error(`[WS] Error:`, err.message));
    ws.send(JSON.stringify({ type: 'connected', assignmentId }));
  });

  // Subscribe to Redis pub/sub channel — receives notifications from worker process
  const subscriber = redis.duplicate();
  subscriber.subscribe(PUBSUB_CHANNEL, (err) => {
    if (err) console.error('[WS] Redis subscribe error:', err);
    else console.log(`[WS] Subscribed to Redis channel: ${PUBSUB_CHANNEL}`);
  });

  subscriber.on('message', (_channel: string, message: string) => {
    try {
      const msg: WsMessage = JSON.parse(message);
      broadcastToClients(msg.assignmentId, msg);
    } catch (e) {
      console.error('[WS] Failed to parse pub/sub message:', e);
    }
  });

  return wss;
}

function broadcastToClients(assignmentId: string, message: WsMessage): void {
  const sockets = clients.get(assignmentId);
  if (!sockets || sockets.size === 0) return;

  const payload = JSON.stringify(message);
  for (const ws of sockets) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

// Called by worker via Redis pub/sub publish
export async function notifyClients(assignmentId: string, message: WsMessage): Promise<void> {
  try {
    await redis.publish(PUBSUB_CHANNEL, JSON.stringify(message));
  } catch (err) {
    console.error('[WS] Failed to publish notification:', err);
  }
}
