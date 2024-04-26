import { PrismaClient } from "@prisma/client/extension";
import { CustomContextUser } from "../../graphql/context";
import { CreateTweetInput, UpdateTweetInput } from "./tweets.types";
import CustomGQLError from "../../errors/custom_gql.error";
import httpStatus from "http-status";

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

    async getTweets(currentUser: CustomContextUser) {
        return await this.prisma.tweet.findMany({
            where: {
                published: true,
                isDeleted: false,
                userId: {
                    not: currentUser.id
                }
            }
        });
    }

    async getTweetsByUserId(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
                isDeleted: false,
            },
            include: {
                Post: true
            }
        })

        return user?.Post.filter((ele: any) => {
            return ele.published === true && ele.isDeleted === false
        }) || [];
    }

    async getTweetById(id: string) {
        return await this.prisma.tweet.findUnique({
            where: {
                id: Number(id),
                isDeleted: false,
                published: true
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

    async updateTweet(id: string, data: UpdateTweetInput) {
        const tweet = await this.prisma.tweet.findUnique({
            where: {
                id: Number(id),
                isDeleted: false,
            },
            include: {
                user: true
            }
        })

        if (!tweet) {
            throw new CustomGQLError("Tweet not found", httpStatus.NOT_FOUND);
        }

        if (tweet.userId !== BigInt(data.userId)) {
            throw new CustomGQLError("Unauthorized", httpStatus.UNAUTHORIZED);
        }

        const { userId, ...restArgs } = data;

        return await this.prisma.tweet.update({
            where: {
                id: Number(id)
            },
            data: {
                ...restArgs
            }
        })
    }

    async deleteTweet(id: string, user: CustomContextUser) {
        const tweet = await this.prisma.tweet.findUnique({
            where: {
                id: Number(id),
                isDeleted: false,
            }
        });

        if (!tweet) {
            throw new CustomGQLError("Tweet not found", httpStatus.NOT_FOUND);
        }

        if (BigInt(user.id) !== tweet.userId) {
            throw new CustomGQLError("Unauthorized", httpStatus.UNAUTHORIZED);
        }

        return await this.prisma.tweet.update({
            where: {
                id: Number(id)
            },
            data: {
                isDeleted: true
            }
        })
    }
}

export default TweetsService;