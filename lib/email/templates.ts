import type { Enquiry } from "../contact/validation.ts";
export type EmailContent = {
  subject: string;
  htmlContent: string;
  textContent: string;
};
export const escapeHtml = (text: string) =>
  text.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );

function branded(
  title: string,
  paragraphs: string[],
  siteUrl: string,
): EmailContent {
  const safeTitle = escapeHtml(title);
  const htmlContent = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${safeTitle}</title></head><body style="margin:0;background:#edf4fd;font-family:Arial,sans-serif;color:#14233b"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border-radius:16px"><tr><td style="padding:28px"><img src="${escapeHtml(siteUrl)}/brand/ds2-logo.png" alt="DS2 - DurgaSoftwareSolutions" width="240" style="display:block;width:240px;max-width:100%;height:auto"><h1 style="font-size:24px;line-height:1.3;color:#0868cf">${safeTitle}</h1>${paragraphs.map((text) => `<p style="font-size:16px;line-height:1.7;overflow-wrap:anywhere;white-space:pre-wrap">${escapeHtml(text)}</p>`).join("")}<hr style="border:0;border-top:1px solid #dbe5f1;margin:28px 0"><p style="font-size:12px;line-height:1.6;color:#5d697b">DS2 – DurgaSoftwareSolutions<br>Solving Real Problems Through Technology.<br>Chennai, Tamil Nadu, India.</p><p style="font-size:12px;color:#5d697b">This is a transactional message about your enquiry, not a marketing subscription. <a href="${escapeHtml(siteUrl)}/privacy" style="color:#0868cf">Privacy Policy</a></p></td></tr></table></td></tr></table></body></html>`;
  return {
    subject: title,
    htmlContent,
    textContent: `${title}\n\n${paragraphs.join("\n\n")}\n\nDS2 – DurgaSoftwareSolutions\nChennai, Tamil Nadu, India.\nThis is a transactional message, not a marketing subscription.\nPrivacy: ${siteUrl}/privacy`,
  };
}
export function contactNotification(
  data: Enquiry,
  siteUrl: string,
): EmailContent {
  return branded(
    `New DS2 enquiry: ${data.subject}`,
    [
      `Name: ${data.name}\nEmail: ${data.email}\nBusiness: ${data.business || "Not provided"}\nPhone / WhatsApp: ${data.phone || "Not provided"}`,
      `Subject: ${data.subject}`,
      data.message,
      "Reply to this email to respond directly to the visitor.",
    ],
    siteUrl,
  );
}
export type ConfirmationKind = "contact" | "service" | "project";
export function inquiryConfirmation(
  kind: ConfirmationKind,
  name: string,
  siteUrl: string,
): EmailContent {
  const label = {
    contact: "enquiry",
    service: "service enquiry",
    project: "project enquiry",
  }[kind];
  // Do not reflect submitted message/links into mail sent to an unverified address.
  return branded(
    `We've received your ${label} — DS2`,
    [
      `Hello ${name},`,
      `Thank you for contacting DurgaSoftwareSolutions. We've received your ${label} and will review the details before getting back to you.`,
      "You can reply to this email if you would like to add anything. Please don't include passwords, payment details or other sensitive information.",
      "If you didn't submit an enquiry, you can ignore this message. You have not been subscribed to marketing emails.",
    ],
    siteUrl,
  );
}
export function businessNotification(
  title: string,
  paragraphs: string[],
  siteUrl: string,
): EmailContent {
  return branded(title, paragraphs, siteUrl);
}
