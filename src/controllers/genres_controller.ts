import { Request, Response } from "express";
import axios from "axios";

class GenresController {
    async getGenres(req: Request, res: Response): Promise<void> {
        const { text } = req.query;

        if (!text || typeof text !== 'string') {
            res.status(400).json({ error: "Text query parameter is required." });
            return;
        }

        try {
            // Call the AI model (Gemini) to get genres
            const response = await axios.post('https://api.gemini.ai/v1/extract-genres', {
                input: text,
            });

            const genres = response.data.genres; // Adjust this according to the actual API response structure
            if (!Array.isArray(genres) || genres.length < 3) {
                res.status(400).json({ error: "Insufficient genres returned from AI." });
                return;
            }

            // Extract and return the first three genres
            const resultGenres = genres.slice(0, 3);
            res.status(200).json(resultGenres);
        } catch (error) {
            res.status(500).json({ error: "Error processing request." });
        }
    }
}

export default new GenresController();
