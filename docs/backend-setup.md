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
/api/auth-link
/api/auth-me
/api/auth-refresh
```

Password login is primary. `/api/auth-link` remains only to complete Supabase recovery redirects that arrive with a token hash.

Password recovery is the path for parents who paid but do not know their password. The app checks that the email belongs to an active member profile, creates a linked Supabase Auth user if the paid profile does not have one yet, sends a Supabase recovery email, and then lets the parent set a new password from the recovery redirect.

Supabase Auth settings used:

```txt
Site URL: https://snapuzzle.ca
Redirect URLs:
https://snapuzzle.ca
https://snapuzzle.ca/*
```

The parent sign-in UI is intentionally separate from the pricing modal. Parents buy first through Stripe. On successful checkout, the app receives Stripe's `session_id`, loads the checkout email server-side, shows that email as read-only, and lets the parent create a password for that paid account.

Security rule: password creation must come from a paid Stripe subscription checkout session. The app must not allow setting a password only because someone knows a paid email address.

## Stripe

Checkout uses:

```txt
/api/create-checkout-session
/api/checkout-account
/api/create-billing-portal-session
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

Stripe should collect the payment email. The webhook creates or updates a Supabase `profiles` row, marks it as `plus` while the subscription is active or trialing, marks it `free` when the subscription becomes inactive, and records the Stripe subscription in `public.subscriptions`.

Stripe customer id is treated as the stable billing identity. If a Stripe customer's email changes, profile sync first looks up the profile by `stripe_customer_id`, then updates the email/status. Login eligibility is based on active member status (`plus`, `active`, or `trialing`), not merely the existence of a historical Stripe customer id.

## Admin

The private customer admin page is available at:

```txt
https://snapuzzle.ca/admin
```

Admin access uses Supabase Auth plus the `public.admin_users` table. There is no shared admin code in the UI.

Create your admin account in **Supabase → Authentication → Users**, then run this in the SQL Editor with your admin email:

```sql
insert into public.admin_users (auth_user_id, email, role)
select id, email, 'owner'
from auth.users
where email = 'YOUR_ADMIN_EMAIL@example.com'
on conflict (auth_user_id) do update
set email = excluded.email,
    role = excluded.role;
```

The admin page can show high-level KPIs, list/search users, inspect Supabase profile/auth state, inspect Stripe customer/subscription/invoice/payment state, grant or remove comp Plus, resync Stripe state, cancel the latest Stripe subscription, and delete a Supabase test account. Stripe remains the billing source of truth.

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
