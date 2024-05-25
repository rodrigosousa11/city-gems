const request = require("supertest");
const mongoose = require("mongoose");
const server = require("../index.js");
const POI = require("../models/Poi");
const Review = require("../models/Review");
const axios = require("axios");

jest.mock("../models/Poi");
jest.mock("../models/Review");
jest.mock("axios");

const mockUserId = new mongoose.Types.ObjectId().toString();
const mockToken = "valid-token";
const mockPOIId = new mongoose.Types.ObjectId().toString();
const mockReviewId = new mongoose.Types.ObjectId().toString();

afterAll(async () => {
    await mongoose.connection.close();
    server.close();
    jest.clearAllMocks();
});

describe("POI routes", () => {
    describe("POST /poi/new", () => {
        it("should create a new POI", async () => {
            axios.get.mockResolvedValue({ status: 200, data: { address: { city: "Test City", county: "Test County" } } });
            POI.prototype.save = jest.fn().mockResolvedValue();

            const res = await request(server)
                .post("/poi/new")
                .set("Authorization", `Bearer ${mockToken}`)
                .send({
                    name: "Test POI",
                    description: "Test Description",
                    latitude: "45.0",
                    longitude: "90.0",
                    images: ["image1.jpg"]
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty("message", "POI created successfully");
            expect(POI.prototype.save).toHaveBeenCalled();
        });

        it("should return 500 if creating POI fails", async () => {
            axios.get.mockRejectedValue(new Error("Failed to fetch location data"));

            const res = await request(server)
                .post("/poi/new")
                .set("Authorization", `Bearer ${mockToken}`)
                .send({
                    name: "Test POI",
                    description: "Test Description",
                    latitude: "45.0",
                    longitude: "90.0",
                    images: ["image1.jpg"]
                });

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty("message", "Failed to create POI");
        });
    });

    describe("GET /poi/all", () => {
        it("should fetch all POIs", async () => {
            const mockPOIs = [{ _id: mockPOIId, name: "Test POI", description: "Test Description" }];
            POI.find.mockResolvedValue(mockPOIs);

            const res = await request(server).get("/poi/all").set("Authorization", `Bearer ${mockToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockPOIs);
        });

        it("should return 500 if fetching POIs fails", async () => {
            POI.find.mockRejectedValue(new Error("Failed to fetch POIs"));

            const res = await request(server).get("/poi/all").set("Authorization", `Bearer ${mockToken}`);

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty("message", "Failed to fetch POIs");
        });
    });

    describe("GET /poi/get/:id", () => {
        it("should fetch a single POI", async () => {
            const mockPOI = { _id: mockPOIId, name: "Test POI", description: "Test Description" };
            POI.findById.mockResolvedValue(mockPOI);

            const res = await request(server).get(`/poi/get/${mockPOIId}`).set("Authorization", `Bearer ${mockToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockPOI);
        });

        it("should return 404 if POI not found", async () => {
            POI.findById.mockResolvedValue(null);

            const res = await request(server).get(`/poi/get/${mockPOIId}`).set("Authorization", `Bearer ${mockToken}`);

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty("message", "POI not found");
        });

        it("should return 500 if fetching POI fails", async () => {
            POI.findById.mockRejectedValue(new Error("Failed to fetch POI"));

            const res = await request(server).get(`/poi/get/${mockPOIId}`).set("Authorization", `Bearer ${mockToken}`);

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty("message", "Failed to fetch POI");
        });
    });

    describe("PUT /poi/update/:id", () => {
        it("should update a POI", async () => {
            const mockPOI = { _id: mockPOIId, name: "Test POI", description: "Test Description", save: jest.fn().mockResolvedValue() };
            POI.findById.mockResolvedValue(mockPOI);

            const res = await request(server)
                .put(`/poi/update/${mockPOIId}`)
                .set("Authorization", `Bearer ${mockToken}`)
                .send({
                    name: "Updated POI",
                    description: "Updated Description",
                    latitude: "45.0",
                    longitude: "90.0"
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("message", "POI updated successfully");
            expect(mockPOI.save).toHaveBeenCalled();
        });

        it("should return 404 if POI not found", async () => {
            POI.findById.mockResolvedValue(null);

            const res = await request(server)
                .put(`/poi/update/${mockPOIId}`)
                .set("Authorization", `Bearer ${mockToken}`)
                .send({
                    name: "Updated POI",
                    description: "Updated Description",
                    latitude: "45.0",
                    longitude: "90.0"
                });

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty("message", "POI not found");
        });

        it("should return 500 if updating POI fails", async () => {
            POI.findById.mockRejectedValue(new Error("Failed to update POI"));

            const res = await request(server)
                .put(`/poi/update/${mockPOIId}`)
                .set("Authorization", `Bearer ${mockToken}`)
                .send({
                    name: "Updated POI",
                    description: "Updated Description",
                    latitude: "45.0",
                    longitude: "90.0"
                });

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty("message", "Failed to update POI");
        });
    });

    describe("DELETE /poi/delete/:id", () => {
        it("should delete a POI", async () => {
            const mockPOI = { _id: mockPOIId, name: "Test POI", description: "Test Description" };
            POI.findById.mockResolvedValue(mockPOI);
            POI.deleteOne.mockResolvedValue();

            const res = await request(server)
                .delete(`/poi/delete/${mockPOIId}`)
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("message", "POI deleted successfully");
            expect(POI.deleteOne).toHaveBeenCalledWith({ _id: mockPOIId });
        });

        it("should return 404 if POI not found", async () => {
            POI.findById.mockResolvedValue(null);

            const res = await request(server)
                .delete(`/poi/delete/${mockPOIId}`)
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty("message", "POI not found");
        });

        it("should return 500 if deleting POI fails", async () => {
            POI.findById.mockRejectedValue(new Error("Failed to delete POI"));

            const res = await request(server)
                .delete(`/poi/delete/${mockPOIId}`)
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty("message", "Failed to delete POI");
        });
    });

    describe("POST /poi/:id/review", () => {
        it("should add a review to a POI", async () => {
            const mockPOI = { _id: mockPOIId, reviews: [], visits: 0, save: jest.fn().mockResolvedValue() };
            POI.findById.mockResolvedValue(mockPOI);
            Review.prototype.save = jest.fn().mockResolvedValue({ _id: mockReviewId, comment: "Great place", rating: 5 });

            const res = await request(server)
                .post(`/poi/${mockPOIId}/review`)
                .set("Authorization", `Bearer ${mockToken}`)
                .send({ comment: "Great place", rating: 5 });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty("message", "Review added successfully");
            expect(res.body).toHaveProperty("review");
            expect(mockPOI.save).toHaveBeenCalled();
            expect(Review.prototype.save).toHaveBeenCalled();
        });

        it("should return 404 if POI not found", async () => {
            POI.findById.mockResolvedValue(null);

            const res = await request(server)
                .post(`/poi/pois/${mockPOIId}/reviews`)
                .set("Authorization", `Bearer ${mockToken}`)
                .send({ comment: "Great place", rating: 5 });

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty("message", "POI not found");
        });

        it("should return 500 if adding review fails", async () => {
            POI.findById.mockRejectedValue(new Error("Failed to add review"));

            const res = await request(server)
                .post(`/poi/pois/${mockPOIId}/reviews`)
                .set("Authorization", `Bearer ${mockToken}`)
                .send({ comment: "Great place", rating: 5 });

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty("message", "Failed to add review to POI");
        });
    });

    describe("DELETE /poi/pois/:poiId/reviews/:reviewId", () => {
        it("should delete a review from a POI", async () => {
            const mockPOI = { _id: mockPOIId, reviews: [mockReviewId], save: jest.fn().mockResolvedValue() };
            const mockReview = { _id: mockReviewId, comment: "Great place", rating: 5 };
            POI.findById.mockResolvedValue(mockPOI);
            Review.findById.mockResolvedValue(mockReview);
            Review.deleteOne.mockResolvedValue();

            const res = await request(server)
                .delete(`/poi/pois/${mockPOIId}/reviews/${mockReviewId}`)
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty("message", "Review deleted successfully");
            expect(mockPOI.save).toHaveBeenCalled();
            expect(Review.deleteOne).toHaveBeenCalledWith({ _id: mockReviewId });
        });

        it("should return 404 if POI not found", async () => {
            POI.findById.mockResolvedValue(null);

            const res = await request(server)
                .delete(`/poi/pois/${mockPOIId}/reviews/${mockReviewId}`)
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty("message", "POI not found");
        });

        it("should return 404 if review not found", async () => {
            const mockPOI = { _id: mockPOIId, reviews: [mockReviewId], save: jest.fn().mockResolvedValue() };
            POI.findById.mockResolvedValue(mockPOI);
            Review.findById.mockResolvedValue(null);

            const res = await request(server)
                .delete(`/poi/pois/${mockPOIId}/reviews/${mockReviewId}`)
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty("message", "Review not found");
        });

        it("should return 500 if deleting review fails", async () => {
            POI.findById.mockRejectedValue(new Error("Failed to delete review"));

            const res = await request(server)
                .delete(`/poi/pois/${mockPOIId}/reviews/${mockReviewId}`)
                .set("Authorization", `Bearer ${mockToken}`);

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty("message", "Failed to delete review");
        });
    });
});
