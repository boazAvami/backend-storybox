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
        const ownerId = req.params.userId; // Extract user ID from JWT token
    
        try {
            // Check if the post exists
            const postExists = await postModel.findById(postId);
            if (!postExists) {
                return res.status(404).json({ message: "Post not found" });
            }

            // Check if the like already exists
            const existingLike = await likeModel.findOne({ postId, ownerId });
            if (existingLike) {
                return res.status(400).json({ message: "You have already liked this post" });
            }

            await super.create(req, res)
            await postModel.findByIdAndUpdate(postId, { $inc: { like_count: 1 } });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async unlikePost(req: authenticatedRequest, res: Response) {
        const postId = req.params.postId;
        const ownerId = req.params.userId; // ID of the logged-in user
    
        try {
            // Find the like entry
            const like = await likeModel.findOneAndDelete({ postId, ownerId });

            if (!like) {
                return res.status(404).json({ message: "You haven't liked this post yet" });
            }
            await postModel.findByIdAndUpdate(postId, { $inc: { like_count: -1 } });
            return res.status(200).json({ message: "Like removed successfully" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async isLikedByMe(postId, ownerId) {
        try {
        
            // Check if the like exists
            const existingLike = await likeModel.findOne({ postId, ownerId });
            if (existingLike) {
                return true;
            } else {
                return false;
            }

        } catch (error) {
            return false
        }
    }
}

export default new LikesController();
