class PostDto {
    _id: string;
    content: string;
    ownerId: string;
    imageUri: string;
    createdAt: Date;
    likeCount: number;
    commentCount: number;
    tags: string[];
    isLikedByMe: boolean; 

    constructor(post, isLikedByMe: boolean) {
        this._id = post.id.toString(); // Converting ObjectId to string if needed
        this.content = post.content;
        this.ownerId = post.ownerId.toString(); // Convert ObjectId to string
        this.imageUri = post.image_uri || "";
        this.createdAt = post.created_at || new Date();
        this.likeCount = post.like_count || 0;
        this.commentCount = post.comment_count || 0;
        this.tags = post.tags || [];
        this.isLikedByMe = isLikedByMe;
    }
}

export default PostDto;
