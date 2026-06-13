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

## Parent Auth

Parent login uses Supabase Email Auth through these API routes:

```txt
/api/auth-start
/api/auth-verify
/api/auth-me
/api/auth-refresh
```

The current Supabase default email template sends a magic sign-in link. The app also includes a 6-digit code field, which will work once custom SMTP is connected and the Supabase "Magic link or OTP" email template includes:

```txt
{{ .Token }}
```

Supabase Auth settings used:

```txt
Site URL: https://colorcut-studio.vercel.app
Redirect URLs:
https://colorcut-studio.vercel.app
https://colorcut-studio.vercel.app/*
```

The parent sign-in UI is intentionally separate from the pricing modal. Parents can buy first through Stripe, then sign in with the same email after checkout so Plus can attach to their account.

## Stripe

Checkout uses:

```txt
/api/create-checkout-session
```

Required Vercel environment variables:

```txt
APP_URL=https://colorcut-studio.vercel.app
STRIPE_SECRET_KEY
STRIPE_PLUS_PRICE_ID
STRIPE_WEBHOOK_SECRET
```

Add this webhook endpoint in Stripe:

```txt
https://colorcut-studio.vercel.app/api/stripe-webhook
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
STRIPE_PLUS_PRICE_ID
STRIPE_WEBHOOK_SECRET
```
