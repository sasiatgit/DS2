import { emailConfig } from "@/lib/email/config";
import { ContactGuard } from "@/lib/contact/guard";
import { contactHandlers } from "@/lib/contact/handler";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;
const handlers = contactHandlers({
  config: emailConfig,
  guard: new ContactGuard(),
  trustedProxy: process.env.VERCEL === "1",
});
export const GET = handlers.GET;
export const POST = handlers.POST;
