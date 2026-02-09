import type { Client, PortalProperty } from "./types";

export const MOCK_CLIENTS: Client[] = [
  { id: "c1", name: "Kassa Holdings" },
  { id: "c2", name: "Gainesville Partners" },
];

export const MOCK_PROPERTIES_FOR_CLIENTS: PortalProperty[] = [
  {
    id: "p1",
    addressLine1: "1607 Gainesville St SE",
    city: "Washington",
    state: "DC",
    zip: "20020",
    unitsCount: 1,
    clientId: "c1",
    openMaintenance: 2,
    pendingApplications: 0,
    complianceDeadlinesSoon: 1,
    unreadMessages: 1,
  },
  {
    id: "p2",
    addressLine1: "88 River Rd",
    city: "Hyattsville",
    state: "MD",
    zip: "20785",
    unitsCount: 2,
    clientId: "c2",
    openMaintenance: 0,
    pendingApplications: 2,
    complianceDeadlinesSoon: 0,
    unreadMessages: 0,
  },
];
