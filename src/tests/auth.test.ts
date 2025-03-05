import request from "supertest";
import { initApp } from "../server";
import mongoose from "mongoose";
import { postModel } from "../models/posts_model";
import { Express } from "express";
import { userModel } from "../models/users_model";
import { User } from "./common";
import postsMock from "./postsMock.json";
import commentsMock from "./commentsMock.json";
import * as AuthController from "../controllers/auth_controller";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

let app: Express;

beforeAll(async () => {
    app = await initApp();
    await userModel.deleteMany();
    await postModel.deleteMany();

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

beforeEach(() => {
    jest.resetAllMocks();
});

const baseUrl = "/auth";

const testUser: User = {
    userName: "sagiezra",
    email: "test@user.com",
    password: "testpassword",
    firstName: "sagi",
    lastName: "ezra",
    phone_number: "0545325447",
}

const testUser2: User = {
    userName: "testUser2",
    email: "test@user2.com",
    password: "testpassword2",
}

describe("Auth Tests", () => {
    test("Test success Auth register", async () => {
        const response = await request(app).post(baseUrl + "/register").send(testUser);
        expect(response.statusCode).toBe(200);
    });

    test("Auth test register fail", async () => {
        const response = await request(app).post(baseUrl + "/register").send(testUser);
        expect(response.statusCode).not.toBe(200);
    });

    test("Auth test register fail", async () => {
        const response = await request(app).post(baseUrl + "/register").send({
            email: "sdsdfsd",
        });
        expect(response.statusCode).toBe(400);

        const response2 = await request(app).post(baseUrl + "/register").send({
            email: "",
            password: "sdfsd",
        });
        expect(response2.statusCode).not.toBe(200);
    });

    test("Register fails when user creation throws an error", async () => {
        jest.spyOn(userModel, "create").mockRejectedValue(new Error("Database error"));
    
        const response = await request(app).post(baseUrl + "/register").send({
            userName: "testUser",
            email: "test@user.com",
            password: "password123",
        });
    
        expect(response.statusCode).toBe(400);
        jest.restoreAllMocks();
    });
    
    test("Register fails when bcrypt.hash throws an error", async () => {
        (jest.spyOn(bcrypt, "hash") as jest.Mock).mockRejectedValue(new Error("Hashing error"));
    
        const response = await request(app).post(baseUrl + "/register").send({
            userName: "testUser",
            email: "test@user.com",
            password: "password123",
        });
    
        expect(response.statusCode).toBe(400);
        jest.restoreAllMocks();
    });
    

    test("Test success Auth login", async () => {
        const response = await request(app).post(baseUrl + "/login").send(testUser);
        
        expect(response.statusCode).toBe(200);
        
        const accessToken = response.body.accessToken;
        const refreshToken = response.body.refreshToken;
        
        expect(accessToken).toBeDefined();
        expect(refreshToken).toBeDefined();
        expect(response.body._id).toBeDefined();
        
        testUser.accessToken = accessToken;
        testUser.refreshToken = refreshToken;
        testUser._id = response.body._id;
    });

    test("Check tokens are not the same", async () => {
        const response = await request(app).post(baseUrl + "/login").send(testUser);
        const accessToken = response.body.accessToken;
        const refreshToken = response.body.refreshToken;

        expect(accessToken).not.toBe(testUser.accessToken);
        expect(refreshToken).not.toBe(testUser.refreshToken);
    });

    test("Auth test login fail", async () => {
        const response = await request(app).post(baseUrl + "/login").send({
            email: testUser.email,
            password: "sdfsd",
        });
        expect(response.statusCode).not.toBe(200);

        const response2 = await request(app).post(baseUrl + "/login").send({
            email: "dsfasd",
            password: "sdfsd",
        });
        expect(response2.statusCode).not.toBe(200);
    });

    test("Auth test me", async () => {
        const response = await request(app).post("/posts").send(postsMock[0]);
        expect(response.statusCode).not.toBe(201);
        const response2 = await request(app).post("/posts").set(
            { authorization: "JWT " + testUser.accessToken }
        ).send(postsMock[0]);
        expect(response2.statusCode).toBe(201);
    });

    test("Test refresh token", async () => {
        const response = await request(app).post(baseUrl + "/refreshToken").send({
            refreshToken: testUser.refreshToken,
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();
        testUser.accessToken = response.body.accessToken;
        testUser.refreshToken = response.body.refreshToken;
    });

    test("Refresh token fails with invalid token", async () => {
        const response = await request(app).post(baseUrl + "/refreshToken").send({
            refreshToken: "invalidToken",
        });
    
        expect(response.statusCode).toBe(500);
        expect(response.text).toBe("fail");
    });

    test("Login fails when generateToken returns null", async () => {
        jest.spyOn(jwt, "sign").mockImplementation(() => {
            throw new Error("JWT Signing error");
        });
    
        const response = await request(app).post(baseUrl + "/login").send({
            email: testUser.email,
            password: testUser.password,
        });
    
        expect(response.statusCode).toBe(400);
        jest.restoreAllMocks();
    });

    test("Returns 500 when generateToken returns null", async () => {
        // Mock `generateToken` to return null without throwing an error
        const spy = jest.spyOn(AuthController, "generateToken").mockReturnValue(null);
        
        const response = await request(app)
            .post("/auth/login") 
            .send({
                email: testUser.email,
                password: testUser.password,
            });
    
        // Expect a 500 status code due to null tokens
        expect(response.statusCode).toBe(500);
        expect(response.text).toBe("Server Error");
    
        spy.mockRestore(); // Restore original behavior after the test
    });
    

    test("Login handles null refreshToken array", async () => {
        const user = await userModel.create({
            userName: "testUser",
            email: "emailTest@user.com",
            password: await bcrypt.hash("password123", 10),
            refreshToken: null, // No refresh tokens initially
        });
    
        const response = await request(app).post("/auth/login").send({
            email: user.email,
            password: "password123",
        });
    
        expect(response.statusCode).toBe(200);
        expect(response.body.refreshToken).toBeDefined();
        const updatedUser = await userModel.findById(user._id);
        expect(updatedUser?.refreshToken).toContain(response.body.refreshToken);
    });

    test("Login handles user with null refreshToken", async () => {
        // Create a user with a null refreshToken array
        const user = await userModel.create({
            userName: "nullTokenUser",
            email: "nullTokenUser@user.com",
            password: await bcrypt.hash("password123", 10),
            refreshToken: null,
        });
    
        // Attempt login
        const response = await request(app).post(baseUrl + "/login").send({
            email: user.email,
            password: "password123",
        });
    
        expect(response.statusCode).toBe(200);
        expect(response.body.refreshToken).toBeDefined();
    
        // Verify that the refreshToken array is populated
        const updatedUser = await userModel.findById(user._id);
        expect(updatedUser?.refreshToken).toContain(response.body.refreshToken);
    });

    test("Login fails when ACCESS_TOKEN_SECRET is missing", async () => {
        const originalAccessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    
        // Temporarily unset the environment variable
        delete process.env.ACCESS_TOKEN_SECRET;
    
        const response = await request(app).post(baseUrl + "/login").send({
            email: testUser.email,
            password: testUser.password,
        });
    
        expect(response.statusCode).toBe(500);
        expect(response.text).toBe("Server Error");
    
        // Restore the environment variable
        process.env.ACCESS_TOKEN_SECRET = originalAccessTokenSecret;
    });

    test("Refresh token fails when refresh token is invalid", async () => {
        const response = await request(app).post(baseUrl + "/refreshToken").send({
            refreshToken: "invalidToken",
        });
    
        expect(response.statusCode).toBe(500);
        expect(response.text).toBe("fail");
    });
    
    test("Refresh token fails when user is not found", async () => {
        jest.spyOn(userModel, "findById").mockResolvedValue(null);
    
        const response = await request(app).post(baseUrl + "/refreshToken").send({
            refreshToken: testUser.refreshToken,
        });
    
        expect(response.statusCode).toBe(500);
        expect(response.text).toBe("fail");
    
        jest.restoreAllMocks();
    });

    test("Refresh token fails when token verification throws an error", async () => {
        jest.spyOn(jwt, "verify").mockImplementation(() => {
            throw new Error("JWT Verification error");
        });

        const response = await request(app).post(baseUrl + "/refreshToken").send({
            refreshToken: testUser.refreshToken,
        });

        expect(response.statusCode).toBe(500);
        expect(response.text).toBe("fail");
        jest.restoreAllMocks();
    });

    test("Logout fails when refresh token is missing", async () => {
        const response = await request(app).post(baseUrl + "/logout").send({});
    
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("fail");
    });
    
    test("Logout fails when refresh token is invalid", async () => {
        const response = await request(app).post(baseUrl + "/logout").send({
            refreshToken: "invalidToken",
        });
    
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("fail");
    });
    

    test("Double use refresh token", async () => {
        const response = await request(app).post(baseUrl + "/refreshToken").send({
            refreshToken: testUser.refreshToken,
        });
        expect(response.statusCode).toBe(200);
        const refreshTokenNew = response.body.refreshToken;

        const response2 = await request(app).post(baseUrl + "/refreshToken").send({
            refreshToken: testUser.refreshToken,
        });
        expect(response2.statusCode).not.toBe(200);

        const response3 = await request(app).post(baseUrl + "/refreshToken").send({
            refreshToken: refreshTokenNew,
        });
        expect(response3.statusCode).not.toBe(200);
    });

    test("Refresh token fails when token is not in user's refreshToken array", async () => {
        // Clear the refreshToken array before the test
        await userModel.updateOne({ _id: testUser._id }, { refreshToken: [] });
    
        // Generate a token that is not in the user's array
        const invalidToken = jwt.sign(
            { _id: "nonexistentUserId" }, // A user ID that doesn't match any real user
            process.env.REFRESH_TOKEN_SECRET!, // Use the same secret for validity
            { expiresIn: "1h" }
        );
    
        // Send the invalid token to the refresh endpoint
        const response = await request(app).post("/auth/refreshToken").send({
            refreshToken: invalidToken,
        });
    
        // Assert the response indicates failure
        expect(response.statusCode).toBe(500);
        expect(response.text).toBe("fail");
    
        // Verify the user's refreshToken array remains empty
        const updatedUser = await userModel.findById(testUser._id);
        expect(updatedUser?.refreshToken).toEqual([]);
    });

    test("Refresh token fails when REFRESH_TOKEN_SECRET is missing", async () => {
        const originalRefreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    
        delete process.env.REFRESH_TOKEN_SECRET;
    
        const response = await request(app).post(baseUrl + "/refreshToken").send({
            refreshToken: testUser.refreshToken,
        });
    
        expect(response.statusCode).toBe(500);

        process.env.REFRESH_TOKEN_SECRET = originalRefreshTokenSecret;
    });

    test("Generate token fails when environment variables are missing", () => {
        const originalAccessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        const originalRefreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
    
        // Temporarily unset environment variables
        delete process.env.ACCESS_TOKEN_SECRET;
        delete process.env.REFRESH_TOKEN_SECRET;
    
        const tokens = AuthController.generateToken("testUserId");
        expect(tokens).toBeNull();
    
        // Restore environment variables
        process.env.ACCESS_TOKEN_SECRET = originalAccessTokenSecret;
        process.env.REFRESH_TOKEN_SECRET = originalRefreshTokenSecret;
    });
    
      test("Test logout", async () => {
        const original_jwt_token_expiration = process.env.JWT_TOKEN_EXPIRATION

        // temparerlly change the vlaues 
        process.env.JWT_TOKEN_EXPIRATION = '3s'

        const response = await request(app).post(baseUrl + "/login").send(testUser);
        expect(response.statusCode).toBe(200);
        testUser.accessToken = response.body.accessToken;
        testUser.refreshToken = response.body.refreshToken;

        const response2 = await request(app).post(baseUrl + "/logout").send({
          refreshToken: testUser.refreshToken,
        });
        expect(response2.statusCode).toBe(200);

        const response3 = await request(app).post(baseUrl + "/refreshToken").send({
          refreshToken: testUser.refreshToken,
        });
        expect(response3.statusCode).not.toBe(200);

        process.env.JWT_TOKEN_EXPIRATION = original_jwt_token_expiration
      });

      jest.setTimeout(10000);

      test("Logout fails with invalid refresh token", async () => {
        const response = await request(app).post(baseUrl + "/logout").send({
            refreshToken: "invalidToken",
        });
    
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("fail");
    });

    test("Logout fails when token verification throws an error", async () => {
        jest.spyOn(jwt, "verify").mockImplementation(() => {
            throw new Error("JWT Verification error");
        });
    
        const response = await request(app).post(baseUrl + "/logout").send({
            refreshToken: testUser.refreshToken,
        });
    
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("fail");
        jest.restoreAllMocks();
    });
    
    test("Test timeout token ", async () => {
    const original_jwt_token_expiration = process.env.JWT_TOKEN_EXPIRATION

    // temparerlly change the vlaues 
    process.env.JWT_TOKEN_EXPIRATION = '3s'

    const response = await request(app).post(baseUrl + "/login").send(testUser);
    expect(response.statusCode).toBe(200);
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;

    await new Promise((resolve) => setTimeout(resolve, 5000));

    const response2 = await request(app).post("/posts").set(
        { authorization: "JWT " + testUser.accessToken }
    ).send(postsMock[0]);
    expect(response2.statusCode).not.toBe(201);

    const response3 = await request(app).post(baseUrl + "/refreshToken").send({
        refreshToken: testUser.refreshToken,
    });
    expect(response3.statusCode).toBe(200);
    testUser.accessToken = response3.body.accessToken;

    const response4 = await request(app).post("/posts").set(
        { authorization: "JWT " + testUser.accessToken }
    ).send(postsMock[0]);
    expect(response4.statusCode).toBe(201);

    process.env.JWT_TOKEN_EXPIRATION = original_jwt_token_expiration

    });

    test("Returns 500 when ACCESS_TOKEN_SECRET is missing", async () => {
        // Temporarily delete the environment variable
        const originalAccessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        delete process.env.ACCESS_TOKEN_SECRET;

        // Send a request to an endpoint that uses the middleware
        const response = await request(app).get("/posts").set(
                    { authorization: "JWT " + testUser.accessToken }
                );

        // Verify the response
        expect(response.statusCode).toBe(500);
        expect(response.text).toBe("Server Error");

        // Restore the environment variable
        process.env.ACCESS_TOKEN_SECRET = originalAccessTokenSecret;
    });

    test("Returns 400 when verifyRefreshToken returns null (no user)", async () => {    
        const spy = jest.spyOn(AuthController, "verifyRefreshToken").mockResolvedValue(null);
        const response = await request(app).post("/auth/refreshToken").send({
            refreshToken: "someInvalidToken",
        });
    
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("fail");
    
        spy.mockRestore(); // Restore original behavior after the test
    });

    test("Returns 500 when generateToken returns null", async () => {
        // Mock `generateToken` to return null
        jest.spyOn(AuthController, "generateToken").mockReturnValue(null);

        // Mock `verifyRefreshToken` to resolve with a valid user
        jest.spyOn(AuthController, "verifyRefreshToken").mockResolvedValue({
            _id: testUser._id,
            refreshToken: [testUser.refreshToken], // Adjust if `refreshToken` is an array
        } as unknown as AuthController.tUser);
    
        const response = await request(app).post("/auth/refreshToken").send({
            refreshToken: "validToken",
        });
    
        expect(response.statusCode).toBe(500);
        expect(response.text).toBe("Server Error");
    
        jest.restoreAllMocks();
    });

    test("Returns 500 when an unexpected error occurs", async () => {
        jest.spyOn(AuthController, "verifyRefreshToken").mockImplementation(() => {
            throw new Error("Unexpected Error");
        });

        const response = await request(app).post("/auth/refreshToken").send({
            refreshToken: testUser.refreshToken,
        });
    
        expect(response.statusCode).toBe(500);
        expect(response.text).toBe("fail");
    
        jest.restoreAllMocks();
    }); 
    
    const expiredToken = "eyJhbGciOiJIUzI1NaIsInR5cCI6IkpXVCJ1.eyJfaWQiOiI2NzY4MjkwMTFhYzI0ZGIzYmZlM2ZiNWMiLCJyYW5kb20iOiIwLjYyNTM4MzM4OTA1MTI3MDgiLCJpYXQiOjE3MzQ4Nzk0OTEsImV4cCI6MTczNDg5MDI5MX0.aRqcIk088ub-vIxq84T_YaGrMijdpxK_Kdfm7Wf4OuI"
    let postId = ""
    test("Test fail Update Post - token expired", async () => {
        const portResponse = await request(app).post("/posts").send({
            content: postsMock[0].content
        }).set(
            { authorization: "JWT " + testUser.accessToken }
        );

        postId = portResponse.body._id

        const response = await request(app).put("/posts/" + portResponse.body._id).send(postsMock[0]).set(
            { authorization: "JWT " + expiredToken }
        );

        expect(response.statusCode).toBe(401);
    });

    test("Test fail Update Comment - User Doesnt ownes the comment", async () => {
        // create comment with testuser
        const CommentResponse = await request(app).post("/comments").set(
            { authorization: "JWT " + testUser.accessToken }
        ).send({
            content: commentsMock[0].content,
            postId: postId
        },);

        expect(CommentResponse.statusCode).toBe(201);
        expect(CommentResponse.body.ownerId).toBe(testUser._id);
        const commentId = CommentResponse.body._id;
        
        const response = await request(app).put("/comments/" + commentId).send({content: commentsMock[1].content}).set(
            { authorization: "JWT " + testUser2.accessToken }
        );
        // Forbbiden.
        expect(response.statusCode).toBe(403);
        
        const response2 = await request(app).get("/comments/" + commentId).set(
            { authorization: "JWT " + testUser.accessToken }
        );
        expect(response2.statusCode).toBe(200);
        expect(response2.body.content).toBe(commentsMock[0].content);
        expect(response2.body.postId).toBe(postId);
        expect(response2.body.ownerId).toBe(testUser._id);
    });

    const badToken = "eyJ77GciOiJIUzI1NaIsInR5cCI6IkpXVCJ1.eyJfaWQiOiI2NzY4MjkwMTFhYzI0ZGIzYmZlM2ZiNWMiLCJyYW5kb20iOiIwLjYyNTM4MzM4OTA1MTI3MDgiLCJpYXQiOjE3MzQ4Nzk0OTEsImV4cCI6MTczNDg5MDI5MX0.aRqcIk088ub-vIxq84T_YaGrMijdpxK_Kdfm7Wf4OuI"
    test("Test Fail Create Comment - Bad Token", async () => {
            const response = await request(app).post("/comments").set(
                { authorization: "JWT " + badToken }
            ).send(commentsMock[0]);
    
            expect(response.statusCode).toBe(401);
        });

});
