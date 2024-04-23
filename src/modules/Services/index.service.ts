import UserService from "../User/user.service";
import TweetsService from "../Tweets/tweets.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userService = UserService.getInstance(prisma);
const tweetsService = TweetsService.getInstance(prisma);

export {
    userService,
    tweetsService,
}