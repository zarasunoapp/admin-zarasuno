import { Sparkles, ShieldCheck } from "lucide-react";
import { LoginForm } from "./LoginForm";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="flex min-h-screen bg-ivory">
      {/* Left brand / image panel */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <div className="absolute inset-0 bg-grad-green" />
        <div
          className="absolute inset-0 opacity-25 mix-blend-luminosity"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl" />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/goldenlogo.png" alt="ZaraSuno" className="h-16 w-auto object-contain" />
          </div>

          <div>
            <h1 className="font-display text-4xl font-bold leading-tight">
              Control center for your <span className="text-gold">audiobook</span> platform.
            </h1>
            <p className="mt-4 max-w-md text-white/70">
              Manage books, coins, users, payments, collections and the live website — all from one
              elegant dashboard.
            </p>
            <div className="mt-8 space-y-3">
              <Feature icon={Sparkles} text="Real-time control over the public website" />
              <Feature icon={ShieldCheck} text="Secure, admin-only access" />
            </div>
          </div>

          <p className="text-sm text-white/50">© {new Date().getFullYear()} ZaraSuno.app — All rights reserved.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/goldenlogo.png" alt="ZaraSuno" className="h-14 w-auto object-contain" />
          </div>

          <h2 className="font-display text-3xl font-bold text-ink">Welcome back</h2>
          <p className="mt-1 text-muted">Sign in to the control center</p>

          <div className="mt-8">
            <LoginForm notAuthorized={searchParams.error === "not-authorized"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-white/80">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
        <Icon className="h-4 w-4 text-gold" />
      </div>
      {text}
    </div>
  );
}
