import request from "supertest";
import { initApp } from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import { userModel } from "../models/users_model";
import { conversationModel } from "../models/conversations_model";

let app: Express;
let testUser1: any;
let testUser2: any;
let conversationId: string;

beforeAll(async () => {
    app = (await initApp()).app;
    await userModel.deleteMany();
    await conversationModel.deleteMany();
    
    const user1 = await request(app).post("/auth/register").send({
        userName: "user1",
        email: "user1@test.com",
        password: "testpassword"
    });
    
    const user2 = await request(app).post("/auth/register").send({
        userName: "user2",
        email: "user2@test.com",
        password: "testpassword"
    });
    
    const loginRes1 = await request(app).post("/auth/login").send({
        email: "user1@test.com",
        password: "testpassword"
    });
    
    const loginRes2 = await request(app).post("/auth/login").send({
        email: "user2@test.com",
        password: "testpassword"
    });
    
    testUser1 = { ...loginRes1.body };
    testUser2 = { ...loginRes2.body };
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("Conversations API Tests", () => {
    test("Create a new conversation", async () => {
        const res = await request(app)
            .post("/conversations")
            .set("Authorization", `JWT ${testUser1.accessToken}`)
            .send({ recipientId: testUser2._id });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("_id");
        expect(res.body.participants).toContain(testUser1._id);
        expect(res.body.participants).toContain(testUser2._id);
        conversationId = res.body._id;
    });

    test("Get all conversations for a user", async () => {
        const res = await request(app)
            .get(`/conversations?userId=${testUser1._id}`)
            .set("Authorization", `JWT ${testUser1.accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
    });

    test("Get conversation by ID", async () => {
        const res = await request(app)
            .get(`/conversations/${conversationId}`)
            .set("Authorization", `JWT ${testUser1.accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body._id).toBe(conversationId);
    });

    test("Add a message to conversation", async () => {
        const res = await request(app)
            .post(`/conversations/${conversationId}/messages`)
            .set("Authorization", `JWT ${testUser1.accessToken}`)
            .send({ senderId: testUser1._id, text: "Hello, how are you?" });

        expect(res.status).toBe(201);
        expect(res.body.messages.length).toBeGreaterThan(0);
        expect(res.body.messages[0].text).toBe("Hello, how are you?");
    });
});
