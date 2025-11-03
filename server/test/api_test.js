import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../index.js"; // 

describe("health", () => {
  it("GET /api/health", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
