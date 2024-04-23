import { PrismaClient } from "@prisma/client/extension";

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

    async getTweetById(id: string) {
        return await this.prisma.tweet.findUnique({
            where: {
                id: Number(id)
            }
        })
    }
}

export default TweetsService;