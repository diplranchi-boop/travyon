process.env.DB_HOST = "localhost";
process.env.DB_USER = "user";
process.env.DB_PASSWORD = "password";
process.env.DB_NAME = "db";
process.env.JWT_ACCESS_SECRET = "access-secret";
process.env.JWT_REFRESH_SECRET = "refresh-secret";

const request = require("supertest");
const app = require("../src/app");
const authModel = require("../src/models/authModel");
const catalogModel = require("../src/models/catalogModel");
const { signAccessToken } = require("../src/utils/tokens");

jest.mock("../src/models/authModel", () => ({
  findUserById: jest.fn()
}));

jest.mock("../src/models/catalogModel", () => ({
  listDestinations: jest.fn(),
  countDestinations: jest.fn(),
  getDestinationById: jest.fn(),
  listHotelsByDestination: jest.fn(),
  countHotelsByDestination: jest.fn(),
  listPackages: jest.fn(),
  countPackages: jest.fn()
}));

const authHeader = () => {
  const user = { id: 42, role: "CUSTOMER", status: "ACTIVE" };
  authModel.findUserById.mockResolvedValue(user);
  const token = signAccessToken(user);
  return `Bearer ${token}`;
};

describe("Catalog endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lists destinations with pagination", async () => {
    const destinations = [
      { id: 1, name: "Goa Beach Escape", state: "Goa", city: "Panaji" }
    ];
    catalogModel.listDestinations.mockResolvedValue(destinations);
    catalogModel.countDestinations.mockResolvedValue(1);

    const response = await request(app)
      .get("/destinations?search=Goa&state=Goa&city=Panaji&page=1&limit=10")
      .set("Authorization", authHeader());

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(destinations);
    expect(response.body.pagination.total).toBe(1);
  });

  it("returns a destination by id", async () => {
    const destination = {
      id: 2,
      name: "Jaipur Heritage Trail",
      state: "Rajasthan",
      city: "Jaipur"
    };
    catalogModel.getDestinationById.mockResolvedValue(destination);

    const response = await request(app)
      .get("/destinations/2")
      .set("Authorization", authHeader());

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(destination);
  });

  it("lists hotels for a destination", async () => {
    catalogModel.getDestinationById.mockResolvedValue({
      id: 3,
      name: "Kerala Backwaters"
    });
    catalogModel.listHotelsByDestination.mockResolvedValue([
      { id: 11, destination_id: 3, name: "Kochi Lagoon Resort" }
    ]);
    catalogModel.countHotelsByDestination.mockResolvedValue(1);

    const response = await request(app)
      .get("/destinations/3/hotels?page=1&limit=5")
      .set("Authorization", authHeader());

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.pagination.total).toBe(1);
  });

  it("lists packages with optional destination filter", async () => {
    catalogModel.listPackages.mockResolvedValue([
      { id: 21, destination_id: 1, name: "Goa Sun & Sand (4D/3N)" }
    ]);
    catalogModel.countPackages.mockResolvedValue(1);

    const response = await request(app)
      .get("/packages?destination_id=1&page=1&limit=5")
      .set("Authorization", authHeader());

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.pagination.total).toBe(1);
  });

  it("rejects invalid destination_id filter for packages", async () => {
    const response = await request(app)
      .get("/packages?destination_id=abc")
      .set("Authorization", authHeader());

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_ID");
  });
});
