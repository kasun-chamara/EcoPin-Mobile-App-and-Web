// Supabase Edge Function: send an Expo push notification for every new row in public.notifications.
// Deploy:  supabase functions deploy send-push
// Then in the Supabase dashboard: Database > Webhooks > "notifications INSERT" -> this function.

import { createClient } from 'npm:@supabase/supabase-js@2';

type NotificationRow = {
  id: string;
  user_id: string;
  pin_id: string | null;
  kind: string;
  title: string;
  body: string | null;
};

Deno.serve(async (req) => {
  const payload = await req.json();
  const row: NotificationRow | undefined = payload?.record;
  if (!row) return new Response('no record', { status: 400 });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: profile } = await supabase
    .from('profiles')
    .select('push_token')
    .eq('id', row.user_id)
    .single();

  if (!profile?.push_token) return new Response('no token', { status: 200 });

  const res = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: profile.push_token,
      title: row.title,
      body: row.body ?? '',
      sound: 'default',
      data: { pinId: row.pin_id, kind: row.kind },
    }),
  });

  return new Response(await res.text(), { status: res.status });
});
