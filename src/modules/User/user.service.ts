import { PrismaClient } from "@prisma/client";
import CustomGQLError from "../../errors/custom_gql.error";
import httpStatus from "http-status";
import { CreateUserInput } from "./user.types";
import CustomError from "../../errors/custom.error";

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
        const users = await this.prisma.user.findMany();

        return (users.length > 0) ? users : [];
    }

    async getUserById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: Number(id)
            }
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
            return user;
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
}

export default UserService;