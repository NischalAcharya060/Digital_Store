import { LoginForm } from "@/components/auth/login-form";

// Feature bullet for the left panel
function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
      <div className="flex items-start gap-3">
      <span
          className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-base"
          style={{
            background: "color-mix(in srgb, var(--color-accent) 12%, transparent)",
            color: "var(--color-accent)",
          }}
      >
        {icon}
      </span>
        <div>
          <p className="text-sm font-semibold text-[color:var(--color-text)] leading-snug">{title}</p>
          <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)] leading-relaxed">{desc}</p>
        </div>
      </div>
  );
}

export default function LoginPage() {
  return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-16">

          {/* ── Left panel (desktop only) ── */}
          <div className="hidden lg:flex lg:flex-col">
            {/* Eyebrow */}
            <p
                className="mb-3 text-xs font-bold uppercase tracking-widest"
                style={{ color: "var(--color-accent)" }}
            >
              Digital Store
            </p>

            {/* Headline */}
            <h1
                className="text-4xl font-extrabold leading-tight tracking-tight text-[color:var(--color-text)]"
                style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              The fastest checkout
              <br />
              for digital products.
            </h1>

            {/* Sub */}
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[color:var(--color-text-muted)]">
              One account for everything — checkout, order history, and instant delivery codes.
            </p>

            {/* Feature list */}
            <div className="mt-8 flex flex-col gap-5">
              <Feature
                  icon="⚡"
                  title="Instant delivery codes"
                  desc="Receive your codes the moment your order is placed — no waiting."
              />
              <Feature
                  icon="📦"
                  title="Order history & tracking"
                  desc="Access every order, receipt, and download link from one dashboard."
              />
              <Feature
                  icon="🔒"
                  title="Secure by default"
                  desc="End-to-end encrypted. Your data is never sold or shared with third parties."
              />
            </div>

            {/* Social proof */}
            <div
                className="mt-10 inline-flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{
                  background: "color-mix(in srgb, var(--color-surface-border) 60%, transparent)",
                  border: "1px solid var(--color-surface-border)",
                }}
            >
              {/* Avatars */}
              <div className="flex -space-x-2">
                {["#6366f1","#8b5cf6","#a78bfa"].map((c, i) => (
                    <span
                        key={i}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-[color:var(--color-surface)] text-xs font-bold text-white"
                        style={{ background: c }}
                    >
                  {["A","B","C"][i]}
                </span>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-[color:var(--color-text)]">Trusted by 12,000+ customers</p>
                <p className="text-xs text-[color:var(--color-text-muted)]">★★★★★ 4.9 average rating</p>
              </div>
            </div>
          </div>

          {/* ── Right panel: form ── */}
          <div className="flex w-full justify-center lg:justify-end">
            <LoginForm />
          </div>

        </div>
      </div>
  );
}