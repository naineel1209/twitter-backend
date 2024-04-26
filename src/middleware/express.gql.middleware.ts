import { expressMiddleware } from "@apollo/server/express4";
import { NextFunction, Request, Response } from "express";
import { CustomContext } from "../graphql/context";
import { TWITTER_TOKEN } from "../constants/general.constants";
import { authMiddleware } from "./auth.middleware";
import { ApolloServer } from "@apollo/server";

export const expressGqlMiddleware = (apolloServer: ApolloServer<CustomContext>) => {
    return expressMiddleware<CustomContext>(apolloServer, {
        context: async (context) => {
            if (context.req.cookies[TWITTER_TOKEN] || context.req.headers.authorization) {
                await authMiddleware(context.req, context.res);

                return {
                    //@ts-ignore
                    user: context.req.user?.user,
                    //@ts-ignore
                    access_token: context.req.user?.access_token
                }
            } else {
                return {
                    user: null,
                    access_token: null
                }
            }
        }
    })
}