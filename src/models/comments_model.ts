import mongoose from "mongoose";

export interface IComments {
    // _id?: string;
    postId: mongoose.Types.ObjectId;
    ownerId: mongoose.Types.ObjectId;
    content: string;
    created_at: Date;
  }

const CommentSchema = new mongoose.Schema<IComments>({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Posts',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

export const commentModel = mongoose.model<IComments>("Comment", CommentSchema);
