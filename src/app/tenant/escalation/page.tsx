"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, Phone, FileText, ExternalLink, ArrowRight, AlertTriangle, Building2, Gavel } from "lucide-react";

const DC_STEPS = [
  {
    title: "1. Document Everything",
    desc: "Keep a log of all issues, communications, and photos using the Documents tab. This is your evidence.",
    link: "/tenant/documents",
    linkLabel: "Go to Documents",
  },
  {
    title: "2. Send Written Notice to Landlord",
    desc: "Send a written letter (email or certified mail) describing the issue and requesting a fix within a reasonable time. Keep a copy.",
    link: null,
    linkLabel: null,
  },
  {
    title: "3. File a Complaint with DCRA",
    desc: "If the landlord doesn't respond, file a housing code complaint with the DC Department of Consumer and Regulatory Affairs.",
    link: "https://dcra.dc.gov/service/file-housing-code-complaint",
    linkLabel: "DCRA Complaint Portal",
    phone: "(202) 442-4400",
  },
  {
    title: "4. Request a Hearing at OTA",
    desc: "For rent-related disputes, you can request a hearing at the Office of the Tenant Advocate.",
    link: "https://ota.dc.gov",
    linkLabel: "Office of Tenant Advocate",
    phone: "(202) 719-6560",
  },
  {
    title: "5. File in DC Superior Court",
    desc: "For serious violations, you can file a Tenant Petition in DC Superior Court. Consider contacting Legal Aid first.",
    link: "https://www.dccourts.gov/services/civil-matters/landlord-and-tenant",
    linkLabel: "DC Courts - Landlord & Tenant",
    phone: null,
  },
  {
    title: "6. Contact Legal Aid",
    desc: "Free legal assistance for DC tenants facing housing issues.",
    link: "https://www.lawhelp.org/dc",
    linkLabel: "DC Legal Aid",
    phone: "(202) 628-1161",
  },
];

const PG_STEPS = [
  {
    title: "1. Document Everything",
    desc: "Keep a log of all issues, communications, and photos using the Documents tab.",
    link: "/tenant/documents",
    linkLabel: "Go to Documents",
  },
  {
    title: "2. Send Written Notice to Landlord",
    desc: "Send written notice via email or certified mail describing the issue and requesting repairs.",
    link: null,
    linkLabel: null,
  },
  {
    title: "3. File with PG County Code Enforcement",
    desc: "File a property maintenance complaint with Prince George's County Department of Permitting, Inspections, and Enforcement.",
    link: "https://www.princegeorgescountymd.gov/665/Code-Compliance",
    linkLabel: "PG County Code Enforcement",
    phone: "(301) 883-6100",
  },
  {
    title: "4. File with DHCD",
    desc: "Maryland Department of Housing and Community Development handles tenant complaints statewide.",
    link: "https://dhcd.maryland.gov",
    linkLabel: "Maryland DHCD",
    phone: "(800) 756-0119",
  },
  {
    title: "5. File in District Court",
    desc: "For rent escrow or breach of lease, file in the District Court of Maryland for Prince George's County.",
    link: "https://mdcourts.gov/district",
    linkLabel: "Maryland District Court",
    phone: null,
  },
  {
    title: "6. Contact Legal Aid",
    desc: "Free legal assistance for Maryland tenants.",
    link: "https://www.mdlab.org",
    linkLabel: "Maryland Legal Aid",
    phone: "(410) 539-5340",
  },
];

export default function TenantEscalationPage() {
  const [jurisdiction, setJurisdiction] = useState("dc");

  useEffect(() => {
    fetch("/api/tenant/my-home")
      .then((res) => res.json())
      .then((data) => {
        if (data.unit?.jurisdiction) setJurisdiction(data.unit.jurisdiction);
      })
      .catch(() => {});
  }, []);

  const steps = jurisdiction === "dc" ? DC_STEPS : PG_STEPS;
  const jurisdictionLabel = jurisdiction === "dc" ? "Washington, DC" : "Prince George's County, MD";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Gavel className="h-6 w-6 text-primary" />
          Escalation Guide
        </h1>
        <p className="text-muted-foreground mt-1">
          Step-by-step process for escalating unresolved issues in {jurisdictionLabel}.
        </p>
      </div>

      {/* Warning */}
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Before escalating</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Always try to resolve issues directly with your landlord first. Keep written records
                of all communication attempts. This documentation strengthens your case if you need to escalate.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jurisdiction toggle */}
      <div className="flex gap-2">
        <Button
          variant={jurisdiction === "dc" ? "default" : "outline"}
          onClick={() => setJurisdiction("dc")}
          size="sm"
        >
          Washington, DC
        </Button>
        <Button
          variant={jurisdiction !== "dc" ? "default" : "outline"}
          onClick={() => setJurisdiction("pg_county")}
          size="sm"
        >
          PG County, MD
        </Button>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, i) => (
          <Card key={i}>
            <CardContent className="py-4">
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {step.link && (
                  step.link.startsWith("/") ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={step.link}>
                        {step.linkLabel} <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline" size="sm">
                      <a href={step.link} target="_blank" rel="noopener noreferrer">
                        {step.linkLabel} <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </Button>
                  )
                )}
                {(step as { phone?: string | null }).phone && (
                  <a
                    href={`tel:${(step as { phone: string }).phone}`}
                    className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {(step as { phone: string }).phone}
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI help */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6 text-center space-y-3">
          <Scale className="mx-auto h-8 w-8 text-primary" />
          <h3 className="font-semibold">Need personalized guidance?</h3>
          <p className="text-sm text-muted-foreground">
            Our AI Rights Assistant can help you understand your specific situation and next steps.
          </p>
          <Button asChild>
            <Link href="/tenant/rights">
              Open Rights Assistant <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
