import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../server/src/app";

describe("API foundation", () => {
  it("returns a request id from the health endpoint", async () => {
    const response = await request(createApp()).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
    expect(response.headers["x-request-id"]).toBeTruthy();
  });

  it("returns the standard error shape for unknown routes", async () => {
    const response = await request(createApp()).get("/api/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("NOT_FOUND");
    expect(response.body.error.requestId).toBeTruthy();
  });
});
