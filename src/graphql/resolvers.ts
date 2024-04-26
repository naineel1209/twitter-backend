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
            return await tweetsService.getTweets(context.user)
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
        }),
        updateUser: gqlUtilityErrorFunc(async (parent: any, args: any, context: any, info: any) => {
            const { id, ...restArgs } = args;

            if (context.user === null || context.access_token == null) {
                throw new CustomGQLError("Unauthorized", httpStatus.UNAUTHORIZED)
            }

            if (BigInt(context.user.id) !== id) {
                throw new CustomGQLError("Unauthorized", httpStatus.UNAUTHORIZED)
            }

            return await userService.updateUser(id, restArgs)
        }),
        updateTweet: gqlUtilityErrorFunc(async (parent: any, args: any, context: any, info: any) => {
            const { id, ...restArgs } = args;

            if (context.user === null || context.access_token == null) {
                throw new CustomGQLError("Unauthorized", httpStatus.UNAUTHORIZED)
            }

            restArgs.userId = context.user.id;

            return await tweetsService.updateTweet(id, restArgs)
        }),
        deleteTweet: gqlUtilityErrorFunc(async (parent: any, args: any, context: any, info: any) => {
            if (context.user === null || context.access_token == null) {
                throw new CustomGQLError("Unauthorized", httpStatus.UNAUTHORIZED)
            }

            return await tweetsService.deleteTweet(args.id, context.user)
        })
    },
    Tweet: {
        user: async (parent: any, args: any, context: any, info: any) => {
            return await userService.getUserById(parent.userId)
        }
    },
    User: {
        Post: async (parent: any, args: any, context: any, info: any) => {
            return await tweetsService.getTweetsByUserId(parent.id)
        }
    }
};

export default resolvers;