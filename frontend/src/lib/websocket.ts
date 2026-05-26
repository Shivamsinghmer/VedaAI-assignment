import { WsMessage } from '@/types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000';

type WsHandler = (msg: WsMessage) => void;

export function connectWs(assignmentId: string, onMessage: WsHandler): () => void {
  const url = `${WS_URL}/ws?assignmentId=${assignmentId}`;
  const ws = new WebSocket(url);

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data) as WsMessage;
      onMessage(msg);
    } catch {
      console.warn('[WS] Failed to parse message:', event.data);
    }
  };

  ws.onerror = (err) => console.error('[WS] Error:', err);

  ws.onclose = () => console.log(`[WS] Disconnected from ${assignmentId}`);

  return () => {
    if (ws.readyState === WebSocket.OPEN) ws.close();
  };
}
