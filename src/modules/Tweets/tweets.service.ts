import { PrismaClient } from "@prisma/client/extension";
import { CustomContextUser } from "../../graphql/context";
import { CreateTweetInput } from "./tweets.types";

class TweetsService {
    private static instance: TweetsService;
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    static getInstance(prisma: PrismaClient): TweetsService {
        if (!TweetsService.instance) {
            TweetsService.instance = new TweetsService(prisma);
        }

        return TweetsService.instance;
    }

    async getTweets() {
        return await this.prisma.tweet.findMany();
    }

    async getTweetsByUserId(userId: number) {
        return await this.prisma.tweet.findMany({
            where: {
                userId: userId
            }
        })
    }

    async getTweetById(id: string) {
        return await this.prisma.tweet.findUnique({
            where: {
                id: Number(id)
            }
        })
    }

    async createTweet(data: CreateTweetInput, user: CustomContextUser) {
        return await this.prisma.tweet.create({
            data: {
                ...data,
                userId: user.id,
                published: true, //publish the tweet
            }
        })
    }
}

export default TweetsService;