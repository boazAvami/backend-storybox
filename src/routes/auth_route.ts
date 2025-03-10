import express from 'express';
import { login, logout, refreshToken, register, googleSignin} from "../controllers/auth_controller";

export const authRouter = express.Router();

/**
 * @swagger
 * tags:
*   name: Auth
*   description: The Authentication API
*/

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Tokens:
 *       type: object
 *       required:
 *         - accessToken
 *         - refreshToken
 *       properties:
 *         accessToken:
 *           type: string
 *           description: The JWT access token
 *         refreshToken:
 *           type: string
 *           description: The JWT refresh token
 *       example:
 *         accessToken: '123cd123x1xx1'
 *         refreshToken: '134r2134cr1x3c'
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registers a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Register success returns access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   description: The access token
 *                 refresh_token:
 *                   type: string
 *                   description: The refresh token
 *                 _id:
 *                   type: string
 *                   description: The user id
 *               example:
 *                 access_token: 'bob@gmail.com'
 *                 refresh_token: '123456'
 *                 _id: "adfasdfasdfasdfsd"
 */
authRouter.post('/register', register);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Authenticates a user using Google Sign-In.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - credential
 *             properties:
 *               credential:
 *                 type: string
 *                 description: The Google ID token obtained from the frontend.
 *             example:
 *               credential: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2M2Jm..."
 *     responses:
 *       200:
 *         description: Successfully authenticated using Google Sign-In.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   description: The authenticated user's email.
 *                 _id:
 *                   type: string
 *                   description: The user's unique ID in the database.
 *                 profile_picture_uri:
 *                   type: string
 *                   description: The user's profile picture (if available).
 *                 access_token:
 *                   type: string
 *                   description: The generated access token for authentication.
 *                 refresh_token:
 *                   type: string
 *                   description: The generated refresh token.
 *               example:
 *                 email: "user@example.com"
 *                 _id: "60d9c1ef6c6c2b001c8e4a72"
 *                 profile_picture_uri: "https://lh3.googleusercontent.com/a-/AOh14Gh6..."
 *                 access_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2M2Jm..."
 *                 refresh_token: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2M2Jm..."
 *       400:
 *         description: Bad request due to missing or invalid Google credentials.
 *         content:
 *           application/json:
 *             example:
 *               message: "Missing credential in request" 
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               message: "Server Error"
 */
authRouter.post("/google", googleSignin);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Logs in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The access & refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 */
authRouter.post('/login', login)

/**
 * @swagger
 * /auth/refreshToken:
 *   post:
 *     summary: Get a new access token using the refresh token
 *     tags: [Auth]
 *     description: Need to provide the refresh token in the auth header
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The access & refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 */
authRouter.post("/refreshToken", refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logs out a user
 *     tags: [Auth]
 *     description: Need to provide the refresh token in the auth header
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout completed successfully
 */
authRouter.post('/logout', logout)