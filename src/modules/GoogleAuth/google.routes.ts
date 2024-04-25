import { config } from "dotenv";
import { Router } from "express";
import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import { generateRandomUsername } from "../../utils/generate.utils";
import { userService } from "../Services/index.service";
import googleService from "./google.service";
config();

const router = Router();

//!Path - /google-oauth

router.get("/", async (req, res) => {
    const redirectUrl = await googleService.getRedirectUrl();

    return res.redirect(redirectUrl)
});

router.get("/callback", async (req, res) => {
    const { state, error, error_description, code } = req.query;

    if (error) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: error_description,
            status: httpStatus.BAD_REQUEST
        })
    }

    //1. after authorizing, we should check if the state is the same as the one we sent
    if (state !== process.env.OAUTH_STATE) {
        return res.status(httpStatus.UNAUTHORIZED).json({
            message: "Invalid state",
            status: httpStatus.UNAUTHORIZED
        })
    }

    //2. get the access token from the code
    const tokenResponse = await googleService.getTokenUsingCode(code as string);

    const { access_token, refresh_token, error: accessTokenError } = tokenResponse;

    if (accessTokenError) {
        if (accessTokenError === "token_expired") {
            return res.status(httpStatus.UNAUTHORIZED).json({
                message: "Token expired",
                status: httpStatus.UNAUTHORIZED
            })
        }
    }

    //3. get the user's profile information
    const profileResponse = await googleService.getProfileInfo(access_token);

    const { email, name, picture, sub } = profileResponse as any;

    //4. create a user in our database or if the user exists, generate a JWT token and send the payload back
    const user = await userService.createUserGoogle({
        email: email as string,
        name: name as string,
        username: generateRandomUsername(name),
        profilePic: picture as string,
        refreshToken: refresh_token as string,
        googleId: sub as string,
    });

    const jwtToken = jwt.sign({
        user,
        access_token,
    }, process.env.JWT_SECRET as string, {
        expiresIn: "1d",
    })

    res.cookie("twitter-token", jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict"
    })

    return res.status(httpStatus.OK).json({
        message: "User authenticated successfully",
        status: httpStatus.OK,
        access_token,
        refresh_token,
        user,
    })
})

export default router;