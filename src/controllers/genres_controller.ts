import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

class GenresController {

    async getGenres(req: Request, res: Response): Promise<void> {
        const { text } = req.body;
        
        if (!text || typeof text !== 'string') {
            res.status(400).json({ error: "Text body parameter is required." });
            return;
        }

        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const result = await model.generateContent(this.getPrompt(text));
            const response = await result.response;
            const responseText = response.text();

            if (!responseText) {
                res.status(500).json({ error: "Gemini API returned an empty response." });
                return;
            }

            const genres = responseText.split(',').map((genre) => genre.trim());

            const resultGenres = genres.slice(0, 3);
            res.status(200).json(resultGenres);

        } catch (error) {
            console.error("Error processing request:", error);
            res.status(500).json({ error: "Error processing request." });
        }
    }

    private getPrompt(text: string): string {
        const genresList = [
            "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery",
            "Romance", "Sci-Fi", "Thriller", "Western", "Historical Fiction",
            "Crime", "Young Adult", "Children's", "Biography", "Autobiography",
            "Science Fiction", "Paranormal", "Suspense"
        ];
    
        const prompt = `Analyze the following story and identify three primary genres from the list below. Return ONLY the genres as a comma-separated list, with no additional text or formatting.
        
        Genres List:
        ${genresList.join(", ")}
    
        Story:
        ${text}
    
        Genres:`;

        return prompt;
    }
    
}



 
export default new GenresController();