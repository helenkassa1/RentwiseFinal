import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
type UserType = "landlord" | "property-manager" | "tenant";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const userType = params.type as UserType | undefined;

  if (userType === "landlord" || userType === "property-manager" || userType === "tenant") {
    redirect(`/sign-up?type=${userType}`);
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-4">Create Your Account</h1>
      <p className="text-center text-muted-foreground mb-12">
        Choose your account type to get started
      </p>

      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="p-8 text-center hover:shadow-lg transition-shadow">
          <div className="text-5xl mb-4">🏠</div>
          <h2 className="text-2xl font-bold mb-2">Landlord</h2>
          <p className="text-muted-foreground mb-4">Manage 1-10 properties</p>
          <ul className="text-left text-sm space-y-2 mb-6 text-muted-foreground">
            <li>• Lease review & generation</li>
            <li>• Compliance tracking</li>
            <li>• Section 8 workflows</li>
          </ul>
          <Button asChild className="w-full">
            <Link href="/signup?type=landlord">Create Account →</Link>
          </Button>
        </Card>

        <Card className="p-8 text-center hover:shadow-lg transition-shadow border-2 border-primary">
          <div className="inline-block bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded mb-2">
            MOST POPULAR
          </div>
          <div className="text-5xl mb-4">🏢</div>
          <h2 className="text-2xl font-bold mb-2">Property Manager</h2>
          <p className="text-muted-foreground mb-4">Manage up to 100 properties</p>
          <ul className="text-left text-sm space-y-2 mb-6 text-muted-foreground">
            <li>• Client portfolios</li>
            <li>• Bulk lease review</li>
            <li>• Team access controls</li>
            <li>• Advanced reporting</li>
          </ul>
          <Button asChild className="w-full">
            <Link href="/signup?type=property-manager">Create Account →</Link>
          </Button>
        </Card>

        <Card className="p-8 text-center hover:shadow-lg transition-shadow">
          <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded mb-2">
            FREE
          </div>
          <div className="text-5xl mb-4">🔑</div>
          <h2 className="text-2xl font-bold mb-2">Tenant</h2>
          <p className="text-muted-foreground mb-4">Know your rights</p>
          <ul className="text-left text-sm space-y-2 mb-6 text-muted-foreground">
            <li>• Free legal guidance</li>
            <li>• Rights assistant AI</li>
            <li>• Document issues</li>
          </ul>
          <Button asChild className="w-full" variant="outline">
            <Link href="/signup?type=tenant">Create Account →</Link>
          </Button>
        </Card>
      </div>

      <div className="text-center mt-8">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
