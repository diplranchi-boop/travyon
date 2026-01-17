process.env.DB_HOST = "localhost";
process.env.DB_USER = "user";
process.env.DB_PASSWORD = "password";
process.env.DB_NAME = "db";

const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/db");

jest.mock("../src/db", () => ({
  query: jest.fn()
}));

describe("Catalog API", () => {
  beforeEach(() => {
    pool.query.mockReset();
  });

  it("rejects catalog reads without a role", async () => {
    const response = await request(app).get("/destinations");

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "Forbidden" });
  });

  it("returns destinations for customer", async () => {
    pool.query
      .mockResolvedValueOnce([[{ total: 1 }]])
      .mockResolvedValueOnce([
        [
          {
            id: 1,
            name: "Goa Beaches",
            state: "Goa",
            city: "Panaji",
            status: "ACTIVE",
            is_live: 1,
            created_at: "2024-01-01",
            updated_at: "2024-01-01"
          }
        ]
      ]);

    const response = await request(app)
      .get("/destinations?search=Goa&page=1")
      .set("x-user-role", "CUSTOMER");

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.data).toHaveLength(1);
    expect(pool.query.mock.calls[0][0]).toContain("is_live = 1");
    expect(pool.query.mock.calls[0][0]).toContain("status = 'ACTIVE'");
  });

  it("returns hotels for a destination", async () => {
    pool.query
      .mockResolvedValueOnce([[{ id: 1 }]])
      .mockResolvedValueOnce([
        [
          {
            id: 10,
            destination_id: 1,
            name: "Casa Goa Boutique Stay",
            status: "ACTIVE",
            is_live: 1,
            created_at: "2024-01-01",
            updated_at: "2024-01-01"
          }
        ]
      ]);

    const response = await request(app)
      .get("/destinations/1/hotels")
      .set("x-user-role", "AGENT");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(pool.query.mock.calls[1][0]).toContain("is_live = 1");
  });

  it("filters packages by destination", async () => {
    pool.query.mockResolvedValueOnce([
      [
        {
          id: 20,
          destination_id: 1,
          name: "Goa Sunrise Getaway",
          status: "ACTIVE",
          is_live: 1,
          price: "15999.00",
          created_at: "2024-01-01",
          updated_at: "2024-01-01"
        }
      ]
    ]);

    const response = await request(app)
      .get("/packages?destination_id=1")
      .set("x-user-role", "CUSTOMER");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(pool.query.mock.calls[0][0]).toContain("destination_id = ?");
  });

  it("allows admins to toggle is_live", async () => {
    pool.query
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[{ id: 1, is_live: 0 }]]);

    const response = await request(app)
      .patch("/destinations/1")
      .set("x-user-role", "ADMIN")
      .send({ is_live: false });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 1, is_live: 0 });
  });

  it("rejects non-admin live toggles", async () => {
    const response = await request(app)
      .patch("/destinations/1")
      .set("x-user-role", "CUSTOMER")
      .send({ is_live: true });

    expect(response.status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });
});
