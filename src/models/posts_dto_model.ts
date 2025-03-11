class PostDto {
    _id: string;
    content: string;
    ownerId: string;
    image_uri: string;
    created_at: Date;
    like_count: number;
    comment_count: number;
    tags: string[];
    isLikedByMe: boolean; 

    constructor(post, isLikedByMe: boolean) {
        this._id = post.id.toString(); // Converting ObjectId to string if needed
        this.content = post.content;
        this.ownerId = post.ownerId.toString(); // Convert ObjectId to string
        this.image_uri = post.image_uri || "";
        this.created_at = post.created_at || new Date();
        this.like_count = post.like_count || 0;
        this.comment_count = post.comment_count || 0;
        this.tags = post.tags || [];
        this.isLikedByMe = isLikedByMe;
    }
}

export default PostDto;
