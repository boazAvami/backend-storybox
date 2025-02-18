import { Request, Response } from "express";
import { commentModel, IComments } from "../models/comments_model";
import BaseController from "./base_controller";
import {authenticatedRequest} from "./base_controller";
import { postModel } from "../models/posts_model";

class CommentsController extends BaseController<IComments> {
    constructor() {
        super(commentModel);
    }

    // Get All Comments, Or By Post Id
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const { postId } = req.query;

            if (postId) {
                const comments = await commentModel.find({ postId });
                res.status(200).json(comments);
            } else {
                const comments = await commentModel.find();
                res.status(200).json(comments);
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async update(req: authenticatedRequest, res: Response) {
        const commentId = req.params.id;
        
        try {
            const comment = await super.getByIdInternal(commentId)
            const commntOwnerId = comment.ownerId.toString()
            
            // Check if postId provided in the request body
            if (req.body.postId) {
                // Check if the post exists by finding the post ID
                const postExists = await postModel.findById(req.body.postId);
                
                if (!postExists) {
                    throw new Error('Post not found');
                }
            }

            await super.update(req, res, commntOwnerId);
            
        } catch (err) {
            if (err.message === 'Item Not Found') {
                res.status(404).json({error: 'Comment Not Found'})
            } else if (err.message === 'Post not found'){
                res.status(404).json({ message: 'Post not found' });
            } else {
                res.status(500).json({ error: err.message });
            }
        }
    };

    async delete(req: authenticatedRequest, res: Response) {
        const commentId = req.params.id;
            
        try {
                const comment = await super.getByIdInternal(commentId)
                const commntOwnerId = comment.ownerId.toString()
    
                await super.delete(req, res, commntOwnerId)
            } catch (err) {
                if (err.message === 'Item Not Found') {
                    res.status(404).json({error: 'Comment Not Found'})
                } else {
                    res.status(500).json({ error: err.message });
                }
            }
        };

        async create(req: Request, res: Response) {
            const postId = req.body.postId;

            try {
                // Check if the post exists by finding the post ID
                const postExists = await postModel.findById(postId);

                if (!postExists) {
                    res.status(404).json({ message: 'Post not found' });
                } else {
                    await super.create(req, res);
                }
            } catch (error) {
                res.status(400).send(error);
            }
        };
}

export default new CommentsController();