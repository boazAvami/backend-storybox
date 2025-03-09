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

export const getPosts = async (req: Request, res: Response) => {
    try {
        console.log("heres")
        const page = parseInt(req.query.page as string) || 1; // Get page number from query
        const limit = 10; // Number of posts per page
        const skip = (page - 1) * limit; // Calculate how many to skip

        console.log(`Fetching posts - Page: ${page}, Limit: ${limit}, Skip: ${skip}`);

        const posts = await postModel.find().sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit); // Get paginated posts
        const totalPosts = await postModel.countDocuments(); // Count total posts

        // Count total posts for pagination
        console.log(`Retrieved ${posts.length} posts (out of ${totalPosts})`);

        res.status(200).json({
            posts,
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Something went wrong with get posts." });
    }
};

export default new PostsController();