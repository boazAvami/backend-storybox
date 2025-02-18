import request from "supertest";
import { initApp } from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import postsMock from "./postsMock.json";
import { userModel } from "../models/users_model";
import { User } from "./common";
import { postModel } from "../models/posts_model";

let app: Express;

const testUser: User = {
    userName: "sagiezra",
    email: "test@user.com",
    password: "testpassword",
}

beforeAll(async () => {
    app = await initApp();
    await postModel.deleteMany();
    await userModel.deleteMany();
    await request(app).post("/auth/register").send(testUser);
    const loginRes = await request(app).post("/auth/login").send(testUser);
    testUser.accessToken = loginRes.body.accessToken;
    testUser.refreshToken = loginRes.body.refreshToken;
    testUser._id = loginRes.body._id;
    postsMock[0].ownerId = testUser._id;
});

afterAll((done) => {
    mongoose.connection.close();
    done();
});

let postId = "";

describe("Posts Tests", () => {
    test("Test success get all posts", async () => {
        const response = await request(app).get("/posts").set(
            { authorization: "JWT " + testUser.accessToken }
        );
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);
    });
    test("Test success Create Post", async () => {
        const response = await request(app).post("/posts").set(
            { authorization: "JWT " + testUser.accessToken }
        ).send(postsMock[0]);
        expect(response.statusCode).toBe(201);
        expect(response.body.content).toBe(postsMock[0].content);
        expect(response.body.title).toBe(postsMock[0].title);
        expect(response.body.ownerId).toBe(postsMock[0].ownerId);
        postId = response.body._id;
    });
    test("Test success Posts get by id", async () => {
        const response = await request(app).get("/posts/" + postId).set(
            { authorization: "JWT " + testUser.accessToken }
        );
        expect(response.statusCode).toBe(200);
        expect(response.body.content).toBe(postsMock[0].content);
        expect(response.body.title).toBe(postsMock[0].title);
        expect(response.body.ownerId).toBe(postsMock[0].ownerId);
    });

    test("Test get post by senderId", async () => {
        const response = await request(app).get("/posts?sender=" + postsMock[0].ownerId).set(
            { authorization: "JWT " + testUser.accessToken }
        );
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].content).toBe(postsMock[0].content);
        expect(response.body[0].title).toBe(postsMock[0].title);
        expect(response.body[0].ownerId).toBe(postsMock[0].ownerId);
    });

    test("Test get post by senderId- bad Request", async () => {
        const response = await request(app).get("/posts?sender=" + postsMock[0].title).set(
            { authorization: "JWT " + testUser.accessToken }
        );
        expect(response.statusCode).toBe(400);
    });

    const BadPostId = 5
    test("Test fail Update Post - Internal Server Error", async () => {
        const response = await request(app).put("/posts/" + BadPostId ).send(postsMock[0]).set(
            { authorization: "JWT " + testUser.accessToken }
        );

        expect(response.statusCode).toBe(500);
    });

    const NotExsistPostId = "67891ed02bc40f138cec8593"
    test("Test fail Update Post - Post Not Found", async () => {
        const response = await request(app).put("/posts/" + NotExsistPostId ).send(postsMock[0]).set(
            { authorization: "JWT " + testUser.accessToken }
        );
        // No such postId
        expect(response.statusCode).toBe(404);
    });

    test("Test success Update Post", async () => {
        const response = await request(app).put("/posts/" + postId).send({...postModel[0]}).set(
            { authorization: "JWT " + testUser.accessToken }
        );
        expect(response.statusCode).toBe(200);
    });
});