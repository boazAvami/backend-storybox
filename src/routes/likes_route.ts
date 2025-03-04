import express from "express";
import likesController from "../controllers/likes_controller";
import { authMiddleware } from "../controllers/auth_controller";
export const likesRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Likes
 *   description: The Likes API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Like:
 *       type: object
 *       required:
 *         - postId
 *         - userId
 *       properties:
 *         postId:
 *           type: string
 *           description: The ID of the post being liked
 *         userId:
 *           type: string
 *           description: The ID of the user who liked the post
 *         _id:
 *           type: string
 *           description: The ID of the like entry
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the like was created
 *       example:
 *         postId: "648df123abc456"
 *         userId: "123abc456def789"
 *         createdAt: "2025-03-04T12:34:56.789Z"
 */

/**
 * @swagger
 * /likes:
 *   get:
 *     summary: Retrieves all likes or likes filtered by Post ID
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *           description: Filter likes by the post ID (MongoDB ObjectId)
 *           example: "674cbf10e4304a6f3b4b5046"
 *     responses:
 *       200:
 *         description: Successfully retrieved likes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Like"
 *       500:
 *         description: Internal server error
 */
likesRouter.get("/", authMiddleware, likesController.getAll.bind(likesController));

/**
 * @swagger
 * /likes/{id}:
 *   get:
 *     summary: Retrieves a like by its ID
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the like entry
 *           example: "6767e6c8096a6aee9257a1e4"
 *     responses:
 *       200:
 *         description: Successfully retrieved the like
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Like"
 *       404:
 *         description: Like not found
 *       500:
 *         description: Internal server error
 */
likesRouter.get("/:id", authMiddleware, likesController.getById.bind(likesController));

/**
 * @swagger
 * /likes:
 *   post:
 *     summary: Likes a post
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *                 description: The ID of the post to like
 *                 example: "6787b2080a38e414151b39c4"
 *     responses:
 *       201:
 *         description: Like added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Like"
 *       400:
 *         description: Already liked or invalid data
 *       500:
 *         description: Internal server error
 */
likesRouter.post("/", authMiddleware, likesController.likePost.bind(likesController));

/**
 * @swagger
 * /likes:
 *   delete:
 *     summary: Unlikes a post
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *                 description: The ID of the post to unlike
 *                 example: "6787b2080a38e414151b39c4"
 *     responses:
 *       200:
 *         description: Like removed successfully
 *       404:
 *         description: Like not found
 *       500:
 *         description: Internal server error
 */
likesRouter.delete("/", authMiddleware, likesController.unlikePost.bind(likesController));

export default likesRouter;
