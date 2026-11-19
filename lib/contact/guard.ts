import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
export const WINDOW_MS = 30 * 60 * 1000;
export function digest(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}
export function formToken(secret: string, now = Date.now()) {
  const payload = `${now}.${randomUUID()}`;
  return `${payload}.${digest(`form:${payload}`, secret)}`;
}
export function validToken(token: unknown, secret: string, now = Date.now()) {
  if (typeof token !== "string" || token.length > 160) return false;
  const [timestamp, id, signature, extra] = token.split(".");
  if (extra || !timestamp || !id || !/^[a-f0-9]{64}$/.test(signature || ""))
    return false;
  const age = now - Number(timestamp);
  if (!Number.isFinite(age) || age < 2000 || age > WINDOW_MS) return false;
  const expected = digest(`form:${timestamp}.${id}`, secret);
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
export function deliveryKey(payload: string, secret: string) {
  const hash = digest(`delivery:${payload}`, secret);
  // Stable UUID-shaped key: identical requests share Brevo's idempotency window.
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}
export class ContactGuard {
  private attempts = new Map<string, { count: number; until: number }>();
  private requests = new Map<
    string,
    { until: number; state: "pending" | "accepted" }
  >();
  private day = "";
  private emailsReserved = 0;
  allow(key: string, limit: number, now: number) {
    for (const [id, value] of this.attempts)
      if (value.until <= now) this.attempts.delete(id);
    const entry = this.attempts.get(key) || {
      count: 0,
      until: now + 15 * 60 * 1000,
    };
    if (
      entry.count >= limit ||
      (!this.attempts.has(key) && this.attempts.size >= 10000)
    )
      return false;
    entry.count++;
    this.attempts.set(key, entry);
    return true;
  }
  reserve(key: string, now: number): "new" | "pending" | "accepted" | "quota" {
    for (const [id, value] of this.requests)
      if (value.until <= now) this.requests.delete(id);
    const existing = this.requests.get(key);
    if (existing) return existing.state;
    const day = new Date(now).toISOString().slice(0, 10);
    if (day !== this.day) {
      this.day = day;
      this.emailsReserved = 0;
    }
    // Conservative local guard: 100 submissions / 200 email attempts per UTC day.
    // This is NOT a distributed or account-wide quota counter.
    if (this.emailsReserved + 2 > 200) return "quota";
    this.emailsReserved += 2;
    this.requests.set(key, { until: now + WINDOW_MS, state: "pending" });
    return "new";
  }
  accepted(key: string, now: number) {
    this.requests.set(key, { until: now + WINDOW_MS, state: "accepted" });
  }
  release(key: string) {
    this.requests.delete(key);
  }
}
