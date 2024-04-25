import { NextFunction, Request, Response } from "express";
import { TWITTER_TOKEN } from "../constants/general.constants";
import { userService } from "../modules/Services/index.service";
import httpStatus from "http-status";
import CustomError from "../errors/custom.error";

export const authMiddleware = async (req: Request, res: Response, next?: NextFunction // next is optional here

) => {
    // @ts-ignore
    const token = req.cookies[TWITTER_TOKEN] || req.headers.authorization?.split(" ")[1] || req.headers.authorization;

    if (!token) {
        throw new CustomError("Unauthorized", httpStatus.UNAUTHORIZED);
    }

    const decodedUser = await userService.verifyToken(req, res, token);

    if (!decodedUser) { //this will not run because error will be thrown in verifyToken method
        throw new CustomError("Unauthorized", httpStatus.UNAUTHORIZED);
    }

    //@ts-ignore
    req.user = decodedUser;

    if (next) {
        next();
    }
};