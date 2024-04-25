import { GraphQLError, GraphQLErrorExtensions } from "graphql";

class CustomGQLError extends GraphQLError {
    public extensions: GraphQLErrorExtensions;

    constructor(public message: string, public statusCode: number, extensions: GraphQLErrorExtensions = {}) {
        super(message);
        this.statusCode = statusCode;
        this.extensions = {
            ...extensions,
            type: "CustomGQLError",
            statusCode,
        }
    }
}

export default CustomGQLError;