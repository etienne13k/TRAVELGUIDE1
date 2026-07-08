import { Suspense } from "react";
import Script from "next/script";
import SignupForm from "./SignupForm";

export default function SignupPage() {
  const configuredSiteKey = process.env.TURNSTILE_SITE_KEY ?? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
  const turnstileSiteKey = process.env.TURNSTILE_SECRET_KEY ? configuredSiteKey : "";

  return (
    <>
      {turnstileSiteKey && (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      )}
      <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--cb)" }} />}>
        <SignupForm turnstileSiteKey={turnstileSiteKey} />
      </Suspense>
    </>
  );
}
