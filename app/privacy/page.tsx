import Link from "next/link";
import type { Metadata } from "next";
import { business } from "@/lib/config";
export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How DS2 handles website visits and business enquiries.",
  alternates: { canonical: "/privacy" },
};
export default function Privacy() {
  return (
    <main id="main" className="container privacy-page">
      <p className="eyebrow">DURGASOFTWARESOLUTIONS</p>
      <h1>Privacy Policy</h1>
      <p>
        DurgaSoftwareSolutions (DS2) is an independent technology services and
        product development business operated by {business.founder}, a
        GST-registered sole proprietor in Chennai, Tamil Nadu, India.
      </p>
      <h2>Enquiry form</h2>
      <p>
        When you submit an enquiry, we process your name, email address,
        subject, message and any optional business or phone details to respond
        and discuss your project. Brevo processes the owner notification and
        your automated acknowledgment. The business notification is delivered to
        our contact mailbox and forwarded through Cloudflare Email Routing to
        the owner’s Gmail. Please do not include passwords, payment details or
        other sensitive information.
      </p>
      <h2>Email handling and retention</h2>
      <p>
        Enquiries are not stored in a website database. Correspondence is
        retained in the business mailbox as needed to respond, manage an ongoing
        relationship or meet applicable recordkeeping obligations. Brevo retains
        transactional delivery records under the account’s settings and its own
        terms. Technical application logs record delivery status and a random
        request reference, not your message or email address. Short-lived,
        hashed rate-limit and duplicate records help protect the form from
        abuse.
      </p>
      <h2>Marketing choices</h2>
      <p>
        Submitting an enquiry never subscribes you to marketing. Any future
        newsletter signup will be separate and require explicit consent and
        email confirmation. Marketing messages will include Brevo’s unsubscribe
        link. You can also use our unsubscribe form when it is available.
        Unsubscribing from marketing does not prevent replies or transactional
        messages about your enquiries.
      </p>
      <h2>Direct contact</h2>
      <p>
        If you contact us through an available email or WhatsApp link, we use
        the information you choose to share to respond, understand your enquiry
        and discuss your project. These services process communications under
        their own privacy terms. We do not sell enquiry information. We retain
        correspondence only as needed for the enquiry, an ongoing business
        relationship or applicable recordkeeping obligations.
      </p>
      <h2>Website visits</h2>
      <p>
        This website does not add analytics, advertising trackers or
        non-essential cookies. The hosting provider may process basic technical
        request information, such as IP addresses and browser details, to
        operate and protect the website.
      </p>
      <h2>External websites</h2>
      <p>
        NammaTravelAssist is a separate product website. Following its link
        takes you to a service with its own privacy practices.
      </p>
      <h2>Your information and questions</h2>
      <p>
        You may request access, correction or deletion of information shared
        with DS2 by replying to your existing correspondence
        {business.email ? (
          <>
            {" "}
            or emailing{" "}
            <a href={`mailto:${business.email}`}>{business.email}</a>
          </>
        ) : (
          ". A dedicated public contact channel will be added when available"
        )}
        . Requests are subject to applicable recordkeeping obligations.
      </p>
      <h2>Future changes</h2>
      <p>
        This notice will be updated if our collection, email providers,
        retention practices or use of analytics changes.
      </p>
      <Link href="/">← Back to DS2</Link>
    </main>
  );
}
