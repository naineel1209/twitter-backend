import { GraphQLBigInt, GraphQLDateTimeISO } from "graphql-scalars";
import { gqlUtilityErrorFunc } from "../errors/graphql.errors";
import { tweetsService, userService } from "../modules/Services/index.service";
import { CreateUserInput } from "../modules/User/user.types";

const resolvers = {
    Date: GraphQLDateTimeISO,
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
            return await userService.createUser(args)
        }),
    },
};

export default resolvers;