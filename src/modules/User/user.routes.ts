import { Router } from "express";
import UserController from "./user.controller";

const router = Router({ mergeParams: true });

//! PATH: /api/v1/users
router
    .route("/")
    .get(UserController.getUsers)
    .post(UserController.createUser)

export default router;