# DS2 email integration

## What existed and what changed

The site already used Next.js App Router, TypeScript, an accessible but disabled contact form, configurable public contact details, privacy content and static SEO routes. It had no submission endpoint or email provider. The existing layout and CSS classes are reused. The only new visible field is the required enquiry subject; status/error messages replace the disabled notice.

The new `GET /api/contact` prepares a signed, short-lived form token. `POST /api/contact` validates the enquiry and sends two transactional message versions in one Brevo API call:

1. Owner notification to `EMAIL_NOTIFICATION_TO`, including name, email, subject, message and optional business/phone fields. `Reply-To` is the visitor.
2. Acknowledgment to the visitor from the verified business sender. `Reply-To` is the business email. It does not echo untrusted message content or links back to the visitor.

Both use `EMAIL_FROM` and `EMAIL_FROM_NAME` as the sender. The browser never chooses a From address, recipient override or template. Nothing uses Gmail SMTP. Existing Cloudflare routing and DNS are unchanged.

A successful result means Brevo accepted the emails, not that they reached the inbox. Bounces, blocks, queued messages and downstream Gmail forwarding must be checked in Brevo transactional logs and the destination inbox. No automatic retry loop or background queue is added.

## Environment

Copy `.env.example` to `.env.local`. Never commit a real key. Configure:

```dotenv
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BUSINESS_EMAIL=contact@durgasoftwaresolutions.com
BREVO_API_KEY=
EMAIL_FROM=contact@durgasoftwaresolutions.com
EMAIL_FROM_NAME=DS2 - DurgaSoftwareSolutions
EMAIL_NOTIFICATION_TO=contact@durgasoftwaresolutions.com
```

Paste the key only into `.env.local` or Vercel's server environment settings. The four email variables are server-only. Never prefix an API key with `NEXT_PUBLIC_`. `server-only` import guards prevent these modules from being imported into a client component.

For production, set `NEXT_PUBLIC_SITE_URL=https://durgasoftwaresolutions.com`. The endpoint compares the exact browser Origin against this value; use the exact local/preview origin when testing. Redirect the alternate www/apex hostname to the canonical site in the existing hosting configuration if appropriate. Do not modify DNS as part of this integration.

Missing or malformed server configuration makes the API return 503 and the form remain unavailable, with a direct contact-email alternative. The key is not checked against Brevo until an actual send; an invalid/revoked key results in a truthful delivery failure.

## Reuse for future application emails

- `lib/email/brevo.ts`: transport, timeouts, structured errors, idempotency, fixed sender.
- `lib/email/templates.ts`: escaped HTML and plaintext templates with DS2 branding, mobile-friendly tables and privacy disclosure.
- `lib/email/service.ts`: trusted server-only helpers `sendInquiryConfirmation(kind, recipient, eventId)` and `sendBusinessNotification(subject, paragraphs, eventId)`.
- `kind` is `contact`, `service` or `project`. Reuse the same event UUID for retries of the same business event. Never expose a general send-email endpoint to clients.
- Template content is escaped, including future notification text. Each business email must correspond to a genuine user/business event, never a marketing blast.

## Abuse and duplicate protection

- Same-origin JSON requests only; body reads stop at 24 KB.
- Server-side field validation, limits and header-control-character rejection; matching browser validation.
- Honeypot and HMAC-signed form token with a two-second minimum age and 30-minute expiry. Expired/invalid tokens refresh without deleting entered details.
- Five POST attempts per 15 minutes per client, three distinct enquiries per recipient per 15 minutes; hashed keys, bounded/pruned in-process maps. On Vercel only, the handler trusts the platform's overwritten `x-forwarded-for` header. Other hosts use a shared `local` client bucket unless a trusted proxy adapter is implemented.
- Client click-lock and disabled submit button during sending; completion prevents accidental resend.
- In-process duplicate/pending-request tracking, plus a deterministic, HMAC-derived UUID idempotency key on the Brevo batch. It incorporates all normalized enquiry details. Identical requests retain the same provider key across instances/retries. Brevo's documented idempotency window is 30 minutes; beyond that window duplicates may be sent again. This is not permanent exactly-once delivery.
- No automatic retries on provider errors or timeouts. The visitor can retry with unchanged details, using the same provider key. A timeout may mean Brevo accepted the original call; never change details solely to bypass a retry error.
- Logs contain only a random request reference, outcome, count and sanitized error category/status. No keys, message text, names, recipient emails, raw IPs or raw provider error bodies.

### Free tier / serverless limitations

Brevo currently includes **300 emails per day** on its free plan, shared with other account sending. Each enquiry consumes **two** emails, so 150 enquiries is a theoretical maximum only if nothing else sends that day. The handler reserves at most 200 email attempts per UTC day **per running process**, leaving headroom in a single process. Failed attempts remain reserved conservatively.

In-memory rate limits and budgets reset on restart and are not shared across serverless instances. They provide basic abuse protection, not a global daily quota or robust bot defense. Brevo enforces its account quota and can queue messages after it is reached; API acceptance must not be presented as immediate delivery. Monitor account usage, queued mail and logs. Before a high-traffic/abuse-prone launch, apply a shared rate limit at the hosting WAF or replace `ContactGuard` with durable atomic storage; do not rely on this local counter for a hard account-wide cap. No such external settings have been changed here. Other future server email helpers must be given their own business-event quota controls.

## Marketing: separate, opt-in only

No contact is added to any marketing list by this application. No campaign API, campaign sender, bulk-mail loop, cron job or marketing automation is enabled.

Future integration uses Brevo-hosted forms and Brevo Campaigns, rather than a custom list/unsubscribe database:

1. Create a dedicated marketing list, separate from transactional recipients.
2. In Brevo, create a signup form with an unchecked explicit marketing-consent field and double opt-in. State what updates the person will receive. Keep the consent text, source, timestamps and confirmation evidence in Brevo. Do not import contact enquiries into the list.
3. Create/test a hosted unsubscribe form. Confirm it suppresses future marketing sends for the relevant channel/list. Never clear a subscriber's blocklist state as a side effect of a contact enquiry.
4. Configure BOTH `NEXT_PUBLIC_BREVO_SIGNUP_URL` and `NEXT_PUBLIC_BREVO_UNSUBSCRIBE_URL` with the reviewed HTTPS hosted-form URLs. The footer then shows separate signup and unsubscribe links. Both are blank by default; invalid or incomplete configuration keeps them hidden. Hosted URLs alone do not guarantee consent—the above form configuration is required before enabling them.
5. Build campaigns in Brevo using only explicitly confirmed, non-blocklisted subscribers. Include Brevo's unsubscribe link/page in every campaign. Test it with a controlled address and verify suppression before any campaign is approved for sending.
6. Send campaigns manually in Brevo only when authorized, within the shared free-tier allowance. Nothing in this website automatically sends marketing mail.

Transactional confirmations do not have a marketing unsubscribe link because they are replies to individual enquiries, not subscriptions. They explicitly state that no marketing signup occurred.

## Tests (no network, no real email)

Use Node.js 22.6+ (Node 24 LTS recommended) for native TypeScript test execution:

```sh
npm ci
npm test
npm run lint
npm run typecheck
npm run build
```

Tests inject a fake Brevo fetch implementation. They cover successful owner/visitor payloads and Reply-To, failures (400/401/403/429/500), missing credentials, timeouts, deterministic retries, duplicate responses, concurrent requests, malformed/partial provider responses, input validation, HTML escaping, origin/format/size checks, honeypots, token expiry, rate limits and local daily budgets. They send no real emails. `--conditions=react-server` allows the server-only modules to be tested outside Next.js.

## Local live test (explicitly sends two real emails)

1. Set the environment with a real Brevo API key and the exact localhost origin; restart `npm run dev`.
2. Open the form at http://localhost:3000. Wait for it to become available. Submit non-sensitive test details using an inbox you control.
3. Confirm the website status and Brevo's logs show both messages accepted/delivered. Confirm the owner notification reaches the existing Cloudflare → Gmail route and has the visitor's Reply-To. Confirm the visitor acknowledgment is from the verified DS2 sender and replies to the business mailbox. Check spam folders.
4. Repeat with an invalid key in a local-only environment; confirm failure without success text or exposed provider details. Restore the real key afterward. Do not use production to intentionally exhaust quotas.
5. Check invalid fields, double clicks, keyboard navigation and mobile form status. Confirm submitted visitors are absent from marketing lists.

## Deployment checklist

- [ ] Add the Brevo key and verified sender variables in the intended Vercel environment. Do not paste the key in source, browser code, screenshots or logs.
- [ ] Set the exact production/preview origin; rebuild after changing public variables.
- [ ] Verify the current account free-tier quota, existing usage and any provider queue; retain Brevo-required free-tier branding.
- [ ] Run tests, lint, typecheck and production build.
- [ ] Deploy only with approval; review the deployed `/api/contact` availability and origin behavior.
- [ ] Perform the two-email controlled live test, including Reply-To and Cloudflare forwarding.
- [ ] Check delivery logs, mobile/keyboard form behavior and privacy wording.
- [ ] Monitor rate limits and quota; add shared WAF/storage controls before expecting global enforcement.
- [ ] Leave marketing URLs unset until consent, double opt-in and unsubscribe are verified.
- [ ] Do not change Cloudflare MX/routing/DNS, sender authentication or Gmail configuration.

## Provider references

- [Brevo transactional API](https://developers.brevo.com/reference/send-transac-email)
- [Batch idempotency and its 30-minute window](https://developers.brevo.com/docs/heterogenous-versions-batch-emails)
- [Brevo free-plan limits](https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan)
- [Hosted signup and unsubscribe forms](https://help.brevo.com/hc/en-us/articles/360019485320-About-sign-up-unsubscribe-and-profile-update-forms)
- [Double opt-in and confirmation evidence](https://help.brevo.com/hc/en-us/articles/208733449-Double-opt-in-DOI-What-it-is-and-how-to-track-user-sign-ups)

## Verification completed in this workspace

- 20 mocked delivery/validation/abuse tests passed.
- ESLint, strict TypeScript and the production build passed.
- The homepage and privacy page returned HTTP 200; subject/message fields and the verified business email were present.
- Without a configured API key, `GET /api/contact` returned HTTP 503 with `available: false` and `Cache-Control: no-store`.
- The generated client bundle contained no `BREVO_API_KEY` reference or Brevo sending endpoint.
- No live email was sent; real Brevo acceptance, inbox delivery and Cloudflare forwarding still need the controlled live test after configuring the key. Browser interaction/visual QA remains unavailable in this session.
- No deployment, campaign sending, DNS or routing changes were performed.
