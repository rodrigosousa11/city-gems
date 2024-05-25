const request = require("supertest");
const mongoose = require("mongoose");
const server = require("../index.js");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

jest.mock("../models/User");

const mockUserId = new mongoose.Types.ObjectId().toString();
const mockToken = "valid-token";

afterAll(async () => {
    await mongoose.connection.close();
    server.close();
    jest.clearAllMocks();
});

describe("User routes", () => {
    describe("GET /user/me", () => {
        it("should return logged in user details", async () => {
            const mockUser = { _id: mockUserId, email: "test@example.com", name: "John Doe" };
            User.findById.mockResolvedValue(mockUser);

            const res = await request(server)
                .get("/user/me")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("user");
            expect(res.body.user).toMatchObject({ email: "test@example.com", name: "John Doe" });
        });

        it("should return 404 if user not found", async () => {
            User.findById.mockResolvedValue(null);

            const res = await request(server)
                .get("/user/me")
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty("message", "User not found");
        });
    });

    describe("PUT /user/details", () => {
        it("should update user details", async () => {
            const mockUser = { _id: mockUserId, email: "test@example.com", name: "John Doe", password: await bcrypt.hash("password123", 10) };
            User.findById.mockResolvedValue(mockUser);
            User.prototype.save = jest.fn().mockResolvedValue();

            const res = await request(server)
                .put("/user/details")
                .set("Authorization", `Bearer ${mockToken}`)
                .send({ name: "John Smith", email: "john@example.com", currentPassword: "password123", newPassword: "newpassword123" });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("message", "User details updated successfully");
            expect(User.prototype.save).toHaveBeenCalled();
        });

        it("should return 404 if user not found", async () => {
            User.findById.mockResolvedValue(null);

            const res = await request(server)
                .put("/user/details")
                .set("Authorization", `Bearer ${mockToken}`)
                .send({ name: "John Smith", email: "john@example.com" });

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty("message", "User not found");
        });

        it("should return 401 if current password is incorrect", async () => {
            const mockUser = { _id: mockUserId, email: "test@example.com", name: "John Doe", password: await bcrypt.hash("password123", 10) };
            User.findById.mockResolvedValue(mockUser);

            const res = await request(server)
                .put("/user/details")
                .set("Authorization", `Bearer ${mockToken}`)
                .send({ currentPassword: "wrongpassword", newPassword: "newpassword123" });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty("message", "Current password is incorrect");
        });
    });

    describe("PUT /user/role", () => {
        it("should update user role", async () => {
            const mockUser = { _id: mockUserId, email: "test@example.com", role: "user" };
            User.findOne.mockResolvedValue(mockUser);
            User.prototype.save = jest.fn().mockResolvedValue();

            const res = await request(server)
                .put("/user/role")
                .set("Authorization", `Bearer ${mockToken}`)
                .send({ email: "test@example.com" });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("message", "User role updated to admin successfully");
            expect(User.prototype.save).toHaveBeenCalled();
        });

        it("should return 404 if user not found", async () => {
            User.findOne.mockResolvedValue(null);

            const res = await request(server)
                .put("/user/role")
                .set("Authorization", `Bearer ${mockToken}`)
                .send({ email: "nonexistent@example.com" });

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty("message", "User not found");
        });
    });

    describe("DELETE /user/delete", () => {
        it("should delete user account", async () => {
            const mockUser = { _id: mockUserId, email: "test@example.com", password: await bcrypt.hash("password123", 10) };
            User.findOne.mockResolvedValue(mockUser);
            User.findOneAndDelete.mockResolvedValue(mockUser);

            const res = await request(server)
                .delete("/user/delete")
                .set("Authorization", `Bearer ${mockToken}`)
                .send({ email: "test@example.com", password: "password123" });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("message", "User account deleted successfully");
            expect(User.findOneAndDelete).toHaveBeenCalledWith({ email: "test@example.com" });
        });

        it("should return 404 if user not found", async () => {
            User.findOne.mockResolvedValue(null);

            const res = await request(server)
                .delete("/user/delete")
                .set("Authorization", `Bearer ${mockToken}`)
                .send({ email: "nonexistent@example.com", password: "password123" });

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty("message", "User not found");
        });

        it("should return 401 if password is incorrect", async () => {
            const mockUser = { _id: mockUserId, email: "test@example.com", password: await bcrypt.hash("password123", 10) };
            User.findOne.mockResolvedValue(mockUser);

            const res = await request(server)
                .delete("/user/delete")
                .set("Authorization", `Bearer ${mockToken}`)
                .send({ email: "test@example.com", password: "wrongpassword" });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty("message", "Invalid password");
        });
    });
});
