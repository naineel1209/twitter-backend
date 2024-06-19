import { config } from "dotenv";
import { Router } from "express";
import httpStatus from "http-status";
import { ACCESS_TOKEN_EXPIRED_ERROR, TWITTER_TOKEN } from "../../constants/general.constants";
import { generateRandomUsername } from "../../utils/generate.utils";
import { userService } from "../Services/index.service";
import googleService from "./google.service";
import { authMiddleware } from "../../middleware/auth.middleware";
config();
interface RequestWithUser extends Request {
    user: { [key: string]: any };
}

const router = Router();

//!Path - /api/v1/google-oauth

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
        if (accessTokenError === ACCESS_TOKEN_EXPIRED_ERROR) {
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

    const jwtToken = await userService.generateToken({ user, access_token: access_token as string })

    res.cookie(TWITTER_TOKEN, jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 //expires in 1 minute
    })

    return res.status(httpStatus.OK).json({
        message: "User authenticated successfully",
        status: httpStatus.OK,
        jwtToken,
        access_token,
        refresh_token,
        user,
    })
});

router.get("/logout", authMiddleware, async (req: any, res) => {
    //revoke the token from the google server
    //@ts-ignore
    await googleService.revokeToken(req.user?.user.refreshToken as string)

    //clear the token from the database
    const user = await userService.clearToken(req.user?.user.id);

    //clear the token from the client
    res.clearCookie(TWITTER_TOKEN);

    //send a response
    return res.status(httpStatus.OK).json({
        message: "User logged out successfully",
        status: httpStatus.OK
    })
})

export default router;
