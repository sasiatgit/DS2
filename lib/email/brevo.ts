import "server-only";
import type { EmailConfig } from "./config.ts";
import type { EmailContent } from "./templates.ts";
import { isEmail } from "../contact/validation.ts";
export type TransactionalEmail = EmailContent & {
  to: { email: string; name?: string };
  replyTo?: { email: string; name?: string };
};
export class EmailDeliveryError extends Error {
  readonly kind: "unavailable" | "quota" | "configuration" | "invalid-response";
  readonly providerStatus?: number;
  constructor(kind: EmailDeliveryError["kind"], providerStatus?: number) {
    super(`Email delivery: ${kind}`);
    this.kind = kind;
    this.providerStatus = providerStatus;
  }
}
export async function sendTransactionalEmails(
  config: EmailConfig,
  emails: TransactionalEmail[],
  idempotencyKey: string,
  fetcher: typeof fetch = fetch,
) {
  if (
    emails.length < 1 ||
    emails.length > 10 ||
    !/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(
      idempotencyKey,
    )
  )
    throw new EmailDeliveryError("configuration");
  for (const email of emails) {
    if (
      !isEmail(email.to.email) ||
      (email.replyTo && !isEmail(email.replyTo.email)) ||
      /[\r\n]/.test(email.subject) ||
      email.subject.length > 200
    )
      throw new EmailDeliveryError("configuration");
  }
  let response: Response;
  try {
    response = await fetcher("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": config.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: config.from, name: config.fromName },
        subject: emails[0].subject,
        htmlContent: emails[0].htmlContent,
        textContent: emails[0].textContent,
        replyTo: { email: config.from, name: config.fromName },
        messageVersions: emails.map(({ to, replyTo, ...content }) => ({
          ...content,
          to: [to],
          replyTo: replyTo || { email: config.from, name: config.fromName },
        })),
        headers: { idempotencyKey },
        tags: ["ds2-transactional"],
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
  } catch {
    throw new EmailDeliveryError("unavailable");
  }
  const body: unknown = await response.json().catch(() => null);
  const data =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  if (
    response.status === 400 &&
    data.code === "duplicate_parameter" &&
    typeof data.message === "string" &&
    /idempotency/i.test(data.message)
  )
    return { duplicate: true, messageIds: [] as string[] };
  if (!response.ok) {
    const quota = response.status === 429 || data.code === "not_enough_credits";
    throw new EmailDeliveryError(
      quota
        ? "quota"
        : [401, 403].includes(response.status)
          ? "configuration"
          : "unavailable",
      response.status,
    );
  }
  const ids = Array.isArray(data.messageIds)
    ? data.messageIds
    : typeof data.messageId === "string"
      ? [data.messageId]
      : [];
  if (
    ids.length !== emails.length ||
    !ids.every((id) => typeof id === "string" && id.length > 0)
  )
    throw new EmailDeliveryError("invalid-response", response.status);
  return { duplicate: false, messageIds: ids as string[] };
}
