import { Request, Response } from "express";
import { likeModel, ILike } from "../models/likes_model";
import BaseController from "./base_controller";
import { authenticatedRequest } from "./base_controller";
import { postModel } from "../models/posts_model";

class LikesController extends BaseController<ILike> {
    constructor() {
        super(likeModel);
    }

    // Get All Likes, Or By Post Id
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const { postId } = req.query;

            if (postId) {
                const likes = await likeModel.find({ postId });
                res.status(200).json(likes);
            } else {
                const likes = await likeModel.find();
                res.status(200).json(likes);
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async likePost(req: Request, res: Response) {
        const postId = req.body.postId;
    
        try {
            // Check if the post exists
            const postExists = await postModel.findById(postId);
            if (!postExists) {
                return res.status(404).json({ message: "Post not found" });
            } else {
                // Add the like
                await super.create(req, res);
            }
           
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    

    async unlikePost(req: authenticatedRequest, res: Response) {
        const likeId = req.params.id;
    
        try {
            // Find like
            const like = await super.getByIdInternal(likeId);
            const likeOwnerId = like.ownerId.toString();
    
            // Delete like
            await super.delete(req, res, likeOwnerId);
        } catch (err) {
            if (err.message === "Item Not Found") {
                res.status(404).json({ error: "Like Not Found" });
            } else {
                res.status(500).json({ error: err.message });
            }
        }
    }
    
}

export default new LikesController();
