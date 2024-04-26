import { PrismaClient } from "@prisma/client";
import httpStatus from "http-status";
import CustomError from "../../errors/custom.error";
import CustomGQLError from "../../errors/custom_gql.error";
import { CreateUserInput, UpdateUserInput } from "./user.types";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "dotenv";
import googleService from "../GoogleAuth/google.service";
import { Request, Response } from "express";
import { TWITTER_TOKEN } from "../../constants/general.constants";
import ts from "typescript";
config();

class UserService {
    private static instance: UserService;
    private prisma: PrismaClient;


    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    static getInstance(prisma: PrismaClient): UserService {
        if (!UserService.instance) {
            UserService.instance = new UserService(prisma); // this is a singleton instance of the controller class
        }

        return UserService.instance;
    }

    async getUsers() {
        const users = await this.prisma.user.findMany({
            where: {
                isDeleted: false
            }
        });

        return (users.length > 0) ? users : [];
    }

    async getUserById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: Number(id),
                isDeleted: false
            },
        });

        if (!user) {
            throw new CustomGQLError("User not found", httpStatus.NOT_FOUND, {
                message: "User not found",
            });
        }

        return user;
    }

    async createUserGoogle(data: CreateUserInput) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: data.email
            }
        });

        if (user) {
            //update the refresh-token for the user
            const updatedUser = await this.prisma.user.update({
                where: {
                    id: user.id,
                    isDeleted: false,
                },
                data: {
                    refreshToken: data.refreshToken
                }
            })

            if (!updatedUser) {
                throw new CustomError("User not updated", httpStatus.INTERNAL_SERVER_ERROR);
            }

            return updatedUser;
        }

        const newUser = await this.prisma.user.create({
            data: {
                ...data,
            }
        })

        if (!newUser) {
            throw new CustomError("User not created", httpStatus.INTERNAL_SERVER_ERROR)
        }

        return newUser;
    }

    async createUser(data: CreateUserInput) {
        const user = await this.prisma.user.create({
            data: {
                ...data,
            }
        })

        if (!user) {
            throw new CustomGQLError("User not created", httpStatus.INTERNAL_SERVER_ERROR, {
                message: "User not created",
            });
        }

        return user;
    }

    async updateUser(id: bigint, data: UpdateUserInput) {
        const user = await this.prisma.user.findUnique({
            where: {
                id,
                isDeleted: false
            }
        });

        if (!user) {
            throw new CustomGQLError("User not found", httpStatus.NOT_FOUND, {
                message: "User not found",
            });
        }

        const updatedUser = await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                ...data
            }
        })

        return updatedUser;
    }

    //! DO NOT USE THIS METHOD IN PRODUCTION
    async deleteUser(id: bigint) {
        const user = await this.prisma.user.findUnique({
            where: {
                id,
                isDeleted: false
            }
        });

        if (!user) {
            throw new CustomGQLError("User not found", httpStatus.NOT_FOUND, {
                message: "User not found",
            });
        }

        const deletedUser = await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                isDeleted: true
            }
        })

        return deletedUser;
    }

    async generateToken(data: { user: any, access_token: string }): Promise<string> {
        const { user, access_token } = data;

        const token = jwt.sign({
            user,
            access_token
        }, process.env.JWT_SECRET as string, {
            expiresIn: "6h" //expires in 6 hours
        });

        return token;
    }

    async verifyToken(req: Request, res: Response, token: string): Promise<any> {
        try {
            const verifiedUser = jwt.verify(token, process.env.JWT_SECRET as string);

            //tokenAlive check - 
            await googleService.checkTokenAlive((verifiedUser as any)["access_token"]);

            return verifiedUser;
        } catch (error) {
            try {
                if (error instanceof Error && error.message === "jwt expired") {
                    //get the refresh token from the database for the user
                    const decodedUser = jwt.decode(token) as any;
                    const user = await this.prisma.user.findUnique({
                        where: {
                            id: decodedUser.user.id
                        }
                    });

                    if (!user) {
                        throw new CustomError("User not found", httpStatus.NOT_FOUND);
                    }

                    if (!user.refreshToken) {
                        throw new CustomError("User not authenticated", httpStatus.UNAUTHORIZED);
                    }

                    //generate a new access token using the refresh token from the database
                    const newAccessToken = await googleService.refreshToken(user.refreshToken);

                    const newToken = jwt.sign({
                        user,
                        access_token: newAccessToken.access_token
                    }, process.env.JWT_SECRET as string, {
                        expiresIn: "6h"
                    });

                    // @ts-ignore
                    res.cookie(TWITTER_TOKEN, newToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "strict",
                        maxAge: 1000 * 60 * 60 * 24 * 7 //expires in 7 days
                    });

                    return {
                        user,
                        access_token: newAccessToken.access_token
                    }
                }
            } catch (err) {
                throw err
            }

            throw error;
        }
    }

    async clearToken(id: number) {
        const user = await this.prisma.user.findUnique({
            where: {
                id
            }
        });

        if (!user) {
            throw new CustomError("User not found", httpStatus.NOT_FOUND);
        }

        const updatedUser = await this.prisma.user.update({
            where: {
                id
            },
            data: {
                refreshToken: null
            }
        });

        return updatedUser;
    }
}

export default UserService;