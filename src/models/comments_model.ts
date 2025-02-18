import mongoose from "mongoose";

export interface IComments {
    postId: string;
    comment: string;
    ownerId: string;
  }

const CommentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
});

export const commentModel = mongoose.model<IComments>("Comment", CommentSchema);
