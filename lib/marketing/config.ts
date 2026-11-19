// Marketing is deliberately isolated from contact enquiries and transactional mail.
// Configure only Brevo-hosted forms reviewed for explicit consent / double opt-in.
function hostedUrl(value: string | undefined) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.href
      : undefined;
  } catch {
    return undefined;
  }
}
export const marketing = {
  signupUrl: hostedUrl(process.env.NEXT_PUBLIC_BREVO_SIGNUP_URL),
  unsubscribeUrl: hostedUrl(process.env.NEXT_PUBLIC_BREVO_UNSUBSCRIBE_URL),
};
// Both must be configured so subscribers always have an unsubscribe route.
export const marketingEnabled = Boolean(
  marketing.signupUrl && marketing.unsubscribeUrl,
);
