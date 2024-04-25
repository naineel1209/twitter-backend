import { GraphQLBigInt, GraphQLDate, GraphQLDateTimeISO } from "graphql-scalars";
import { gqlUtilityErrorFunc } from "../utils/gql_error.utils";
import { tweetsService, userService } from "../modules/Services/index.service";
import { CreateUserInput } from "../modules/User/user.types";
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
        createUser: gqlUtilityErrorFunc(async (parent: any, args: CreateUserInput, context: any, info: any) => {
            if (context.user === null) {
                throw new CustomGQLError("You need to be authenticated to perform this action", httpStatus.UNAUTHORIZED)
            } else {
                return await userService.createUser(args)
            }
        }),
    },
};

export default resolvers;