import mongoose from "mongoose";

export interface ILike {
    postId: string;
    ownerId: string;
}

const LikeSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

export const likeModel = mongoose.model<ILike>("Like", LikeSchema);
