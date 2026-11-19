import Link from "next/link";
import { marketing, marketingEnabled } from "@/lib/marketing/config";
import { Logo } from "@/components/logo";
import { business } from "@/lib/config";
export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <Link className="brand" href="/" aria-label="DS2 home">
            <Logo />
          </Link>
          <p className="footer-tagline">
            Solving Real Problems Through Technology.
          </p>
          <nav aria-label="Footer navigation">
            {["Services", "Products", "About", "Contact"].map((x) => (
              <a href={`/#${x.toLowerCase()}`} key={x}>
                {x}
              </a>
            ))}
            <Link href="/privacy">Privacy Policy</Link>
            {marketingEnabled && (
              <>
                <a href={marketing.signupUrl}>Subscribe to updates</a>
                <a href={marketing.unsubscribeUrl}>Unsubscribe</a>
              </>
            )}
          </nav>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {business.name}. All rights reserved.
          </span>
          <span>{business.location}</span>
        </div>
      </div>
    </footer>
  );
}
