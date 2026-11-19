"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { validateEnquiry, type FieldErrors } from "@/lib/contact/validation";

type FormReply = {
  ok?: boolean;
  message?: string;
  errors?: FieldErrors;
  refreshToken?: boolean;
};
export function ContactForm() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("Preparing the enquiry form…");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [retrySetup, setRetrySetup] = useState(0);
  const submitting = useRef(false);
  const notice = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    async function prepare() {
      try {
        const response = await fetch("/api/contact", {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok || !data.available || typeof data.token !== "string")
          throw new Error("unavailable");
        setToken(data.token);
        setStatus(
          "We’ll get back to you within hours or the same day. You’ll also receive an email confirmation.",
        );
      } catch {
        if (!controller.signal.aborted)
          setStatus(
            "Online enquiries are temporarily unavailable. Please email contact@durgasoftwaresolutions.com, or try loading the form again.",
          );
      }
    }
    void prepare();
    return () => controller.abort();
  }, [retrySetup]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || complete || !token) return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    const checked = validateEnquiry(fields);
    if (!checked.ok) {
      setErrors(checked.errors);
      setStatus("Please check the highlighted fields.");
      const field = Object.keys(checked.errors)[0];
      form.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();
      return;
    }
    submitting.current = true;
    setPending(true);
    setErrors({});
    setStatus("Sending your enquiry…");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...checked.data,
          token,
          website: fields.website || "",
        }),
        signal: AbortSignal.timeout(20000),
      });
      const result = (await response.json()) as FormReply;
      if (!response.ok || !result.ok) {
        setErrors(result.errors || {});
        setStatus(
          result.message ||
            "We couldn't send your enquiry. Please try again or email us directly.",
        );
        if (result.refreshToken) {
          setToken("");
          setRetrySetup((value) => value + 1);
        }
      } else {
        setComplete(true);
        form.reset();
        setStatus(
          result.message ||
            "Your enquiry has been accepted for delivery. Thank you.",
        );
      }
    } catch {
      setStatus(
        "We couldn't confirm delivery. Your details are still here. Please retry with the same details, or email contact@durgasoftwaresolutions.com.",
      );
    } finally {
      submitting.current = false;
      setPending(false);
      notice.current?.focus();
    }
  }
  const error = (field: keyof FieldErrors) =>
    errors[field] ? (
      <span id={`${field}-error`} className="field-error">
        {errors[field]}
      </span>
    ) : null;
  return (
    <div className="contact-form">
      <h3>Tell us about what you’re looking for.</h3>
      <p
        className="form-notice"
        id="form-status"
        role="status"
        aria-live="polite"
        tabIndex={-1}
        ref={notice}
      >
        {status}
      </p>
      {!token && (
        <button
          className="text-link"
          type="button"
          onClick={() => setRetrySetup((value) => value + 1)}
        >
          Try loading the form again
        </button>
      )}
      <noscript>
        <p>
          Please enable JavaScript to use this form, or email{" "}
          <a href="mailto:contact@durgasoftwaresolutions.com">
            contact@durgasoftwaresolutions.com
          </a>
          .
        </p>
      </noscript>
      <form
        onSubmit={submit}
        aria-describedby="form-status"
        aria-busy={pending}
      >
        <fieldset disabled={!token || pending || complete}>
          <legend className="sr-only">Business enquiry</legend>
          <div className="form-row">
            <label htmlFor="name">
              Your name <span>*</span>
              <input
                id="name"
                name="name"
                autoComplete="name"
                placeholder="Full name"
                required
                minLength={2}
                maxLength={100}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {error("name")}
            </label>
            <label htmlFor="business">
              Business name <small>(optional)</small>
              <input
                id="business"
                name="business"
                autoComplete="organization"
                placeholder="Your business"
                maxLength={150}
                aria-invalid={!!errors.business}
                aria-describedby={
                  errors.business ? "business-error" : undefined
                }
              />
              {error("business")}
            </label>
          </div>
          <div className="form-row">
            <label htmlFor="email">
              Email address <span>*</span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@business.com"
                required
                maxLength={254}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {error("email")}
            </label>
            <label htmlFor="phone">
              Phone / WhatsApp <small>(optional)</small>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="With country code"
                maxLength={40}
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? "phone-error" : undefined}
              />
              {error("phone")}
            </label>
          </div>
          <label htmlFor="subject">
            Subject <span>*</span>
            <input
              id="subject"
              name="subject"
              placeholder="A short summary of your enquiry"
              required
              minLength={3}
              maxLength={150}
              aria-invalid={!!errors.subject}
              aria-describedby={errors.subject ? "subject-error" : undefined}
            />
            {error("subject")}
          </label>
          <label htmlFor="problem">
            What can we help you solve? <span>*</span>
            <textarea
              id="problem"
              name="message"
              rows={4}
              required
              minLength={10}
              maxLength={5000}
              placeholder="Tell us about your business, your idea or what’s slowing you down…"
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "message-error" : undefined}
            />
            {error("message")}
          </label>
          <div className="form-honeypot" aria-hidden="true">
            <label htmlFor="website">
              Leave this field empty
              <input
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>
          <button
            className="button"
            type="submit"
            disabled={!token || pending || complete}
          >
            {pending
              ? "Sending enquiry…"
              : complete
                ? "Enquiry sent"
                : "Submit enquiry"}
            <ArrowUpRight size={18} />
          </button>
        </fieldset>
        <p className="privacy-note">
          We use your details to respond and discuss your project. Brevo
          processes the notification and confirmation emails. Sending an enquiry
          does not subscribe you to marketing. Please don’t include sensitive
          information. <Link href="/privacy">Privacy Policy</Link>
        </p>
      </form>
    </div>
  );
}
