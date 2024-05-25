const request = require("supertest");
const mongoose = require("mongoose");
const server = require("../index.js");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

jest.mock("../models/User");
jest.mock("nodemailer", () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn().mockResolvedValue(true),
    }),
}));

const mockUserId = new mongoose.Types.ObjectId().toString();

afterAll(async () => {
    await mongoose.connection.close();
    server.close();
    jest.clearAllMocks();
});

describe("Auth routes", () => {
    describe("POST /auth/register", () => {
        it("should register a new user", async () => {
            User.findOne.mockResolvedValue(null);
            User.prototype.save = jest.fn().mockResolvedValue();

            const res = await request(server).post("/auth/register").send({
                firstName: "John",
                lastName: "Doe",
                email: "test@example.com",
                password: "password123",
            });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty("message", "User registered successfully");
            expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
            expect(User.prototype.save).toHaveBeenCalled();
        });

        it("should return 400 if email already exists", async () => {
            User.findOne.mockResolvedValue({ email: "test@example.com" });

            const res = await request(server).post("/auth/register").send({
                firstName: "John",
                lastName: "Doe",
                email: "test@example.com",
                password: "password123",
            });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty("message", "Email already exists");
        });
    });

    describe("POST /auth/login", () => {
        it("should login an existing user", async () => {
            const mockUser = {
                _id: mockUserId,
                email: "test@example.com",
                password: await bcrypt.hash("password123", 10),
                refreshTokens: [],
                save: jest.fn().mockResolvedValue(),
            };
            User.findOne.mockResolvedValue(mockUser);

            const res = await request(server).post("/auth/login").send({
                email: "test@example.com",
                password: "password123",
            });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("accessToken");
            expect(res.body).toHaveProperty("refreshToken");
        });

        it("should return 404 if user not found", async () => {
            User.findOne.mockResolvedValue(null);

            const res = await request(server).post("/auth/login").send({
                email: "nonexistent@example.com",
                password: "password123",
            });

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty("message", "User not found");
        });

        it("should return 401 if password is invalid", async () => {
            const mockUser = {
                _id: mockUserId,
                email: "test@example.com",
                password: await bcrypt.hash("password123", 10),
            };
            User.findOne.mockResolvedValue(mockUser);

            const res = await request(server).post("/auth/login").send({
                email: "test@example.com",
                password: "wrongpassword",
            });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty("message", "Invalid password");
        });
    });

    describe("POST /auth/token", () => {
        it("should refresh an access token", async () => {
            const mockUser = {
                _id: mockUserId,
                refreshTokens: ["valid-refresh-token"],
            };
            User.findOne.mockResolvedValue(mockUser);

            jwt.verify = jest.fn().mockImplementation((token, secret, callback) => {
                callback(null, { userId: mockUserId });
            });

            const res = await request(server).post("/auth/token").send({
                token: "valid-refresh-token",
            });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("accessToken");
        });

        it("should return 403 if refresh token is invalid", async () => {
            User.findOne.mockResolvedValue(null);

            const res = await request(server).post("/auth/token").send({
                token: "invalid-refresh-token",
            });

            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty("message", "Invalid refresh token");
        });
    });

    describe("DELETE /auth/logout", () => {
        it("should log out a user", async () => {
            const mockUser = {
                _id: mockUserId,
                refreshTokens: ["valid-refresh-token"],
                save: jest.fn().mockResolvedValue(),
            };
            User.findOne.mockImplementation((query) => {
                if (query.refreshTokens === "valid-refresh-token") {
                    return Promise.resolve(mockUser);
                } else {
                    return Promise.resolve(null);
                }
            });
        
            const res = await request(server)
                .delete("/auth/logout")
                .set("Authorization", "Bearer valid-access-token")
                .send({ token: "valid-refresh-token" });
        
            expect(res.statusCode).toEqual(204);
            expect(mockUser.save).toHaveBeenCalled();
        });

        it("should return 403 if refresh token is invalid", async () => {
            User.findOne.mockResolvedValue(null);

            const res = await request(server)
                .delete("/auth/logout")
                .set("Authorization", "Bearer valid-access-token")
                .send({
                    token: "invalid-refresh-token",
                });

            expect(res.statusCode).toEqual(403);
            expect(res.body).toHaveProperty("message", "Invalid refresh token");
        });
    });

    describe("POST /auth/forgot-password", () => {
        it("should send a password reset email", async () => {
            const mockUser = {
                _id: mockUserId,
                email: "test@example.com",
                save: jest.fn().mockResolvedValue(),
            };
            User.findOne.mockResolvedValue(mockUser);

            const res = await request(server)
                .post("/auth/forgot-password")
                .send({ email: "test@example.com" });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("message", "Verification code sent to your email");
        });

        it("should return 404 if user not found", async () => {
            User.findOne.mockResolvedValue(null);

            const res = await request(server)
                .post("/auth/forgot-password")
                .send({ email: "nonexistent@example.com" });

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty("message", "User not found");
        });
    });

    describe("POST /auth/reset-password", () => {
        it("should reset the password", async () => {
            const mockUser = {
                _id: mockUserId,
                email: "test@example.com",
                resetPasswordToken: "123456",
                resetPasswordExpires: Date.now() + 3600000, // 1 hour in the future
                save: jest.fn().mockResolvedValue(),
            };
            User.findOne.mockResolvedValue(mockUser);
    
            const res = await request(server)
                .post("/auth/reset-password")
                .send({
                    email: "test@example.com",
                    code: "123456",  // Correct key for the code
                    newPassword: "newPassword123",
                });
    
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("message", "Password has been reset");
        });
    
        it("should return 400 if verification code is incorrect", async () => {
            const mockUser = {
                _id: mockUserId,
                email: "test@example.com",
                resetPasswordToken: "123456",
                resetPasswordExpires: Date.now() + 3600000,
                save: jest.fn().mockResolvedValue(),
            };
            User.findOne.mockResolvedValue(mockUser);
    
            const res = await request(server)
                .post("/auth/reset-password")
                .send({
                    email: "test@example.com",
                    code: "wrongCode",  // Ensure incorrect code
                    newPassword: "newPassword123",
                });
    
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty("message", "Verification code is invalid or has expired");
        });
    
        it("should return 404 if user not found", async () => {
            User.findOne.mockResolvedValue(null);
    
            const res = await request(server)
                .post("/auth/reset-password")
                .send({
                    email: "nonexistent@example.com",
                    code: "123456",
                    newPassword: "newPassword123",
                });
    
            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty("message", "User not found");
        });
    });
});
