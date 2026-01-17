process.env.DB_HOST = "localhost";
process.env.DB_USER = "user";
process.env.DB_PASSWORD = "password";
process.env.DB_NAME = "db";
process.env.JWT_ACCESS_SECRET = "access-secret";
process.env.JWT_REFRESH_SECRET = "refresh-secret";
process.env.ACCESS_TOKEN_TTL_SECONDS = "900";
process.env.REFRESH_TOKEN_TTL_SECONDS = "604800";

const request = require("supertest");
const app = require("../src/app");
const authModel = require("../src/models/authModel");
const { hashToken, signAccessToken, signRefreshToken } = require("../src/utils/tokens");

jest.mock("../src/models/authModel", () => ({
  findUserByMobileRole: jest.fn(),
  findUserByEmailRole: jest.fn(),
  findUserById: jest.fn(),
  createUser: jest.fn(),
  saveRefreshToken: jest.fn(),
  findRefreshToken: jest.fn(),
  deleteRefreshToken: jest.fn()
}));

describe("Auth endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("logs in a customer with OTP", async () => {
    const user = { id: 1, role: "CUSTOMER", status: "ACTIVE" };
    authModel.findUserByMobileRole.mockResolvedValue(null);
    authModel.createUser.mockResolvedValue(user);
    authModel.saveRefreshToken.mockResolvedValue();

    const response = await request(app).post("/auth/login/customer").send({
      mobile: "+15555550123",
      otp: "123456"
    });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeTruthy();
    expect(response.body.refreshToken).toBeTruthy();
  });

  it("rejects invalid customer OTP", async () => {
    const response = await request(app).post("/auth/login/customer").send({
      mobile: "+15555550123",
      otp: "000000"
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("prevents non-admin access to admin area", async () => {
    const user = { id: 99, role: "CUSTOMER", status: "ACTIVE" };
    authModel.findUserById.mockResolvedValue(user);

    const accessToken = signAccessToken(user);
    const response = await request(app)
      .get("/auth/admin-area")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("allows admin access to admin area", async () => {
    const user = { id: 100, role: "ADMIN", status: "ACTIVE" };
    authModel.findUserById.mockResolvedValue(user);

    const accessToken = signAccessToken(user);
    const response = await request(app)
      .get("/auth/admin-area")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
  });

  it("rotates refresh tokens and revokes on logout", async () => {
    const user = { id: 12, role: "CUSTOMER", status: "ACTIVE" };
    const refreshToken = signRefreshToken(user);
    const tokenHash = hashToken(refreshToken);

    authModel.findRefreshToken.mockResolvedValue({
      id: 10,
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: new Date(Date.now() + 1000 * 60 * 10)
    });
    authModel.findUserById.mockResolvedValue(user);
    authModel.deleteRefreshToken.mockResolvedValue();
    authModel.saveRefreshToken.mockResolvedValue();

    const refreshResponse = await request(app).post("/auth/refresh").send({
      refreshToken
    });

    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.refreshToken).toBeTruthy();
    expect(refreshResponse.body.refreshToken).not.toBe(refreshToken);
    expect(authModel.deleteRefreshToken).toHaveBeenCalledWith(tokenHash);

    const logoutResponse = await request(app).post("/auth/logout").send({
      refreshToken: refreshResponse.body.refreshToken
    });

    expect(logoutResponse.status).toBe(204);
  });
});
