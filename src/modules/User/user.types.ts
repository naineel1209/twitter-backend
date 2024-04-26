export interface CreateUserInput {
    email: string;
    password?: string;
    username: string;
    name?: string;
    profilePic?: string;
    bio?: string;
    dob?: string;
    refreshToken?: string;
    googleId?: string;
}

export interface UpdateUserInput {
    email?: string;
    password?: string;
    username?: string;
    name?: string;
    profilePic?: string;
    bio?: string;
    dob?: string;
    refreshToken?: string;
    googleId?: string;
}

export interface IUser {
    id: string;
    email: string;
    password: string;
    username: string;
    name?: string;
    profilePic?: string;
    bio?: string;
    dob?: string;
    createdAt: string;
    tweets: ITweet[];
}

export interface ITweet {
    id: string;
    title: string;
    content?: string;
    published: boolean;
    impressions: number;
    createdAt: string;
    userId: string;
    user: IUser;
}