import httpStatus from "http-status";
import CustomGQLError from "../errors/custom_gql.error";

type ResolverFunc = (parent: any, args: any, context: any, info: any) => any;

export const gqlUtilityErrorFunc = (resolverFunc: ResolverFunc) => {
    return async (parent: any, args: any, context: any, info: any) => {
        try {
            return await resolverFunc(parent, args, context, info);
        } catch (err: unknown) {
            if (err instanceof CustomGQLError) {
                throw err;
            } else if (err instanceof Error) {
                throw new CustomGQLError(err.message, httpStatus.INTERNAL_SERVER_ERROR);
            } else {
                throw new CustomGQLError("An error occurred", httpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
};