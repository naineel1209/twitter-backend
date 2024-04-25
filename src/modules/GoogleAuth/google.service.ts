import axios from "axios";
import { config } from "dotenv";
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
        const tokenResponse = await axios.post(process.env.OAUTH_TOKEN_ENDPOINT as string, {
            code,
            client_id: process.env.OAUTH_CLIENT_ID,
            client_secret: process.env.OAUTH_CLIENT_SECRET,
            redirect_uri: process.env.OAUTH_REDIRECT_URI,
            grant_type: 'authorization_code'
        });

        return tokenResponse.data;
    };

    async getProfileInfo(accessToken: string) {
        const profileResponse = await axios.get(process.env.OAUTH_PROFILE_ENDPOINT as string, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        return profileResponse.data;
    };

    async refreshToken(refreshToken: string) {
        const tokenResponse = await axios.post(process.env.OAUTH_TOKEN_ENDPOINT as string, {
            refresh_token: refreshToken,
            client_id: process.env.OAUTH_CLIENT_ID,
            client_secret: process.env.OAUTH_CLIENT_SECRET,
            grant_type: 'refresh_token'
        }); //this will return a new access token

        return tokenResponse.data;
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