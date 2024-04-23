import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import CustomError from "../errors/custom.error";
import resolvers from "../graphql/resolvers";
import typeDefs from "../graphql/types";
import logger from "./winston.config";
import { config } from "dotenv";
config();

export const initApolloServer = (server: http.Server) => {
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        formatError: (error) => {
            if (error instanceof CustomError) {
                return {
                    message: error.message,
                    statusCode: error.statusCode,
                    statusMessage: error.statusMessage,
                    errorStack: (process.env.NODE_ENV === "development") ? error.stack : null,
                }
            }

            logger.error(error.message);
            return error;
        },
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer: server })],
    });

    return apolloServer;
}