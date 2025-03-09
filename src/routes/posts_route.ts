import express from 'express';
import postsController, { getPosts } from "../controllers/posts_controller";
import { authMiddleware } from '../controllers/auth_controller';

export const postsRouter = express.Router();

/**
 * @swagger
 * tags:
*   name: Posts
*   description: The Posts API
*/

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - ownerId
 *       properties:
 *         title:
 *           type: string
 *           description: The post title
 *         content:
 *           type: string
 *           description: The post content
 *         ownerId:
 *           type: string
 *           description: The ID of the user who owns the post
 *         _id:
 *           type: string
 *           description: The ID of the post
 *       example:
 *         title: 'My First Post'
 *         content: 'This is the content of my first post.'
 *         ownerId: '648df123abc456'
 */

/**
 * @swagger
 * /posts/{postId}:
 *   delete:
 *     summary: Deletes a post by its ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: The ID of the post
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Retrieves all posts or posts by a specific sender
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: sender
 *         in: query
 *         required: false
 *         description: The ID of the sender to filter posts by (MongoDB ObjectId)
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error message explaining the failure
 */
postsRouter.get('/', authMiddleware, postsController.getAll.bind(postsController));

postsRouter.get("/paging", getPosts); // Route for paginated posts

/**
 * @swagger
 * /posts/{postId}:
 *   get:
 *     summary: Retrieves a single post by its ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         description: The ID of the post (MongoDB ObjectId)
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *     responses:
 *       200:
 *         description: The requested post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */
postsRouter.get('/:id', authMiddleware, postsController.getById.bind(postsController));

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Creates a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the post
 *                 example: "bla"
 *               content:
 *                 type: string
 *                 description: The content of the post
 *                 example: "My Post..."
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title:
 *                   type: string
 *                   description: The title of the post
 *                   example: "bla"
 *                 content:
 *                   type: string
 *                   description: The content of the post
 *                   example: "My Post..."
 *                 ownerId:
 *                   type: string
 *                   description: The ID of the user who owns the post (MongoDB ObjectId)
 *                   example: "6787ac2195bbbacf45bffbc9"
 *                 _id:
 *                   type: string
 *                   description: The unique identifier for the post (MongoDB ObjectId)
 *                   example: "6787c0a946385482beb66633"
 *                 __v:
 *                   type: integer
 *                   description: The version key of the document
 *                   example: 0
 *       400:
 *         description: Bad request - Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message explaining the failure
 *                   example: "Validation failed: One or more Required fields are missing."
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message explaining the unauthorized request
 *                   example: "Unauthorized"
 */
postsRouter.post("/", authMiddleware, postsController.create.bind(postsController));
/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Updates a specific post by its ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the post to update (MongoDB ObjectId)
 *         schema:
 *           type: string
 *           pattern: '^[a-fA-F0-9]{24}$'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The updated title of the post
 *                 example: "Hello 2222"
 *               content:
 *                 type: string
 *                 description: The updated content of the post
 *                 example: "Hello World..."
 *     responses:
 *       200:
 *         description: Successfully updated the post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       403:
 *         description: Forbidden - Authenticated user is not the owner of the post
 *       404:
 *         description: Post not found
 *       500:
 *         description: Internal server error
 */
postsRouter.put('/:id', authMiddleware, postsController.update.bind(postsController));

