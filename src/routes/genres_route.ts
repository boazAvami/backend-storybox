import express from 'express';
import genresController from "../controllers/genres_controller";

export const genresRouter = express.Router();

/**
 * @swagger
 * /genres:
 *   get:
 *     summary: Retrieves genres for a given text
 *     tags: [Genres]
 *     parameters:
 *       - name: text
 *         in: query
 *         required: true
 *         description: The text for which to extract genres
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: An array of genres
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       400:
 *         description: Bad request - Missing or invalid text
 *       500:
 *         description: Internal server error
 */
genresRouter.post("/", genresController.getGenres.bind(genresController));
