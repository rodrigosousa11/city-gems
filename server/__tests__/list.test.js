const request = require('supertest');
const mongoose = require('mongoose');
const server = require('../index');
const FavoriteList = require('../models/FavoriteList');
const POI = require('../models/Poi');
const Review = require('../models/Review');

jest.mock('../models/FavoriteList');
jest.mock('../models/Poi');
jest.mock('../models/Review');

const mockUserId = new mongoose.Types.ObjectId().toString();
const mockListId = new mongoose.Types.ObjectId().toString();
const mockPOIId = new mongoose.Types.ObjectId().toString();
const mockReviewId = new mongoose.Types.ObjectId().toString();

afterAll(async () => {
    await mongoose.connection.close();
    server.close();
    jest.clearAllMocks();
});

describe('FavoriteList routes', () => {
    describe('GET /user/lists', () => {
        it('should fetch all favorite lists for a user', async () => {
            const mockLists = [{ _id: mockListId, name: 'Test List', pois: [mockPOIId] }];
            FavoriteList.find.mockResolvedValue(mockLists);

            const res = await request(server)
                .get('/user/lists')
                .set('Authorization', `Bearer ${mockUserId}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockLists);
        });

        it('should return 500 if fetching lists fails', async () => {
            FavoriteList.find.mockRejectedValue(new Error('Failed to fetch lists'));

            const res = await request(server)
                .get('/user/lists')
                .set('Authorization', `Bearer ${mockUserId}`);

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty('message', 'Failed to fetch lists');
        });
    });

    describe('GET /user/lists/:id', () => {
        it('should fetch POIs of a favorite list', async () => {
            const mockList = {
                _id: mockListId,
                name: 'Test List',
                pois: [
                    {
                        _id: mockPOIId,
                        name: 'Test POI',
                        reviews: [{ _id: mockReviewId, user: mockUserId, comment: 'Great POI', rating: 5 }]
                    }
                ]
            };
            FavoriteList.findById.mockResolvedValue(mockList);

            const res = await request(server)
                .get(`/user/lists/${mockListId}`)
                .set('Authorization', `Bearer ${mockUserId}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockList.pois);
        });

        it('should return 404 if favorite list not found', async () => {
            FavoriteList.findById.mockResolvedValue(null);

            const res = await request(server)
                .get(`/user/lists/${mockListId}`)
                .set('Authorization', `Bearer ${mockUserId}`);

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('message', 'Favorite list not found');
        });

        it('should return 500 if fetching list POIs fails', async () => {
            FavoriteList.findById.mockRejectedValue(new Error('Failed to fetch list POIs'));

            const res = await request(server)
                .get(`/user/lists/${mockListId}`)
                .set('Authorization', `Bearer ${mockUserId}`);

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty('message', 'Failed to fetch list POIs');
        });
    });

    describe('POST /user/list', () => {
        it('should create a new favorite list', async () => {
            const mockList = { _id: mockListId, name: 'New List', user: mockUserId };
            FavoriteList.prototype.save = jest.fn().mockResolvedValue(mockList);

            const res = await request(server)
                .post('/user/list')
                .set('Authorization', `Bearer ${mockUserId}`)
                .send({ name: 'New List' });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toEqual(mockList);
        });

        it('should return 400 if creating list fails', async () => {
            FavoriteList.prototype.save = jest.fn().mockRejectedValue(new Error('Failed to create list'));

            const res = await request(server)
                .post('/user/list')
                .set('Authorization', `Bearer ${mockUserId}`)
                .send({ name: 'New List' });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Failed to create list');
        });
    });

    describe('POST /user/lists/:id', () => {
        it('should add a POI to a favorite list', async () => {
            const mockList = {
                _id: mockListId,
                name: 'Test List',
                pois: [],
                save: jest.fn().mockResolvedValue()
            };
            FavoriteList.findOne.mockResolvedValue(mockList);
            FavoriteList.findById.mockResolvedValue({ ...mockList, pois: [mockPOIId] });

            const res = await request(server)
                .post(`/user/lists/${mockListId}`)
                .set('Authorization', `Bearer ${mockUserId}`)
                .send({ poiId: mockPOIId });

            expect(res.statusCode).toEqual(200);
            expect(res.body.pois).toContain(mockPOIId);
        });

        it('should return 404 if favorite list not found', async () => {
            FavoriteList.findOne.mockResolvedValue(null);

            const res = await request(server)
                .post(`/user/lists/${mockListId}`)
                .set('Authorization', `Bearer ${mockUserId}`)
                .send({ poiId: mockPOIId });

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('message', 'Favorite list not found');
        });

        it('should return 400 if POI already exists in the list', async () => {
            const mockList = { _id: mockListId, name: 'Test List', pois: [mockPOIId] };
            FavoriteList.findOne.mockResolvedValue(mockList);

            const res = await request(server)
                .post(`/user/lists/${mockListId}`)
                .set('Authorization', `Bearer ${mockUserId}`)
                .send({ poiId: mockPOIId });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'POI already exists in the list');
        });

        it('should return 400 if adding POI to list fails', async () => {
            FavoriteList.findOne.mockRejectedValue(new Error('Failed to add POI to list'));

            const res = await request(server)
                .post(`/user/lists/${mockListId}`)
                .set('Authorization', `Bearer ${mockUserId}`)
                .send({ poiId: mockPOIId });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Failed to add POI to list');
        });
    });

    describe('DELETE /user/list/:id', () => {
        it('should delete a favorite list', async () => {
            const mockList = { _id: mockListId, name: 'Test List', user: mockUserId };
            FavoriteList.findOneAndDelete.mockResolvedValue(mockList);

            const res = await request(server)
                .delete(`/user/list/${mockListId}`)
                .set('Authorization', `Bearer ${mockUserId}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual(mockList);
        });

        it('should return 404 if favorite list not found', async () => {
            FavoriteList.findOneAndDelete.mockResolvedValue(null);

            const res = await request(server)
                .delete(`/user/list/${mockListId}`)
                .set('Authorization', `Bearer ${mockUserId}`);

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('message', 'Favorite list not found');
        });

        it('should return 500 if deleting list fails', async () => {
            FavoriteList.findOneAndDelete.mockRejectedValue(new Error('Failed to delete list'));

            const res = await request(server)
                .delete(`/user/list/${mockListId}`)
                .set('Authorization', `Bearer ${mockUserId}`);

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty('message', 'Failed to delete list');
        });
    });

    describe('DELETE /user/lists/:listId/:poiId', () => {
        it('should delete a POI from a favorite list', async () => {
            const mockList = {
                _id: mockListId,
                name: 'Test List',
                pois: [mockPOIId],
                save: jest.fn().mockResolvedValue()
            };
            FavoriteList.findOneAndUpdate.mockResolvedValue(mockList);

            const res = await request(server)
                .delete(`/user/lists/${mockListId}/${mockPOIId}`)
                .set('Authorization', `Bearer ${mockUserId}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.pois).not.toContain(mockPOIId);
        });

        it('should return 404 if favorite list not found', async () => {
            FavoriteList.findOneAndUpdate.mockResolvedValue(null);

            const res = await request(server)
                .delete(`/user/lists/${mockListId}/${mockPOIId}`)
                .set('Authorization', `Bearer ${mockUserId}`);

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('message', 'Favorite list not found');
        });

        it('should return 500 if deleting POI from list fails', async () => {
            FavoriteList.findOneAndUpdate.mockRejectedValue(new Error('Failed to delete POI from list'));

            const res = await request(server)
                .delete(`/user/lists/${mockListId}/${mockPOIId}`)
                .set('Authorization', `Bearer ${mockUserId}`);

            expect(res.statusCode).toEqual(500);
            expect(res.body).toHaveProperty('message', 'Failed to delete POI from list');
        });
    });
});
