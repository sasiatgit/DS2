import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="container privacy-page">
      <p className="eyebrow">404 / PAGE NOT FOUND</p>
      <h1>Let’s get you back on track.</h1>
      <p>
        This page isn’t available. Explore our services or tell us about your
        business challenge.
      </p>
      <Link className="button" href="/">
        Back to DS2
      </Link>
    </main>
  );
}
