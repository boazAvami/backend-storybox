import request from "supertest";
import { initApp } from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import genresMock from "./genresMock.json";

let app: Express;

beforeAll(async () => {
    app = await initApp();
});

afterAll((done) => {
    mongoose.connection.close();
    done();
});

describe("Genres Tests", () => {
    test("Test success get genres", async () => {
        const response = await request(app)
            .get("/genres")
            .query({ text: genresMock[0].text });

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(3); // Assuming the AI returns 3 genres
        expect(Array.isArray(response.body)).toBe(true);
    });

    test("Test fail get genres - Missing text parameter", async () => {
        const response = await request(app).get("/genres");
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Text query parameter is required.");
    });

    test("Test fail get genres - Internal Server Error", async () => {
        // Simulate an error from the AI service
        jest.spyOn(require('axios'), 'post').mockImplementationOnce(() => Promise.reject(new Error("Internal Server Error")));

        const response = await request(app)
            .get("/genres")
            .query({ text: genresMock[0].text });

        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe("Error processing request.");
    });

    test("Test fail get genres - Insufficient genres returned", async () => {
        // Mock the AI response to return insufficient genres
        jest.spyOn(require('axios'), 'post').mockImplementationOnce(() => Promise.resolve({ data: { genres: ["Drama"] } }));

        const response = await request(app)
            .get("/genres")
            .query({ text: genresMock[0].text });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Insufficient genres returned from AI.");
    });
});
