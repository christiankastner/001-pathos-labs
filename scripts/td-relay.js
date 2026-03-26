/**
 * TouchDesigner WebSocket Relay
 *
 * Connects to Supabase Realtime and rebroadcasts every answers-table
 * change event to a local WebSocket server on ws://localhost:9980.
 *
 * Run:
 *   node --env-file=.env scripts/td-relay.js
 *
 * In TouchDesigner: add a WebSocket DAT → set Network Address to
 *   ws://localhost:9980
 * Each message is a JSON string — use a JSON DAT to parse it.
 */

import { createClient } from '@supabase/supabase-js';
import { WebSocketServer, WebSocket } from 'ws';

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL      = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_KEY;
const PORT              = Number(process.env.TD_WS_PORT) || 9980;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[relay] Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_KEY in environment.');
  console.error('        Run with: node --env-file=.env scripts/td-relay.js');
  process.exit(1);
}

// ── Local WebSocket server (TouchDesigner connects here) ──────────────────────
const wss     = new WebSocketServer({ port: PORT });
const clients = new Set();

wss.on('connection', (ws, req) => {
  clients.add(ws);
  console.log(`[TD]  + client connected (${req.socket.remoteAddress})  total=${clients.size}`);

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[TD]  - client disconnected  total=${clients.size}`);
  });

  ws.on('error', (err) => console.error('[TD] client error:', err.message));
});

wss.on('listening', () =>
  console.log(`[relay] WebSocket server listening on ws://localhost:${PORT}`),
);

function broadcast(payload) {
  const msg = JSON.stringify(payload);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) client.send(msg);
  }
}

// ── Supabase Realtime subscription ───────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

supabase
  .channel('answers-td-relay')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'answers' },
    (payload) => {
      const record = payload.new ?? payload.old ?? {};
      console.log(`[supabase] ${payload.eventType}  question_id=${record.question_id}  session=${String(record.session_id).slice(0, 8)}`);
      broadcast({
        event:       payload.eventType,        // "INSERT" | "UPDATE" | "DELETE"
        session_id:  record.session_id,
        question_id: record.question_id,
        value:       record.value ?? null,
      });
    },
  )
  .subscribe((status) => {
    console.log(`[supabase] channel status: ${status}`);
  });
