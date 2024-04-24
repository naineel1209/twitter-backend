import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import CustomGQLError from "../errors/custom.error";
import resolvers from "../graphql/resolvers";
import typeDefs from "../graphql/types";
import logger from "./winston.config";
import { config } from "dotenv";
import { GraphQLError } from "graphql";
config();

export const initApolloServer = (server: http.Server) => {
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,

        //this will handle the errors thrown in the resolvers
        formatError: (formattedError, error) => {
            if (error instanceof GraphQLError) {
                if (error.extensions?.type === "CustomGQLError") {
                    return {
                        message: error.message,
                        extensions: {
                            statusCode: error.extensions.statusCode,
                        }
                    }
                }
            }

            logger.error(error);
            return formattedError;
        },
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer: server })],
    });

    return apolloServer;
}