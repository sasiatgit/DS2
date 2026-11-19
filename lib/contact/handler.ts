import "server-only";
import { randomUUID } from "node:crypto";
import type { EmailConfig } from "../email/config.ts";
import { sendTransactionalEmails, EmailDeliveryError } from "../email/brevo.ts";
import {
  contactNotification,
  inquiryConfirmation,
} from "../email/templates.ts";
import { validateEnquiry } from "./validation.ts";
import {
  ContactGuard,
  deliveryKey,
  digest,
  formToken,
  validToken,
} from "./guard.ts";

type Dependencies = {
  config: () => EmailConfig | null;
  guard: ContactGuard;
  fetcher?: typeof fetch;
  now?: () => number;
  trustedProxy?: boolean;
  log?: (event: Record<string, string | number>) => void;
};
const json = (body: object, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...(status === 429 ? { "Retry-After": "900" } : {}),
    },
  });
const success = () =>
  json({
    ok: true,
    message:
      "Thank you. Your enquiry has been accepted for delivery, and a confirmation email has been requested. Please check your inbox or spam folder.",
  });
async function readBody(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 24000)
    throw new Error("size");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("body");
  let total = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > 24000) {
      await reader.cancel();
      throw new Error("size");
    }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}
export function contactHandlers(deps: Dependencies) {
  const now = deps.now || Date.now;
  const log = deps.log || ((event) => console.info(JSON.stringify(event)));
  const ipKey = (request: Request, secret: string) =>
    digest(
      deps.trustedProxy
        ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            "unknown"
        : "local",
      secret,
    );
  return {
    GET: async (request: Request) => {
      const config = deps.config();
      if (!config)
        return json(
          {
            available: false,
            message:
              "Online enquiries are temporarily unavailable. Please email contact@durgasoftwaresolutions.com.",
          },
          503,
        );
      if (
        !deps.guard.allow(`token:${ipKey(request, config.apiKey)}`, 60, now())
      )
        return json(
          { available: false, message: "Please wait before trying again." },
          429,
        );
      return json({ available: true, token: formToken(config.apiKey, now()) });
    },
    POST: async (request: Request) => {
      const requestId = randomUUID();
      const config = deps.config();
      if (!config)
        return json(
          {
            ok: false,
            message:
              "Online enquiries are temporarily unavailable. Please email contact@durgasoftwaresolutions.com.",
          },
          503,
        );
      if (request.headers.get("origin") !== config.siteUrl)
        return json(
          {
            ok: false,
            message:
              "This request could not be verified. Please reload the page.",
          },
          403,
        );
      if (
        !request.headers
          .get("content-type")
          ?.toLowerCase()
          .startsWith("application/json")
      )
        return json({ ok: false, message: "Unsupported request format." }, 415);
      if (!deps.guard.allow(`post:${ipKey(request, config.apiKey)}`, 5, now()))
        return json(
          {
            ok: false,
            message:
              "Too many attempts. Please wait 15 minutes or email us directly.",
          },
          429,
        );
      let input: unknown;
      try {
        input = await readBody(request);
      } catch {
        return json(
          {
            ok: false,
            message:
              "Invalid or oversized enquiry. Please keep your message under 5,000 characters.",
          },
          400,
        );
      }
      const raw =
        input && typeof input === "object"
          ? (input as Record<string, unknown>)
          : {};
      if (raw.website !== "" || !validToken(raw.token, config.apiKey, now()))
        return json(
          {
            ok: false,
            refreshToken: true,
            message:
              "Please wait a moment and try again. If the form has been open for a while, it will refresh automatically.",
          },
          400,
        );
      const validated = validateEnquiry(input);
      if (!validated.ok)
        return json(
          {
            ok: false,
            errors: validated.errors,
            message: "Please check the highlighted fields.",
          },
          422,
        );
      const data = validated.data;
      const key = deliveryKey(JSON.stringify(data), config.apiKey);
      const reservation = deps.guard.reserve(key, now());
      if (reservation === "accepted") return success();
      if (reservation === "pending")
        return json(
          {
            ok: false,
            message:
              "This enquiry is already being sent. Please wait a moment before retrying.",
          },
          409,
        );
      if (reservation === "quota")
        return json(
          {
            ok: false,
            message:
              "Online enquiries have reached today's sending allowance. Please email us directly.",
          },
          429,
        );
      if (
        !deps.guard.allow(
          `recipient:${digest(data.email, config.apiKey)}`,
          3,
          now(),
        )
      ) {
        deps.guard.release(key);
        return json(
          {
            ok: false,
            message:
              "Too many enquiries for this email address. Please try again later.",
          },
          429,
        );
      }
      try {
        const result = await sendTransactionalEmails(
          config,
          [
            {
              ...contactNotification(data, config.siteUrl),
              to: { email: config.notificationTo },
              replyTo: { email: data.email, name: data.name },
            },
            {
              ...inquiryConfirmation("contact", "there", config.siteUrl),
              to: { email: data.email, name: data.name },
              replyTo: { email: config.from, name: config.fromName },
            },
          ],
          key,
          deps.fetcher,
        );
        deps.guard.accepted(key, now());
        log({
          event: "contact.email_accepted",
          requestId,
          count: 2,
          duplicate: result.duplicate ? 1 : 0,
        });
        return success();
      } catch (error) {
        // No automatic retries: preserve provider idempotency on visitor retry.
        deps.guard.release(key);
        const failure =
          error instanceof EmailDeliveryError
            ? error
            : new EmailDeliveryError("unavailable");
        log({
          event: "contact.email_failed",
          requestId,
          kind: failure.kind,
          status: failure.providerStatus || 0,
        });
        return json(
          {
            ok: false,
            message:
              failure.kind === "quota"
                ? "Our email service is at its sending limit. Please email contact@durgasoftwaresolutions.com directly."
                : "We couldn't confirm email delivery. Please retry with the same details, or email contact@durgasoftwaresolutions.com directly.",
            requestId,
          },
          503,
        );
      }
    },
  };
}
