# Backend Setup

## Supabase

Run `supabase/schema.sql` in the Supabase SQL Editor for the Color Pulse Studio project.

Required Vercel environment variables:

```txt
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

The `SUPABASE_SERVICE_ROLE_KEY` must stay server-side only. It is used by Vercel API routes.

## Waitlist

The app posts parent emails to:

```txt
/api/waitlist
```

Rows are saved in:

```txt
public.waitlist_leads
```

If Supabase is missing or the table has not been created yet, the frontend keeps the old local fallback so the user experience does not break.

## Health Check

After deployment, open:

```txt
https://colorcut-studio.vercel.app/api/health
```

Expected after Supabase env vars are set:

```json
{
  "ok": true,
  "supabase": true,
  "publicAuthConfig": true
}
```

## Next Integrations

Resend will use:

```txt
RESEND_API_KEY
WAITLIST_FROM_EMAIL
WAITLIST_NOTIFY_EMAIL
```

Stripe will use:

```txt
STRIPE_SECRET_KEY
STRIPE_PLUS_PRICE_ID
STRIPE_WEBHOOK_SECRET
```
