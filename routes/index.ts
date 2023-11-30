import * as express from "express";
import user from "./user";
import admin from "./admin";

const router: express.Router = express.Router();

// routes for user
router.use("/user", user);

// routes for admin
router.use("/admin", admin);


export default router;