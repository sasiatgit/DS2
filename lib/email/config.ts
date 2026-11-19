import "server-only";
import { isEmail } from "../contact/validation.ts";
export type EmailConfig = {
  apiKey: string;
  from: string;
  fromName: string;
  notificationTo: string;
  siteUrl: string;
};
export function emailConfig(
  env: Readonly<Record<string, string | undefined>> = process.env,
): EmailConfig | null {
  const apiKey = env.BREVO_API_KEY?.trim();
  const from = env.EMAIL_FROM?.trim() || "contact@durgasoftwaresolutions.com";
  const fromName =
    env.EMAIL_FROM_NAME?.trim() || "DS2 - DurgaSoftwareSolutions";
  const notificationTo =
    env.EMAIL_NOTIFICATION_TO?.trim() || "contact@durgasoftwaresolutions.com";
  if (
    !apiKey ||
    !isEmail(from) ||
    !isEmail(notificationTo) ||
    !fromName ||
    fromName.length > 150 ||
    /[\r\n]/.test(fromName)
  )
    return null;
  try {
    const url = new URL(
      env.NEXT_PUBLIC_SITE_URL || "https://durgasoftwaresolutions.com",
    );
    if (
      url.protocol !== "https:" &&
      !(
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname)
      )
    )
      return null;
    return { apiKey, from, fromName, notificationTo, siteUrl: url.origin };
  } catch {
    return null;
  }
}
