import {ApolloServer} from '@apollo/server';
import {ApolloServerPluginDrainHttpServer} from '@apollo/server/plugin/drainHttpServer';
import {config} from 'dotenv';
import {GraphQLError} from 'graphql';
import http from 'http';
import resolvers from '../graphql/resolvers';
import typeDefs from '../graphql/types';
import logger from './winston.config';
import {CustomContext} from '../graphql/context';
import CustomError from '../errors/custom.error';

config();

export const initApolloServer = (server: http.Server) => {
    return new ApolloServer<CustomContext>({
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

            if (error instanceof GraphQLError) {
                const customError = error.originalError as CustomError;

                if (customError.type === "CustomError") {
                    return {
                        message: customError.message,
                        extensions: {
                            statusCode: customError.statusCode,
                        }
                    }
                }
            }

            logger.error(error);
            return formattedError;
        },
        plugins: [ApolloServerPluginDrainHttpServer({httpServer: server})],
    });
}
