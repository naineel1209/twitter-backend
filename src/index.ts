// @ts-nocheck
import { expressMiddleware } from "@apollo/server/express4";
import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import express from "express";
import "express-async-errors";
import { createServer } from "http";
import httpStatus from "http-status";
import "json-bigint-patch";
import morgan from "morgan";
import { initApolloServer } from "./config/apollo.config";
import logger from "./config/winston.config";
import { TWITTER_TOKEN } from "./constants/general.constants";
import CustomError from "./errors/custom.error";
import { CustomContext } from "./graphql/context";
import { authMiddleware } from "./middleware/auth.middleware";
import oauthRoutes from "./modules/GoogleAuth/google.routes";
import ngrok from "@ngrok/ngrok";
config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors<cors.CorsRequest>({
    origin: "*"
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(morgan("dev", {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));
app.use(cookieParser())

app.get("/api/v1", (req: express.Request, res: express.Response) => {
    return res.send("Hello World");
});

app.get("/api/v1/health", (req, res) => {
    return res.status(httpStatus.OK).json({
        message: "Server is running",
        status: httpStatus.OK
    });
});

app.use("/api/v1/google-oauth", oauthRoutes)


const init = async () => {
    const apolloServer = initApolloServer(server);
    await apolloServer.start();

    return apolloServer;
}

init()
    .then(async (apolloServer) => {
        //start listening to the server
        app.use("/api/v1/graphql", expressMiddleware<CustomContext>(apolloServer, {
            context: async (context) => {
                if (context.req.cookies[TWITTER_TOKEN] || context.req.headers.authorization) {
                    await authMiddleware(context.req, context.res)

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
        }));

        //register the not found route and error handler
        app.use("*", (req, res) => {
            return res.status(httpStatus.NOT_FOUND).json({
                message: "Resource not found",
                status: httpStatus.NOT_FOUND
            })
        });

        //this will handle all errors except the one thrown by the graphql server
        app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            if (error instanceof CustomError) {
                return res.status(error.statusCode).json({
                    message: error.message,
                    status: error.statusCode,
                    errorStack: (process.env.NODE_ENV === "production") ? "🤫" : error.stack
                });
            } else {
                logger.error(error.message);
                return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
                    message: "Internal server error",
                    status: httpStatus.INTERNAL_SERVER_ERROR
                });
            }
        })

        server.listen(PORT, () => {
            logger.info(`Server is running on http://localhost:${PORT}`);
        });

        console.log("Ngrok Auth Token: ", process.env.NGROK_AUTH_TOKEN);
        // ngrok.connect({
        //     addr: PORT,
        //     authtoken: process.env.NGROK_AUTH_TOKEN
        // })
        //     .then((listener) => {
        //         console.log(`Server is running on ${listener.url()}`)
        //     })

        const interruptHandler = async () => {
            await apolloServer.stop();
            server.close();
            logger.info("Server is shutting down");
            process.exit(0);
        }

        process.on("SIGINT", interruptHandler);
        process.on("SIGTERM", interruptHandler);
    })
    .catch((error) => {
        logger.error(error);
    });