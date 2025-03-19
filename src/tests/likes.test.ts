import request from "supertest";
import { initApp } from "../server";
import mongoose from "mongoose";
import { commentModel } from "../models/comments_model";
import { Express } from "express";
import commentsMock from "./commentsMock.json";
import postsMock from "./postsMock.json";
import { userModel } from "../models/users_model";
import { User } from "./common";
import { postModel } from "../models/posts_model";
import { Post } from "./common";

let app: Express;

const testUser: User = {
    userName: "testUser",
    email: "test@user.com",
    password: "testpassword",
};

const testPost: Post = {
    _id: "",
    ownerId: new mongoose.Types.ObjectId(),
    content: postsMock[0].content
};

beforeAll(async () => {
    app = (await initApp()).app;
    await postModel.deleteMany();
    await commentModel.deleteMany();
    await userModel.deleteMany();
    
    // Create testUser
    await request(app).post("/auth/register").send(testUser);
    const loginRes = await request(app).post("/auth/login").send(testUser);
    testUser.accessToken = loginRes.body.accessToken;
    testUser.refreshToken = loginRes.body.refreshToken;
    testUser._id = loginRes.body._id;

    // Create a post required for the comment
    const portResponse = await request(app).post("/posts").send({
        content: postsMock[0].content
    }).set(
        { authorization: "JWT " + testUser.accessToken }
    );

    testPost.ownerId = portResponse.body.ownerId
    testPost._id = portResponse.body._id
});

afterAll((done) => {
    mongoose.connection.close();
    done();
});

describe("Likes API Tests", () => {
    test("Like a post", async () => {
        const postData = { postId: testPost._id };

        const res = await request(app).post("/likes")
            .set("Authorization", `JWT ${testUser.accessToken}`)
            .send(postData);

        expect(res.status).toBe(201);
        expect(res.body.postId).toBe(postData.postId);
        expect(res.body.ownerId).toBe(testUser._id);
    });

    test("Attempt to like a post that has already been liked", async () => {
        const postData = { postId: testPost._id };

        // Like the post again (which should result in an error)
        const res = await request(app).post("/likes")
            .set("Authorization", `JWT ${testUser.accessToken}`)
            .send(postData);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("You have already liked this post");
    });

    test("Unlike a post", async () => {
        const postId = testPost._id;

        const res = await request(app)
            .delete(`/likes/${postId}`)
            .set("Authorization", `JWT ${testUser.accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Like removed successfully");
    });

    test("Attempt to unlike a post that has not been liked", async () => {
        const postId = testPost._id;

        // Unlike the post again (which should result in an error)
        const res = await request(app)
            .delete(`/likes/${postId}`)
            .set("Authorization", `JWT ${testUser.accessToken}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("You haven't liked this post yet");
    });

    test("Attempt to like a post without providing a valid post ID", async () => {
        const invalidPostData = {};

        const res = await request(app)
            .post("/likes")
            .set("Authorization", `JWT ${testUser.accessToken}`)
            .send(invalidPostData);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Post not found");
    });

    test("Attempt to like a post without the authorization middleware", async () => {
        const postData = { postId: testPost._id };

        // Do not set Authorization header
        const res = await request(app)
            .post("/likes")
            .send(postData);

        expect(res.status).toBe(401);  // Unauthorized error
    });

    test("Attempt to unlike a post without the authorization middleware", async () => {
        const postId = testPost._id;

        // Do not set Authorization header
        const res = await request(app)
            .delete(`/likes/${postId}`)
            .send();

        expect(res.status).toBe(401);  // Unauthorized error
    });
});
