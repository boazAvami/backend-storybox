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
            .post("/genres")
            .set("Content-Type", "application/json")
            .send({ text: genresMock[0].text });

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThan(0); 
        expect(Array.isArray(response.body)).toBe(true);
    });

    test("Test fail get genres - Missing text parameter", async () => {
        const response = await request(app)
            .post("/genres")
            .set("Content-Type", "application/json")
            .send({}); // Empty body

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Text body parameter is required.");
    });
});
