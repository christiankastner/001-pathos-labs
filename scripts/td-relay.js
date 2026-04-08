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

console.log('hello')

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL           = process.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY      = process.env.PUBLIC_SUPABASE_KEY;
const SUPABASE_SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PORT                   = Number(process.env.TD_WS_PORT) || 9980;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[relay] Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_KEY in environment.');
  console.error('        Run with: node --env-file=.env scripts/td-relay.js');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.warn('[relay] SUPABASE_SERVICE_ROLE_KEY not set — set_active will fail due to RLS.');
}

// ── Local WebSocket server (TouchDesigner connects here) ──────────────────────
const wss = new WebSocketServer({ port: PORT });
const clients = new Set();

wss.on('connection', (ws, req) => {
  clients.add(ws);
  console.log(`[TD]  + client connected (${req.socket.remoteAddress})  total=${clients.size}`);

  ws.on('message', (data) => {
    console.log(`[TD] received raw message:`, data.toString());
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      console.warn('[TD] received non-JSON message, ignoring');
      return;
    }

    console.log(`[TD] parsed message:`, msg);

    if (msg.event === 'set_active') {
      const questionId = Number(msg.question_id);
      if (!Number.isFinite(questionId)) {
        console.warn('[TD] set_active missing valid question_id:', msg);
        return;
      }
      console.log(`[TD] set_active  question_id=${questionId}`);
      setActiveQuestion(questionId);
    }
  });

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

// ── Supabase client ───────────────────────────────────────────────────────────
// Use the service role key for admin writes (bypasses RLS).
// Fall back to anon key if not set (writes will fail silently due to RLS).
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY ?? SUPABASE_ANON_KEY);

async function setActiveQuestion(questionId) {
  // Deactivate all questions, then activate the target
  const { error: deactivateError } = await supabase
    .from('questions')
    .update({ is_active: false })
    .eq('is_active', true);

  if (deactivateError) {
    console.error('[relay] Failed to deactivate questions:', deactivateError.message);
    return;
  }

  const { error: activateError } = await supabase
    .from('questions')
    .update({ is_active: true })
    .eq('id', questionId);

  if (activateError) {
    console.error('[relay] Failed to activate question:', activateError.message);
    return;
  }

  console.log(`[relay] question ${questionId} is now active`);
}

// ── Supabase Realtime subscription ───────────────────────────────────────────

// Subscribe to question-control so the relay can send broadcast messages to it.
supabase.channel('question-control').subscribe((status) => {
  console.log(`[supabase] question-control channel status: ${status}`);
});

supabase
  .channel('answers-td-relay')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'answers' },
    (payload) => {
      const record = payload.new ?? payload.old ?? {};
      console.log(`[supabase] ${payload.eventType}  question_id=${record.question_id}  session=${String(record.session_id).slice(0, 8)}`);
      broadcast({
        event: payload.eventType,        // "INSERT" | "UPDATE" | "DELETE"
        id: record.id,
        session_id: record.session_id,
        question_id: record.question_id,
        value: record.value ?? null,
      });
    },
  )
  .subscribe((status) => {
    console.log(`[supabase] channel status: ${status}`);
  });
