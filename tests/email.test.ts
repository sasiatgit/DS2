import test from "node:test";
import assert from "node:assert/strict";
import { emailConfig, type EmailConfig } from "../lib/email/config.ts";
import {
  sendTransactionalEmails,
  EmailDeliveryError,
} from "../lib/email/brevo.ts";
import {
  contactNotification,
  inquiryConfirmation,
  businessNotification,
} from "../lib/email/templates.ts";
import { validateEnquiry } from "../lib/contact/validation.ts";
import {
  ContactGuard,
  formToken,
  validToken,
  deliveryKey,
  WINDOW_MS,
} from "../lib/contact/guard.ts";
import { contactHandlers } from "../lib/contact/handler.ts";

const config: EmailConfig = {
  apiKey: "test-key-not-real",
  from: "contact@durgasoftwaresolutions.com",
  fromName: "DS2 - DurgaSoftwareSolutions",
  notificationTo: "contact@durgasoftwaresolutions.com",
  siteUrl: "http://localhost:3000",
};
const enquiry = {
  name: "Visitor Example",
  email: "visitor@example.com",
  subject: "Order follow-ups",
  message: "Please help automate our order follow-ups.",
  business: "Example business",
  phone: "+91 9000000000",
};
const now = 1800000000000;
const token = formToken(config.apiKey, now - 5000);
function request(overrides: object = {}, headers: Record<string, string> = {}) {
  return new Request(`${config.siteUrl}/api/contact`, {
    method: "POST",
    headers: {
      origin: config.siteUrl,
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify({ ...enquiry, token, website: "", ...overrides }),
  });
}
function setup(
  fetcher: typeof fetch = async () =>
    Response.json({ messageIds: ["owner-id", "visitor-id"] }, { status: 201 }),
) {
  const logs: Record<string, string | number>[] = [];
  const guard = new ContactGuard();
  const handlers = contactHandlers({
    config: () => config,
    guard,
    now: () => now,
    fetcher,
    log: (event) => logs.push(event),
  });
  return { ...handlers, logs, guard };
}

test("successful contact sends two transactional versions, with fixed From and distinct Reply-To", async () => {
  let payload: Record<string, unknown> = {};
  let auth = "";
  const app = setup(async (url, options) => {
    assert.equal(url, "https://api.brevo.com/v3/smtp/email");
    auth = new Headers(options?.headers).get("api-key")!;
    payload = JSON.parse(options?.body as string);
    return Response.json(
      { messageIds: ["owner-id", "visitor-id"] },
      { status: 201 },
    );
  });
  const response = await app.POST(request());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).ok, true);
  assert.equal(auth, config.apiKey);
  assert.deepEqual(payload.sender, {
    email: config.from,
    name: config.fromName,
  });
  const versions = payload.messageVersions as {
    to: { email: string }[];
    replyTo: { email: string };
    htmlContent: string;
    textContent: string;
  }[];
  assert.equal(versions.length, 2);
  assert.equal(versions[0].to[0].email, config.notificationTo);
  assert.equal(versions[0].replyTo.email, enquiry.email);
  assert.ok(versions[0].textContent.includes(enquiry.message));
  assert.equal(versions[1].to[0].email, enquiry.email);
  assert.equal(versions[1].replyTo.email, config.from);
  assert.ok(!versions[1].htmlContent.includes(enquiry.message));
  assert.deepEqual(payload.tags, ["ds2-transactional"]);
  assert.ok(!("listIds" in payload));
  assert.ok(!JSON.stringify(app.logs).includes(enquiry.email));
  assert.ok(!JSON.stringify(app.logs).includes(config.apiKey));
});

test("sequential duplicate submissions send only once", async () => {
  let calls = 0;
  const app = setup(async () => {
    calls++;
    return Response.json({ messageIds: ["a", "b"] }, { status: 201 });
  });
  assert.equal((await app.POST(request())).status, 200);
  assert.equal((await app.POST(request())).status, 200);
  assert.equal(calls, 1);
});

test("concurrent submission is locked while provider is pending", async () => {
  let release!: (value: Response) => void;
  let started!: () => void;
  const ready = new Promise<void>((resolve) => {
    started = resolve;
  });
  const app = setup(async () => {
    started();
    return new Promise((resolve) => {
      release = resolve;
    });
  });
  const first = app.POST(request());
  await ready;
  assert.equal((await app.POST(request())).status, 409);
  release(Response.json({ messageIds: ["a", "b"] }, { status: 201 }));
  assert.equal((await first).status, 200);
});

for (const status of [400, 401, 403, 429, 500]) {
  test(`provider HTTP ${status} returns failure, without leaking provider details`, async () => {
    const app = setup(async () =>
      Response.json(
        { code: "error", message: "sensitive-provider-content" },
        { status },
      ),
    );
    const response = await app.POST(request());
    assert.equal(response.status, 503);
    const result = await response.json();
    assert.equal(result.ok, false);
    assert.ok(!JSON.stringify(result).includes("sensitive-provider-content"));
    assert.equal(app.logs[0].event, "contact.email_failed");
  });
}

test("network error can be retried with the identical Brevo idempotency key", async () => {
  const keys: string[] = [];
  const app = setup(async (_url, options) => {
    keys.push(JSON.parse(options!.body as string).headers.idempotencyKey);
    if (keys.length === 1) throw new DOMException("timeout", "TimeoutError");
    return Response.json(
      {
        code: "duplicate_parameter",
        message: "Email for this idempotency key has already been processed",
      },
      { status: 400 },
    );
  });
  assert.equal((await app.POST(request())).status, 503);
  assert.equal((await app.POST(request())).status, 200);
  assert.equal(keys[0], keys[1]);
});

test("unrelated duplicate_parameter errors do not claim success", async () => {
  const app = setup(async () =>
    Response.json(
      { code: "duplicate_parameter", message: "Duplicate recipient" },
      { status: 400 },
    ),
  );
  assert.equal((await app.POST(request())).status, 503);
});

test("missing or partial provider acceptance never claims complete success", async () => {
  for (const body of [{}, { messageIds: ["only-one"] }]) {
    const app = setup(async () => Response.json(body, { status: 201 }));
    assert.equal((await app.POST(request())).status, 503);
  }
});

test("missing credentials disables endpoint without sending", async () => {
  const app = contactHandlers({
    config: () => null,
    guard: new ContactGuard(),
    fetcher: async () => {
      throw new Error("must not send");
    },
  });
  assert.equal((await app.GET(new Request(config.siteUrl))).status, 503);
  assert.equal((await app.POST(request())).status, 503);
  assert.equal(emailConfig({}), null);
  assert.equal(emailConfig({ BREVO_API_KEY: "test", EMAIL_FROM: "bad" }), null);
});

test("invalid input, CRLF header injection and oversized fields are rejected", async () => {
  const app = setup(async () => {
    throw new Error("must not send");
  });
  const response = await app.POST(
    request({
      name: "",
      email: "invalid",
      subject: "Hello\r\nBcc: victim@example.com",
      message: "short",
    }),
  );
  assert.equal(response.status, 422);
  const result = await response.json();
  for (const field of ["name", "email", "subject", "message"])
    assert.ok(result.errors[field]);
  assert.equal(
    validateEnquiry({ ...enquiry, message: "a".repeat(5001) }).ok,
    false,
  );
  assert.equal(
    validateEnquiry({ ...enquiry, business: { nested: "value" } }).ok,
    false,
  );
});

test("cross-origin, malformed JSON and wrong content-type are rejected", async () => {
  const app = setup();
  assert.equal(
    (await app.POST(request({}, { origin: "https://attacker.example" })))
      .status,
    403,
  );
  assert.equal(
    (await app.POST(request({}, { "content-type": "text/plain" }))).status,
    415,
  );
  const malformed = new Request(config.siteUrl, {
    method: "POST",
    headers: { origin: config.siteUrl, "content-type": "application/json" },
    body: "not-json",
  });
  assert.equal((await app.POST(malformed)).status, 400);
  assert.equal(
    (await app.POST(request({ message: "a".repeat(25000) }))).status,
    400,
  );
});

test("honeypot and invalid form tokens reject without email calls", async () => {
  let calls = 0;
  const app = setup(async () => {
    calls++;
    return Response.json({});
  });
  assert.equal(
    (await app.POST(request({ website: "spam.example" }))).status,
    400,
  );
  assert.equal((await app.POST(request({ token: "forged" }))).status, 400);
  assert.equal(calls, 0);
});

test("form token checks timing, authenticity, expiration and future timestamps", () => {
  assert.equal(validToken(token, config.apiKey, now), true);
  assert.equal(validToken(token, "wrong-key", now), false);
  assert.equal(
    validToken(formToken(config.apiKey, now), config.apiKey, now),
    false,
  );
  assert.equal(validToken(token, config.apiKey, now + WINDOW_MS), false);
  assert.equal(
    validToken(formToken(config.apiKey, now + 5000), config.apiKey, now),
    false,
  );
});

test("per-client and per-recipient rate limits stop repeat abuse", async () => {
  const app = setup();
  for (let i = 0; i < 5; i++) await app.POST(request({ token: "invalid" }));
  assert.equal((await app.POST(request())).status, 429);
  const recipient = setup();
  for (let i = 0; i < 3; i++)
    assert.equal(
      (await recipient.POST(request({ subject: `Enquiry ${i}` }))).status,
      200,
    );
  assert.equal(
    (await recipient.POST(request({ subject: "Fourth enquiry" }))).status,
    429,
  );
});

test("local daily budget reserves at most 200 emails and resets the next UTC day", () => {
  const guard = new ContactGuard();
  for (let i = 0; i < 100; i++)
    assert.equal(guard.reserve(`id-${i}`, now), "new");
  assert.equal(guard.reserve("over-budget", now), "quota");
  assert.equal(guard.reserve("new-day", now + 86400000), "new");
});

test("branded templates escape user HTML, retain plaintext and support inquiry types", () => {
  const notification = contactNotification(
    { ...enquiry, message: '<script>alert("x")</script>' },
    config.siteUrl,
  );
  assert.ok(!notification.htmlContent.includes("<script>"));
  assert.ok(notification.htmlContent.includes("&lt;script&gt;"));
  assert.ok(notification.textContent.includes("<script>"));
  for (const kind of ["contact", "service", "project"] as const) {
    const email = inquiryConfirmation(kind, "<img src=x>", config.siteUrl);
    assert.ok(email.htmlContent.includes("&lt;img src=x&gt;"));
    assert.ok(email.htmlContent.includes("max-width:600px"));
    assert.ok(email.htmlContent.includes("ds2-logo.png"));
    assert.ok(email.textContent.includes("not a marketing subscription"));
  }
  assert.ok(
    businessNotification(
      "Project update",
      ["Ready for review"],
      config.siteUrl,
    ).textContent.includes("Ready for review"),
  );
});

test("reusable transactional service rejects invalid recipients before fetching", async () => {
  await assert.rejects(
    sendTransactionalEmails(
      config,
      [
        {
          ...inquiryConfirmation("project", "Visitor", config.siteUrl),
          to: { email: "bad" },
        },
      ],
      deliveryKey("event", config.apiKey),
    ),
    EmailDeliveryError,
  );
});
