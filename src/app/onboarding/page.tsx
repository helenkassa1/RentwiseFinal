"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Building2, Key, ArrowRight, Search, MapPin, Home, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const roles = [
  {
    id: "landlord",
    label: "Landlord",
    icon: Building2,
    description: "I own rental properties and manage them directly.",
    href: "/dashboard",
  },
  {
    id: "property-manager",
    label: "Property Manager",
    icon: Building2,
    description: "I manage properties on behalf of owners.",
    href: "/dashboard",
  },
  {
    id: "tenant",
    label: "Tenant",
    icon: Key,
    description: "I rent a home and want to know my rights.",
    href: "/tenant",
  },
];

type MatchedUnit = {
  id: string;
  propertyId: string;
  identifier: string;
  bedrooms: number | null;
  bathrooms: string | null;
  squareFeet: number | null;
  rentAmount: string | null;
  status: string;
};

type MatchedProperty = {
  id: string;
  name: string | null;
  address: string;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  jurisdiction: string;
  propertyType: string | null;
  units: MatchedUnit[];
};

export default function OnboardingPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  // Tenant claim flow state
  const [step, setStep] = useState<"role" | "address" | "results" | "claiming">("role");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [matchedProperties, setMatchedProperties] = useState<MatchedProperty[]>([]);
  const [noResults, setNoResults] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [claimError, setClaimError] = useState("");

  const handleContinue = () => {
    const role = roles.find((r) => r.id === selected);
    if (!role) return;

    if (role.id === "tenant") {
      setStep("address");
    } else {
      router.push(role.href);
    }
  };

  const handleSearch = async () => {
    if (!address.trim()) return;
    setSearching(true);
    setNoResults(false);
    setMatchedProperties([]);

    try {
      const res = await fetch("/api/tenant/search-property", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, city, state, zipCode }),
      });
      const data = await res.json();
      if (data.properties && data.properties.length > 0) {
        setMatchedProperties(data.properties);
        setStep("results");
      } else {
        setNoResults(true);
      }
    } catch {
      setNoResults(true);
    } finally {
      setSearching(false);
    }
  };

  const handleClaimUnit = async () => {
    if (!selectedUnit) return;
    setStep("claiming");
    setClaimError("");

    try {
      const res = await fetch("/api/tenant/claim-unit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitId: selectedUnit }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/tenant");
      } else {
        setClaimError(data.error || "Failed to claim unit. Please try again.");
        setStep("results");
      }
    } catch {
      setClaimError("Something went wrong. Please try again.");
      setStep("results");
    }
  };

  const handleSkip = () => {
    router.push("/tenant");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
            <Shield className="h-6 w-6" aria-hidden />
            RentWise
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {/* Step 1: Role selection */}
        {step === "role" && (
          <div className="w-full max-w-lg space-y-6 text-center">
            <h1 className="text-3xl font-bold">Welcome to RentWise!</h1>
            <p className="text-muted-foreground">
              Tell us about yourself so we can personalize your experience.
            </p>
            <div className="space-y-3">
              {roles.map((role) => (
                <Card
                  key={role.id}
                  className={`cursor-pointer transition-all ${selected === role.id ? "ring-2 ring-primary" : "hover:border-primary/50"}`}
                  onClick={() => setSelected(role.id)}
                >
                  <CardContent className="flex items-center gap-4 py-4">
                    <role.icon className="h-8 w-8 text-primary shrink-0" />
                    <div className="text-left">
                      <p className="font-semibold">{role.label}</p>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button
              className="w-full"
              size="lg"
              disabled={!selected}
              onClick={handleContinue}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Step 2: Address entry (tenant only) */}
        {step === "address" && (
          <div className="w-full max-w-lg space-y-6">
            <div className="text-center">
              <MapPin className="mx-auto h-10 w-10 text-primary mb-3" />
              <h1 className="text-2xl font-bold">Where do you live?</h1>
              <p className="text-muted-foreground mt-1">
                Enter your address so we can connect you with your landlord&apos;s property.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-1">Street Address *</label>
                <Input
                  id="address"
                  placeholder="e.g. 123 Main St"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium mb-1">State</label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium mb-1">ZIP Code</label>
                  <Input
                    id="zip"
                    placeholder="ZIP"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {noResults && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="py-4">
                  <p className="text-sm text-amber-800 font-medium">
                    No matching properties found.
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Your landlord may not have added this property yet. You can still continue
                    and link your home later.
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={handleSkip}>
                Skip for now
              </Button>
              <Button
                className="flex-1"
                disabled={!address.trim() || searching}
                onClick={handleSearch}
              >
                {searching ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Search
              </Button>
            </div>

            <button
              className="w-full text-sm text-muted-foreground hover:text-primary"
              onClick={() => setStep("role")}
            >
              ← Back to role selection
            </button>
          </div>
        )}

        {/* Step 3: Property/unit selection */}
        {step === "results" && (
          <div className="w-full max-w-lg space-y-6">
            <div className="text-center">
              <Home className="mx-auto h-10 w-10 text-primary mb-3" />
              <h1 className="text-2xl font-bold">Select your unit</h1>
              <p className="text-muted-foreground mt-1">
                We found {matchedProperties.length} matching {matchedProperties.length === 1 ? "property" : "properties"}.
                Select your unit below.
              </p>
            </div>

            {claimError && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="py-3">
                  <p className="text-sm text-red-700">{claimError}</p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {matchedProperties.map((property) => (
                <Card key={property.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Building2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">
                          {property.name || property.address}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {property.address}
                          {property.city && `, ${property.city}`}
                          {property.state && `, ${property.state}`}
                          {property.zipCode && ` ${property.zipCode}`}
                        </p>
                      </div>
                    </div>

                    {property.units.length === 0 ? (
                      <p className="text-sm text-muted-foreground pl-8">
                        No available units at this property.
                      </p>
                    ) : (
                      <div className="space-y-2 pl-8">
                        {property.units.map((unit) => (
                          <button
                            key={unit.id}
                            className={`w-full text-left rounded-lg border p-3 transition-all ${
                              selectedUnit === unit.id
                                ? "ring-2 ring-primary border-primary bg-primary/5"
                                : "hover:border-primary/50"
                            }`}
                            onClick={() => setSelectedUnit(unit.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm">{unit.identifier}</p>
                                <p className="text-xs text-muted-foreground">
                                  {unit.bedrooms && `${unit.bedrooms} bed`}
                                  {unit.bathrooms && ` · ${unit.bathrooms} bath`}
                                  {unit.squareFeet && ` · ${unit.squareFeet} sqft`}
                                </p>
                              </div>
                              {unit.rentAmount && (
                                <span className="text-sm font-semibold text-primary">
                                  ${Number(unit.rentAmount).toLocaleString()}/mo
                                </span>
                              )}
                              {selectedUnit === unit.id && (
                                <CheckCircle2 className="h-5 w-5 text-primary ml-2" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep("address");
                  setSelectedUnit(null);
                }}
              >
                ← Back
              </Button>
              <Button
                className="flex-1"
                disabled={!selectedUnit}
                onClick={handleClaimUnit}
              >
                Claim this unit <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Claiming state */}
        {step === "claiming" && (
          <div className="text-center space-y-4">
            <Loader2 className="mx-auto h-10 w-10 text-primary animate-spin" />
            <h2 className="text-xl font-bold">Linking your home...</h2>
            <p className="text-muted-foreground">Setting up your tenant portal.</p>
          </div>
        )}
      </main>
    </div>
  );
}
