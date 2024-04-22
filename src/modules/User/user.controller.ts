import { Request, Response } from "express";
import UserService from "./user.service";
import httpStatus from "http-status";

class UserController {
    private static instance: UserController; // singleton instance of the controller class

    constructor(private userService: UserService) {
        this.userService = userService;
    }

    public static getInstance(): UserController { // singleton instance of the controller class
        if (!UserController.instance) {
            UserController.instance = new UserController(new UserService());
        }

        return UserController.instance;
    }

    createUser = async (req: Request, res: Response) => {
        const user = await this.userService.createUser();

        return res.status(httpStatus.CREATED).json(user);
    }

    getUsers = async (req: Request, res: Response) => {
        console.log(this)
        const user = await this.userService.getUser();

        return res.status(httpStatus.OK).json(user);
    }
}

export default UserController.getInstance(); // this is a singleton instance of the controller class