import "server-only";
import { emailConfig } from "./config.ts";
import { sendTransactionalEmails, EmailDeliveryError } from "./brevo.ts";
import {
  inquiryConfirmation,
  businessNotification,
  type ConfirmationKind,
} from "./templates.ts";

// Only call from trusted server workflows. Reuse the event UUID on retries.
export async function sendInquiryConfirmation(
  kind: ConfirmationKind,
  recipient: { email: string; name: string },
  eventId: string,
) {
  const config = emailConfig();
  if (!config) throw new EmailDeliveryError("configuration");
  return sendTransactionalEmails(
    config,
    [
      {
        ...inquiryConfirmation(kind, recipient.name, config.siteUrl),
        to: recipient,
      },
    ],
    eventId,
  );
}
export async function sendBusinessNotification(
  subject: string,
  paragraphs: string[],
  eventId: string,
) {
  const config = emailConfig();
  if (!config) throw new EmailDeliveryError("configuration");
  return sendTransactionalEmails(
    config,
    [
      {
        ...businessNotification(subject, paragraphs, config.siteUrl),
        to: { email: config.notificationTo },
      },
    ],
    eventId,
  );
}
