import express from 'express';
import genresController from "../controllers/genres_controller";

export const genresRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Genres
 *   description: API for extracting genres from a given text
 */

/**
 * @swagger
 * /genres:
 *   post:
 *     summary: Extracts genres from the provided text
 *     tags: [Genres]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: The text to analyze for genre classification
 *     responses:
 *       200:
 *         description: An array of up to three detected genres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       400:
 *         description: Bad request - Missing or invalid text parameter
 *       500:
 *         description: Internal server error
 */
genresRouter.post("/", genresController.getGenres.bind(genresController));
