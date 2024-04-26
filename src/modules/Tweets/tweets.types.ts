export interface CreateTweetInput {
    title: string;
    content: string;
}

export interface UpdateTweetInput {
    userId: number;
    title?: string;
    content?: string;
    published?: boolean;
    impressions?: number;
}