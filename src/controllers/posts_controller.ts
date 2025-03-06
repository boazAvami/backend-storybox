import { Request, Response } from "express";
import { IPost, postModel } from "../models/posts_model";
import BaseController, { authenticatedRequest } from "./base_controller";


class PostsController extends BaseController<IPost> {
    constructor() {
        super(postModel);
    }
    
    // getAllPostsOrBySender
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const { sender } = req.query;

            if (sender) {
                const posts = await postModel.find({ ownerId: sender });
                res.status(200).json(posts);
            } else {
                const posts = await postModel.find();
                res.status(200).json(posts);
            }
        } catch (error) {
            res.status(400).send(error.message);
        }
    };

    async update(req: authenticatedRequest, res: Response) {
            const postId = req.params.id;
            try {
                const post = await super.getByIdInternal(postId)
                const postOwnerId = post.ownerId.toString()
                
                await super.update(req, res, postOwnerId);
                
            } catch (err) {
                if (err.message === 'Item Not Found') {
                    res.status(404).json({error: 'Post Not Found'})
                } else {
                    res.status(500).json({ error: err.message });
                }
            }
    };
}

export default new PostsController();