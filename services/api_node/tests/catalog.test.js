process.env.DB_HOST = "localhost";
process.env.DB_USER = "user";
process.env.DB_PASSWORD = "password";
process.env.DB_NAME = "db";
process.env.JWT_ACCESS_SECRET = "access-secret";
process.env.JWT_REFRESH_SECRET = "refresh-secret";

const path = require("path");
const { execSync } = require("child_process");
const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/db");
const { signAccessToken } = require("../src/utils/tokens");

const runMigrationsAndSeed = () => {
  const serviceRoot = path.resolve(__dirname, "..");
  execSync("node src/db/migrate.js", {
    cwd: serviceRoot,
    stdio: "inherit",
    env: process.env
  });
  execSync("node src/db/seed.js", {
    cwd: serviceRoot,
    stdio: "inherit",
    env: process.env
  });
};

const ensureUser = async ({ email, role }) => {
  await pool.query(
    "INSERT INTO users (email, role, status) VALUES (?, ?, 'ACTIVE') ON DUPLICATE KEY UPDATE role = VALUES(role), status = VALUES(status)",
    [email, role]
  );
  const [rows] = await pool.query("SELECT id, role, status FROM users WHERE email = ?", [
    email
  ]);
  return rows[0];
};

const fetchDestinationId = async (name) => {
  const [rows] = await pool.query("SELECT id FROM destinations WHERE name = ?", [name]);
  return rows[0]?.id;
};

describe("Catalog endpoints", () => {
  let customerToken;
  let adminToken;

  beforeAll(async () => {
    runMigrationsAndSeed();
    const customer = await ensureUser({ email: "customer@example.com", role: "CUSTOMER" });
    const admin = await ensureUser({ email: "admin@example.com", role: "ADMIN" });
    customerToken = signAccessToken(customer);
    adminToken = signAccessToken(admin);
  });

  afterAll(async () => {
    await pool.end();
  });

  it("returns seeded destinations for a customer", async () => {
    const response = await request(app)
      .get("/destinations")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.page).toBe(1);
    expect(response.body.page_size).toBe(10);
  });

  it("filters destinations by state, city, and search", async () => {
    const response = await request(app)
      .get("/destinations?search=Goa&state=Goa&city=Panaji&page=1&page_size=10")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].name).toMatch(/Goa/i);
  });

  it("enforces is_live for customer but not for admin", async () => {
    await pool.query("UPDATE destinations SET is_live = 0 WHERE name = ?", [
      "Ladakh Adventure"
    ]);

    const customerResponse = await request(app)
      .get("/destinations?search=Ladakh")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(customerResponse.status).toBe(200);
    expect(customerResponse.body.data.find((item) => item.name === "Ladakh Adventure"))
      .toBeUndefined();

    const adminResponse = await request(app)
      .get("/destinations?search=Ladakh")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(adminResponse.status).toBe(200);
    expect(adminResponse.body.data.find((item) => item.name === "Ladakh Adventure"))
      .toBeDefined();
  });

  it("returns hotels and packages with expected list shape", async () => {
    const destinationId = await fetchDestinationId("Goa Beach Escape");

    const hotelsResponse = await request(app)
      .get(`/destinations/${destinationId}/hotels?page=1&page_size=5`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(hotelsResponse.status).toBe(200);
    expect(Array.isArray(hotelsResponse.body.data)).toBe(true);
    expect(hotelsResponse.body.page_size).toBe(5);
    expect(hotelsResponse.body.data[0]).toHaveProperty("rating");
    expect(hotelsResponse.body.data[0]).toHaveProperty("price_from");

    const packagesResponse = await request(app)
      .get(`/packages?destination_id=${destinationId}&page=1&page_size=5`)
      .set("Authorization", `Bearer ${customerToken}`);

    expect(packagesResponse.status).toBe(200);
    expect(Array.isArray(packagesResponse.body.data)).toBe(true);
    expect(packagesResponse.body.page_size).toBe(5);
    expect(packagesResponse.body.data[0]).toHaveProperty("title");
    expect(packagesResponse.body.data[0]).toHaveProperty("duration_days");
  });
});
