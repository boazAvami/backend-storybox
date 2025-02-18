import mongoose from 'mongoose';

export interface IPost {
    title: string;
    content: string;
    ownerId: string;
  }

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: String,
    ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
    },
});

export const postModel = mongoose.model<IPost>("Posts", postSchema);