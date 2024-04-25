import { GraphQLBigInt, GraphQLDate } from "graphql-scalars";
import { tweetsService, userService } from "../modules/Services/index.service";
import { CreateUserInput } from "../modules/User/user.types";
import { gqlUtilityErrorFunc } from "../utils/gql_error.utils";
import { CustomContext } from "./context";
import CustomGQLError from "../errors/custom_gql.error";
import httpStatus from "http-status";

const resolvers = {
    Date: GraphQLDate,
    BigInt: GraphQLBigInt,

    Query: {
        getUsers: gqlUtilityErrorFunc(async (parent: any, args: any, context: any, info: any) => {
            return await userService.getUsers()
        }),
        getUser: gqlUtilityErrorFunc(async (parent: any, args: any, context: any, info: any) => {
            return await userService.getUserById(args.id)
        }),
        getTweets: gqlUtilityErrorFunc(async (parent: any, args: any, context: any, info: any) => {
            return await tweetsService.getTweets()
        }),
        getTweet: gqlUtilityErrorFunc(async (parent: any, args: any, context: any, info: any) => {
            return await tweetsService.getTweetById(args.id)
        }),
    },
    Mutation: {
        createUser: gqlUtilityErrorFunc(async (parent: any, args: CreateUserInput, context: CustomContext, info: any) => {
            return await userService.createUser(args);
        }),
        createTweet: gqlUtilityErrorFunc(async (parent: any, args: any, context: CustomContext, info: any) => {
            //check if the user is authenticated
            if (context.user === null || context.access_token == null) {
                throw new CustomGQLError("Unauthorized", httpStatus.UNAUTHORIZED)
            } else {
                return await tweetsService.createTweet(args, context.user)
            }
        })
    },
    Tweet: {
        user: async (parent: any, args: any, context: any, info: any) => {
            return await userService.getUserById(parent.userId)
        }
    },
    User: {
        tweets: async (parent: any, args: any, context: any, info: any) => {
            return await tweetsService.getTweetsByUserId(parent.id)
        }
    }
};

export default resolvers;