import express from 'express';
import usersController from "../controllers/users_controller";
import { authMiddleware } from '../controllers/auth_controller';
export const usersRouter = express.Router();

/**
 * @swagger
 * tags:
*   name: Users
*   description: The Users API
*/

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - userName
 *       properties:
 *         email:
 *           type: string
 *           description: The user email
 *         password:
 *           type: string
 *           description: The user password
 *         userName:
 *           type: string
 *           description: The user username
 *         firstName:
 *           type: string
 *           description: The user first name
 *         lastName:
 *           type: string
 *           description: The user last name
 *         phone_number:
 *           type: string
 *           description: The user phone number
 *         date_of_birth:
 *           type: string
 *           format: date
 *           description: The user date of birth
 *         gender:
 *           type: string
 *           description: The user gender
 *         _id:
 *           type: string
 *           description: The ID of the user
 *       example:
 *         email: 'bob@gmail.com'
 *         password: '123456'
 *         userName: 'bobMan'
 */

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Deletes a user by their ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the user to delete (MongoDB ObjectId)
 *           example: "676817143be1c8ebe3ec1bdb"
 *     responses:
 *       200:
 *         description: Successfully deleted the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The ID of the deleted user
 *                   example: "676817143be1c8ebe3ec1bdb"
 *       403:
 *         description: Forbidden - User is not authorized to delete this user
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
usersRouter.delete('/:id', authMiddleware, usersController.delete.bind(usersController));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieves all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal server error
 */
usersRouter.get('/', authMiddleware, usersController.getAll.bind(usersController));

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Updates a user by their ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the user to update (MongoDB ObjectId)
 *           example: "67682ede17373e1968230b78"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: The updated email of the user
 *                 example: "yaeli11@gmail"
 *               password:
 *                 type: string
 *                 description: The updated password of the user
 *                 example: "ssss"
 *     responses:
 *       200:
 *         description: Successfully updated the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: Forbidden - User is not authorized to update this user
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
usersRouter.put('/:id', authMiddleware, usersController.update.bind(usersController));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retrieves a user by their ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           description: The ID of the user to retrieve (MongoDB ObjectId)
 *           example: "67682ede17373e1968230b78"
 *     responses:
 *       200:
 *         description: Successfully retrieved the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       400:
 *         description: Invalid user ID format
 *       500:
 *         description: Internal server error
 */
usersRouter.get('/:id', authMiddleware, usersController.getById.bind(usersController));

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get the details of the authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - No valid token
 *       500:
 *         description: Internal server error
 */
usersRouter.get('/self/me', authMiddleware, usersController.getMe.bind(usersController));
