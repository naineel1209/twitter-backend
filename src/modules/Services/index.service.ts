import prismaClient from "../../config/prisma.config";
import TweetsService from "../Tweets/tweets.service";
import UserService from "../User/user.service";

const userService = UserService.getInstance(prismaClient);
const tweetsService = TweetsService.getInstance(prismaClient);

export {
    tweetsService, userService
};
