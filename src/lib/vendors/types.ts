export type Jurisdiction = "dc" | "pg";

export type Trade =
  | "plumbing"
  | "hvac"
  | "electrical"
  | "handyman"
  | "pest"
  | "locksmith"
  | "cleaning"
  | "general";

export type VendorSource = "google" | "thumbtack" | "taskrabbit";

export type LicenseStatus =
  | "verified"
  | "not_provided"
  | "unverified"
  | "not_required_unknown";

export type VendorResult = {
  id: string;
  name: string;
  source: VendorSource;
  phone?: string;
  website?: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  licenseNumber?: string;
  licenseStatus: LicenseStatus;
  licenseNotes?: string;
  distanceMiles?: number;
  mapsUrl?: string;
};
