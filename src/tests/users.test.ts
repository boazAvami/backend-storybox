import request from "supertest";
import { initApp } from "../server";
import mongoose from "mongoose";
import { userModel } from "../models/users_model";
import { Express } from "express";
import { User } from "./common";
import usersMock from "./usersMock.json";
import BaseController from "../controllers/base_controller";


let app: Express;

const testUser: User = {
    userName: usersMock[0].userName,
    email: usersMock[0].email,
    password: usersMock[0].password,
}

const testUser2: User = {
    userName: usersMock[1].userName,
    email: usersMock[1].email,
    password: usersMock[1].password,
}

const nonExistingUserId = "674df5c81b3fe9863591b29a"

beforeAll(async () => {
    app = (await initApp()).app;
    await userModel.deleteMany();

    // create testUser
    await request(app).post("/auth/register").send(testUser);
    const loginRes = await request(app).post("/auth/login").send(testUser);    
    testUser.accessToken = loginRes.body.accessToken;
    testUser.refreshToken = loginRes.body.refreshToken;
    testUser._id = loginRes.body._id;

    // create testUser2
    await request(app).post("/auth/register").send(testUser2);
    const loginRes2 = await request(app).post("/auth/login").send(testUser2);
    testUser2.accessToken = loginRes2.body.accessToken;
    testUser2.refreshToken = loginRes2.body.refreshToken;
    testUser2._id = loginRes2.body._id;
});

afterAll((done) => {
    mongoose.connection.close();
    done();
});

describe("Users Tests", () => {
    test("Test Success users get all", async () => {
        const response = await request(app).get("/users").set(
            { authorization: "JWT " + testUser.accessToken }
        );
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2); // Created 2 users in the beforeAll
    });

    test("Test fail users get all - Internal Server Error", async () => {
        jest.spyOn(userModel, "find").mockRejectedValue(new Error("Database Error"));
    
        const response = await request(app).get("/users").set(
            { authorization: "JWT " + testUser.accessToken }
        );
    
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe("Database Error");
    
        jest.restoreAllMocks();
    });

    test("Succses Users get by id", async () => {
        const response = await request(app).get("/users/" + testUser._id).set(
            { authorization: "JWT " + testUser.accessToken }
        );
        expect(response.statusCode).toBe(200);
        expect(response.body.email).toBe(usersMock[0].email);
        expect(response.body.userName).toBe(usersMock[0].userName);
    });

    test("Test Users get by non existing id", async () => {
        const response = await request(app).get("/users/" + nonExistingUserId).set(
            { authorization: "JWT " + testUser.accessToken }
        );
        expect(response.statusCode).not.toBe(200);
    });

    test("Test fail Update User - Email in use by another user", async () => {
        const response = await request(app).put("/users/" + testUser._id).send(usersMock[1]).set(
            { authorization: "JWT " + testUser.accessToken }
        );
        
        expect(response.statusCode).toBe(400);
    });

    test("Test fail Update User - Internal Server Error", async () => {
        jest.spyOn(BaseController.prototype, "update").mockRejectedValue(new Error("Update Error"));
    
        const response = await request(app).put("/users/" + testUser._id).send(usersMock[2]).set(
            { authorization: "JWT " + testUser.accessToken }
        );
    
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe("Update Error");
    
        jest.restoreAllMocks();
    });
    

    test("Test success Update User", async () => {
        const response = await request(app).put("/users/" + testUser._id).send(usersMock[2]).set(
            { authorization: "JWT " + testUser.accessToken }
        );
        expect(response.statusCode).toBe(200);
    });

    test("Test fail Delete User - Internal Server Error", async () => {
        jest.spyOn(BaseController.prototype, "delete").mockRejectedValue(new Error("Delete Error"));
    
        const response = await request(app).delete("/users/" + testUser._id).set(
            { authorization: "JWT " + testUser.accessToken }
        );
    
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe("Delete Error");
    
        jest.restoreAllMocks();
    });
    


    test("Test fail Delete User - Non Exsisting UserId", async () => {
        const response = await request(app).delete("/users/" + nonExistingUserId).set(
            { authorization: "JWT " + testUser.accessToken }
        );
        expect(response.statusCode).toBe(403);
    });

    test("Test success Get User - /me", async () => {
        const response = await request(app)
            .get("/users/self/me")
            .set({ authorization: "JWT " + testUser.accessToken });
 
        expect(response.statusCode).toBe(200);
        expect(response.body.userName).toBe(usersMock[0].userName);
    });

    test("Test Success Delete User", async () => {
        const response = await request(app).delete("/users/" + testUser._id).set(
            { authorization: "JWT " + testUser.accessToken }
        );
        expect(response.statusCode).toBe(200);
        const response2 = await request(app).get("/users/" + testUser._id).set(
            { authorization: "JWT " + testUser.accessToken }
        );
        expect(response2.statusCode).toBe(404);
    });
});