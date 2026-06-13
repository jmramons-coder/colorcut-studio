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
https://snapuzzle.ca/api/health
```

Expected after Supabase env vars are set:

```json
{
  "ok": true,
  "supabase": true,
  "publicAuthConfig": true
}
```

## Parent Auth

Parent login uses Supabase Auth through these API routes:

```txt
/api/auth-password-login
/api/auth-password-set
/api/auth-start
/api/auth-link
/api/auth-me
/api/auth-refresh
```

Password login is primary. Magic links remain available as a fallback until Google/Apple SSO is added.

Supabase Auth settings used:

```txt
Site URL: https://snapuzzle.ca
Redirect URLs:
https://snapuzzle.ca
https://snapuzzle.ca/*
```

The parent sign-in UI is intentionally separate from the pricing modal. Parents can buy first through Stripe, then sign in with the same email after checkout so Plus can attach to their account.

## Stripe

Checkout uses:

```txt
/api/create-checkout-session
```

Required Vercel environment variables:

```txt
APP_URL=https://snapuzzle.ca
STRIPE_SECRET_KEY
STRIPE_PLUS_MONTHLY_PRICE_ID
STRIPE_PLUS_YEARLY_PRICE_ID
STRIPE_WEBHOOK_SECRET
```

Add this webhook endpoint in Stripe:

```txt
https://snapuzzle.ca/api/stripe-webhook
```

Subscribe it to:

```txt
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
```

Stripe should collect the payment email. The webhook creates or updates a Supabase `profiles` row by that email, marks it as `plus` while the subscription is active or trialing, and records the Stripe subscription in `public.subscriptions`. When the parent later signs in with the same email, the app links the auth user to that profile.

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
STRIPE_PLUS_MONTHLY_PRICE_ID
STRIPE_PLUS_YEARLY_PRICE_ID
STRIPE_WEBHOOK_SECRET
```
