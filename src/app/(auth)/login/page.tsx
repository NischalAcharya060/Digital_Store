import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-6xl items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="hidden lg:block">
          <p className="text-sm font-medium text-[color:var(--color-accent)]">
            Digital Store
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[color:var(--color-text)]">
            Fast checkout for digital products
          </h1>
          <p className="mt-3 max-w-md text-sm text-[color:var(--color-text-muted)]">
            Manage your orders, access delivery codes instantly, and stay up to date
            from one account.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
