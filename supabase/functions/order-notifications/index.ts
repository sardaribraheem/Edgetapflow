import { createClient } from 'npm:@supabase/supabase-js@2.117.2';

// Service credentials stay in Edge Function secrets, never in browser variables.
const origins = new Set(['https://edgetap.tech', 'https://edgetapflow.web.app', 'https://edgetapflow.firebaseapp.com']);
Deno.serve(async request => {
  const origin = request.headers.get('origin') || '';
  const headers: Record<string,string> = { 'Content-Type': 'application/json', 'Vary': 'Origin', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
  if (origins.has(origin)) headers['Access-Control-Allow-Origin'] = origin;
  const respond = (status: number, value: unknown) => new Response(JSON.stringify(value), { status, headers });
  if (request.method === 'OPTIONS') return new Response(null, { status: origins.has(origin) ? 204 : 403, headers });
  if (request.method !== 'POST') return respond(405, { error: 'POST required' });
  const url = Deno.env.get('SUPABASE_URL'), anon = Deno.env.get('SUPABASE_ANON_KEY'), service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !anon || !service) return respond(503, { error: 'Notification service is not configured' });
  const authorization = request.headers.get('authorization') || '', token = authorization.replace(/^Bearer /i, '');
  const workerSecret = Deno.env.get('ORDER_NOTIFICATION_WORKER_SECRET');
  const scheduled = !!workerSecret && token === workerSecret;
  let body: { orderId?: string; proof?: boolean; version?: number };
  try { body = await request.json(); } catch { return respond(400, { error: 'Invalid request' }); }
  const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
  if (!scheduled) {
    const client = createClient(url, anon, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false, autoRefreshToken: false } });
    const { data: user, error: authError } = await client.auth.getUser(token);
    if (authError || !user.user || !body.orderId || !/^[a-zA-Z0-9_-]{1,128}$/.test(body.orderId)) return respond(401, { error: 'Sign in to continue' });
    const { data: allowed, error } = await client.rpc('can_deliver_order_notifications', { p_id: body.orderId });
    if (error || !allowed) return respond(403, { error: 'Order unavailable' });
    if (body.proof) {
      const { error: queueError } = await client.rpc('request_proof_email', { p_id: body.orderId, p_version: body.version });
      if (queueError) return respond(409, { error: 'Refresh the order and save its current proof before sending' });
    }
  }
  const apiKey = Deno.env.get('RESEND_API_KEY'), sender = Deno.env.get('ORDER_EMAIL_FROM');
  if (!apiKey || !sender) return respond(503, { error: 'Email transport is not configured. No email was sent and no review timer started.' });
  const { data: jobs, error: claimError } = await admin.rpc('claim_order_notifications', { p_id: scheduled ? null : body.orderId });
  if (claimError) return respond(503, { error: 'Could not claim pending notifications' });
  let sent = 0, failed = 0;
  for (const job of jobs || []) {
    try {
      const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `edgetap-order-${job.id}` }, body: JSON.stringify({ from: sender, to: [job.recipient], reply_to: 'sardaribraheem277@gmail.com', subject: job.subject, text: job.body }) });
      const result = await response.json();
      if (!response.ok || !result.id) throw new Error('Provider declined notification');
      const { error } = await admin.rpc('complete_order_notification', { p_job: job.id, p_provider_id: result.id });
      if (error) throw new Error('Could not record provider acceptance');
      sent++;
    } catch {
      await admin.rpc('fail_order_notification', { p_job: job.id }); failed++;
    }
  }
  const { error: expiryError } = await admin.rpc('expire_unanswered_proofs');
  return respond(failed || expiryError ? 503 : 200, { sent, failed, message: failed ? 'Some notifications remain pending for retry' : 'Notification processing complete' });
});
