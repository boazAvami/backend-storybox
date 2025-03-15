import express from "express";
import conversationsController from "../controllers/conversations_controller";
import { authMiddleware } from "../controllers/auth_controller";

export const conversationsRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Conversations
 *   description: API for user conversations
 */

/**
 * @swagger
 * /conversations:
 *   post:
 *     summary: Creates a new conversation between two users
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId1:
 *                 type: string
 *               userId2:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conversation created successfully
 */
conversationsRouter.post("/", authMiddleware, conversationsController.create.bind(conversationsController));

/**
 * @swagger
 * /conversations:
 *   get:
 *     summary: Retrieves all conversations for a user
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: true
 *         description: The ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of conversations
 */
conversationsRouter.get("/", authMiddleware, conversationsController.getAll.bind(conversationsController));

/**
 * @swagger
 * /conversations/{id}:
 *   get:
 *     summary: Retrieves a single conversation by ID
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the conversation
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The requested conversation
 */
conversationsRouter.get("/:id", authMiddleware, conversationsController.getById.bind(conversationsController));

/**
 * @swagger
 * /conversations/{id}/messages:
 *   post:
 *     summary: Adds a message to a conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               senderId:
 *                 type: string
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message added successfully
 */
conversationsRouter.post("/:id/messages", authMiddleware, conversationsController.addMessage.bind(conversationsController));

/**
 * @swagger
 * /conversations/{id}:
 *   delete:
 *     summary: Deletes a conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the conversation to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
 *       404:
 *         description: Conversation not found
 */
conversationsRouter.delete("/:id", authMiddleware, conversationsController.deleteConversation.bind(conversationsController)); // ✅ Fixed method name
