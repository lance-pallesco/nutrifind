import { describe, expect, it } from "vitest";
import { subscriptionStateFor } from "../server/src/modules/billing/billing.service";

describe("subscriptionStateFor", () => {
  it.each([
    ["active", "ACTIVE"],
    ["trialing", "ACTIVE"],
    ["past_due", "PAST_DUE"],
    ["unpaid", "PAST_DUE"],
    ["canceled", "CANCELED"],
    ["incomplete", "INACTIVE"],
  ] as const)("%s maps to %s", (status, expected) => {
    expect(subscriptionStateFor(status)).toBe(expected);
  });
});
