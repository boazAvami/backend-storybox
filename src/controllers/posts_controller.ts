import { Request, Response } from "express";
import { IPost, postModel } from "../models/posts_model";
import BaseController, { authenticatedRequest } from "./base_controller";
import likes_controller from "./likes_controller";
import PostDto from "../models/posts_dto_model";


class PostsController extends BaseController<IPost> {
    constructor() {
        super(postModel);
    }
    
    // getAllPostsOrBySender
    async getAll(req: Request, res: Response): Promise<void> {
        try {
            const { sender } = req.query;
            const userId = req.params.userId; 
            let posts;
            if (sender) {
                posts = await postModel.find({ ownerId: sender });
            } else {
                posts = await postModel.find();
            }

             // Using async map and waiting for all promises
            const postsDto = await Promise.all(posts.map(async (post) => {
            const isLiked = await likes_controller.isLikedByMe(post.id, userId);
            return new PostDto(post, isLiked);  // Create a new PostDto instance
            }));
        res.status(200).json(postsDto);

        } catch (error) {
            res.status(400).send(error.message);
        }
    };

    async update(req: authenticatedRequest, res: Response) {
        const postId = req.params.id;
        try {
            const post = await super.getByIdInternal(postId)
            const postOwnerId = post.ownerId.toString()
            const authenticatedUserId = req.params.userId;
            
            if (authenticatedUserId !== postOwnerId){
                res.status(403).send('Forbbiden');
            } else{
                const updatedItem = await this.model.findByIdAndUpdate(req.params.id, req.body, { new: true });
                if (!updatedItem) {
                    res.status(404).json({ message: 'Not found' });
                } else {
                    const postDto = new PostDto(post, await likes_controller.isLikedByMe(postId, authenticatedUserId))
                    res.status(200).json(postDto);
                }
            }
                
        } catch (err) {
            if (err.message === 'Item Not Found') {
                res.status(404).json({error: 'Post Not Found'})
            } else {
                res.status(500).json({ error: err.message });
            }
        }
    };

    async getById(req: Request, res: Response) {
        const postId = req.params.id;
        const userId = req.params.userId;

        try {
            const post = await this.getByIdInternal(postId);
            if (post) {
                const postDto = new PostDto(post, await likes_controller.isLikedByMe(postId, userId))
                res.send(postDto);
            }
        } catch (error) {
            if (error.message == 'Item Not Found') {
                res.status(404).send({ error: 'Item Not Found'});
            } else {
                res.status(400).send({ error: error.message });
            }
        }
    };

    async delete(req: authenticatedRequest, res: Response) {
            
        try {
                const postId = req.params.id;
                const post = await super.getByIdInternal(postId)
                const postOwnerId = post.ownerId.toString()
    
                await super.delete(req, res, postOwnerId)
                
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