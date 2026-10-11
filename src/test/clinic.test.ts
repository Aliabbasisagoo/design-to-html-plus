import { describe, expect, it } from "vitest";
import { clinic } from "@/lib/clinic";

describe("Verified Cosmetico listing", () => {
  it("uses the exact listing's telephone", () => {
    expect(clinic.telephone).toBe("+923398480200");
  });
  it("uses the listed opening hours", () => {
    expect(clinic.hours).toBe("Monday–Saturday · 10:00 AM–6:00 PM");
  });
  it("keeps Sunday closed", () => {
    expect(clinic.closed).toBe("Sunday · Closed");
  });
  it("links to the exact place", () => {
    expect(new URL(clinic.maps).searchParams.get("query_place_id")).toBe("ChIJYciZStq_3zgRiVTDG7VLQrw");
  });
});