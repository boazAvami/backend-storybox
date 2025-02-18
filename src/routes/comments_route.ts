import express from 'express';
import commentsController from "../controllers/comments_controller";
import { authMiddleware } from '../controllers/auth_controller';
export const commentsRouter = express.Router();

/**
 * @swagger
 * tags:
*   name: Comments
*   description: The Comments API
*/

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - postId
 *         - content
 *         - ownerId
 *       properties:
 *         postId:
 *           type: string
 *           description: The ID of the post being commented on
 *         content:
 *           type: string
 *           description: The comment text
 *         ownerId:
 *           type: string
 *           description: The ID of the user who made the comment
 *         _id:
 *           type: string
 *           description: The ID of the comment
 *       example:
 *         postId: '648df123abc456'
 *         content: 'This is a comment on the post.'
 *         ownerId: '123abc456def789'
 */

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Retrieves all comments or comments filtered by Post ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: postId
 *         schema:
 *           type: string
 *           description: Filter comments by the post ID (MongoDB ObjectId)
 *           example: "674cbf10e4304a6f3b4b5046"
 *     responses:
 *       200:
 *         description: Successfully retrieved comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Internal server error
 */
commentsRouter.get('/', authMiddleware, commentsController.getAll.bind(commentsController));

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Retrieves a comment by its ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the comment to retrieve (MongoDB ObjectId)
 *           example: "6767e6c8096a6aee9257a1e4"
 *     responses:
 *       200:
 *         description: Successfully retrieved the comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Item not found
 *       500:
 *         description: Internal server error
 */
commentsRouter.get('/:id', authMiddleware, commentsController.getById.bind(commentsController));

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Creates a new comment
 *     tags: [Comments]
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
 *                 description: The ID of the post to associate with the comment
 *                 example: "6787b2080a38e414151b39c4"
 *               content:
 *                 type: string
 *                 description: The content of the comment
 *                 example: "This is a great post! Thanks for sharing."
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Validation failed - Required fields are missing
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
commentsRouter.post("/", authMiddleware, commentsController.create.bind(commentsController));

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Deletes a comment by its ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the comment to delete (MongoDB ObjectId)
 *           example: "6767e6c8096a6aee9257a1e4"
 *     responses:
 *       200:
 *         description: Successfully deleted the comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       403:
 *         description: Forbidden - User is not authorized to delete the comment
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
commentsRouter.delete('/:id', authMiddleware, commentsController.delete.bind(commentsController));

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Updates a comment by its ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the comment to update (MongoDB ObjectId)
 *           example: "6767e6c8096a6aee9257a1e4"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: string
 *                 description: The ID of the post associated with the comment
 *                 example: "6787b2080a38e414151b39c4"
 *               content:
 *                 type: string
 *                 description: The updated content of the comment
 *                 example: "This is an updated comment."
 *     responses:
 *       200:
 *         description: Successfully updated the comment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       403:
 *         description: Forbidden - User is not authorized to update the comment
 *       404:
 *         description: Comment or post not found
 *       500:
 *         description: Internal server error
 */
commentsRouter.put('/:id', authMiddleware, commentsController.update.bind(commentsController));
