"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, ArrowRight, Phone, ExternalLink, FileText, Shield } from "lucide-react";
import Link from "next/link";

const VOUCHER_STEPS = [
  { key: "application", label: "Application Submitted", desc: "You applied for a housing choice voucher" },
  { key: "waitlist", label: "On Waitlist", desc: "Waiting for your name to be called" },
  { key: "eligibility", label: "Eligibility Determined", desc: "Your income and household size verified" },
  { key: "voucher_issued", label: "Voucher Issued", desc: "You received your voucher — time to find housing" },
  { key: "inspection", label: "Unit Inspection", desc: "Your chosen unit passes HQS inspection" },
  { key: "lease_up", label: "Lease-Up Complete", desc: "HAP contract signed, you're moved in" },
];

const DC_RESOURCES = [
  { name: "DC Housing Authority (DCHA)", url: "https://www.dchousing.org", phone: "(202) 535-1000" },
  { name: "DCHA HCVP Program", url: "https://www.dchousing.org/topic.aspx?topid=2", phone: null },
  { name: "DC Office of Tenant Advocate", url: "https://ota.dc.gov", phone: "(202) 719-6560" },
];

const PG_RESOURCES = [
  { name: "Housing Authority of PG County (HAPGC)", url: "https://www.hapgc.org", phone: "(301) 883-5570" },
  { name: "HAPGC HCV Program", url: "https://www.hapgc.org/housing-choice-voucher-program", phone: null },
  { name: "PG County DHCD", url: "https://www.princegeorgescountymd.gov/462/Housing-and-Community-Development", phone: "(301) 883-5570" },
];

export default function TenantVoucherPage() {
  const [jurisdiction, setJurisdiction] = useState("dc");
  const [currentStep, setCurrentStep] = useState(0); // For display purposes
  const [isVoucher, setIsVoucher] = useState(false);

  useEffect(() => {
    fetch("/api/tenant/my-home")
      .then((res) => res.json())
      .then((data) => {
        if (data.unit?.jurisdiction) setJurisdiction(data.unit.jurisdiction);
        // Check if tenant has voucher
        if (data.tenant) {
          // This would come from tenant record
        }
      })
      .catch(() => {});
  }, []);

  const resources = jurisdiction === "dc" ? DC_RESOURCES : PG_RESOURCES;
  const jurisdictionLabel = jurisdiction === "dc" ? "Washington, DC" : "Prince George's County, MD";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Voucher Status Tracker
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your Housing Choice Voucher (Section 8) progress in {jurisdictionLabel}.
        </p>
      </div>

      {/* Info card */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="py-4">
          <p className="text-sm text-blue-800">
            <strong>What is Section 8?</strong> The Housing Choice Voucher Program (HCVP) helps
            low-income families afford safe housing. The voucher covers a portion of your rent,
            and you pay the rest.
          </p>
        </CardContent>
      </Card>

      {/* Progress tracker */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your Voucher Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {VOUCHER_STEPS.map((step, i) => {
              const isCompleted = i < currentStep;
              const isCurrent = i === currentStep;

              return (
                <div key={step.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? "bg-green-100 text-green-600"
                        : isCurrent
                          ? "bg-primary/10 text-primary ring-2 ring-primary"
                          : "bg-gray-100 text-gray-400"
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    {i < VOUCHER_STEPS.length - 1 && (
                      <div className={`w-0.5 flex-1 mt-1 ${isCompleted ? "bg-green-300" : "bg-gray-200"}`} />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className={`text-sm font-medium ${isCurrent ? "text-primary" : isCompleted ? "text-green-700" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4 italic">
            Note: This is a visual guide. Contact your housing authority for your actual status.
          </p>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resources — {jurisdictionLabel}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {resources.map((r) => (
            <div key={r.name} className="flex items-start justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">{r.name}</p>
                {r.phone && (
                  <a href={`tel:${r.phone}`} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" /> {r.phone}
                  </a>
                )}
              </div>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Know your rights as voucher tenant */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <FileText className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Know your rights as a voucher holder</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                It&apos;s illegal for landlords to discriminate based on source of income (including vouchers)
                in both DC and PG County.
              </p>
              <Button asChild variant="link" className="h-auto p-0 mt-1 text-xs">
                <Link href="/tenant/rights">
                  Learn more about your protections <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
