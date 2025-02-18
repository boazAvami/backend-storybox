import { IPost } from "../models/posts_model";
import { IUser } from "../models/users_model";

export type User = IUser & {
    accessToken?: string
};

export type Post = IPost & {
    _id: string
};