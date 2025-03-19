import mongoose from "mongoose";

export interface ILike {
    postId: mongoose.Schema.Types.ObjectId;
    ownerId: mongoose.Schema.Types.ObjectId;
}

const LikeSchema = new mongoose.Schema<ILike>({
    postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Posts',
            required: true
    },
    ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users',
            required: true
    },
});

export const likeModel = mongoose.model<ILike>("Like", LikeSchema);
