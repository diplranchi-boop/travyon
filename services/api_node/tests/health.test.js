process.env.DB_HOST = "localhost";
process.env.DB_USER = "user";
process.env.DB_PASSWORD = "password";
process.env.DB_NAME = "db";

const request = require("supertest");
const app = require("../src/app");

describe("GET /health", () => {
  it("returns ok status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
