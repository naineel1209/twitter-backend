export interface CustomContextUser {
    id: string;
    email: string;
    password?: string;
    googleId?: string;
    name: string;
    username: string;
    profilePic?: string;
    bio?: string;
    dob?: string;
    refreshToken?: string;
    createdAt: string;
    isDeleted: boolean;
}

export interface CustomContext {
    user: CustomContextUser | null;
    access_token: string | null;
}