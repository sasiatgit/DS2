import Image from "next/image";

export function Logo({ priority = false }: { priority?: boolean }) {
  return (
    <Image
      src="/brand/ds2-logo.png"
      alt="DurgaSoftwareSolutions (DS2) — Services, Products, Innovation"
      width={2172}
      height={724}
      className="company-logo"
      sizes="(max-width: 760px) 180px, 270px"
      priority={priority}
    />
  );
}
