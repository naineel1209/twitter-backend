import axios from "axios";
import { config } from "dotenv";
import CustomError from "../../errors/custom.error";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
config();

class GoogleService {
    private static instance: GoogleService;

    constructor() { }

    static getInstance(): GoogleService {
        if (!GoogleService.instance) {
            GoogleService.instance = new GoogleService(); // this is a singleton instance of the controller class
        }

        return GoogleService.instance;
    }

    async getTokenUsingCode(code: string) {
        try {
            const tokenResponse = await axios.post(process.env.OAUTH_TOKEN_ENDPOINT as string, {
                code,
                client_id: process.env.OAUTH_CLIENT_ID,
                client_secret: process.env.OAUTH_CLIENT_SECRET,
                redirect_uri: process.env.OAUTH_REDIRECT_URI,
                grant_type: 'authorization_code',
                expires_in: 6 * 60 * 60 // 6 hours
            });

            return tokenResponse.data;
        } catch (error) {
            throw new CustomError('Failed to get token using code', httpStatus.INTERNAL_SERVER_ERROR);
        }
    };

    async checkTokenAlive(accessToken: string | JwtPayload) {
        try {
            const { data } = await axios.get(process.env.OAUTH_CHECK_TOKEN_ENDPOINT as string, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            if (data.error) {
                throw new CustomError('Token is not valid', httpStatus.UNAUTHORIZED);
            } else {
                return true;
            };
        } catch (error) {
            throw new CustomError('Token is not valid', httpStatus.UNAUTHORIZED);
        }
    }

    async refreshToken(refreshToken: string) {
        try {
            const tokenResponse = await axios.post(process.env.OAUTH_TOKEN_ENDPOINT as string, {
                refresh_token: refreshToken,
                client_id: process.env.OAUTH_CLIENT_ID,
                client_secret: process.env.OAUTH_CLIENT_SECRET,
                grant_type: 'refresh_token'
            }); //this will return a new access token

            return tokenResponse.data;
        } catch (error) {
            throw new CustomError('Failed to refresh token', httpStatus.INTERNAL_SERVER_ERROR);
        }
    };

    async revokeToken(refreshToken: string) {
        try {
            await axios.post(process.env.OAUTH_REVOKE_ENDPOINT as string, {
                token: refreshToken,
                client_id: process.env.OAUTH_CLIENT_ID,
                client_secret: process.env.OAUTH_CLIENT_SECRET
            })
        } catch (error) {
            throw new CustomError('Failed to revoke token', httpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getProfileInfo(accessToken: string) {
        try {
            const profileResponse = await axios.get(process.env.OAUTH_PROFILE_ENDPOINT as string, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            return profileResponse.data;
        } catch (error) {
            throw new CustomError('Failed to get profile info', httpStatus.INTERNAL_SERVER_ERROR);
        }
    };

    async getRedirectUrl() {
        const oauthParams = {
            client_id: process.env.OAUTH_CLIENT_ID, // Your Google Client ID
            redirect_uri: process.env.OAUTH_REDIRECT_URI, // Your application's OAuth callback URL
            response_type: 'code', // Use 'token' for implicit grant, 'code' for authorization code flow
            scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid', // Concatenated scopes
            include_granted_scopes: 'true', // Optional, but good practice
            state: process.env.OAUTH_STATE, // Optional, helps with security against CSRF
            access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token) 
        };

        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(oauthParams)) {
            searchParams.append(key, (value as string))
        }

        return `${process.env.OAUTH_ENDPOINT}?${searchParams.toString()}`;
    }
};

export default GoogleService.getInstance();