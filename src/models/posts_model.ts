import mongoose from 'mongoose';
import { commentModel } from './comments_model';
import { likeModel } from './likes_model';

export interface IPost {
    // _id?: string;
    content: string;
    ownerId: mongoose.Types.ObjectId;
    image_uri?: string;
    created_at?: Date;
    tags?: string[];
    like_count?: number;
    comment_count?: number;
  }

const postSchema = new mongoose.Schema<IPost>({
    content: { 
        type: String, 
        required: true 
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    image_uri: {
        type: String,
        default: "",
        required: false
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    like_count: {
        type: Number,
        default: 0,
    },
    comment_count: {
        type: Number,
        default: 0,
    },
    tags: {
        type: [String],
        default: [],
    },
});

/** 
 * Mongoose Middleware for cascading delete when a post is deleted 
 */
postSchema.pre("findOneAndDelete", async function (next) {
    const postId = this.getFilter()["_id"]; // Get the post ID being deleted
    if (postId) {
        await commentModel.deleteMany({ postId }); // Delete all comments linked to this post
        await likeModel.deleteMany({ postId })  // Delete all likes linked to this post
    }
    next();
});

export const postModel = mongoose.model<IPost>("Posts", postSchema);