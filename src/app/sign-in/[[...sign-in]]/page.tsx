import { SignIn } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const params = await searchParams;
  const redirectUrl = params.redirect_url || "/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn afterSignInUrl={redirectUrl} />
    </div>
  );
}
