import { Router } from "express";
import userRoutes from "./modules/User/user.routes";

const router = Router({ mergeParams: true });

//! PATH: /api/v1/
router
    .use("/users", userRoutes)

export default router;  