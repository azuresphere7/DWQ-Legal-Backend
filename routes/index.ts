import * as express from "express";

import user from "./user";
import order from "./order";
import admin from "./admin";

const router: express.Router = express.Router();

// routes for user
router.use("/user", user);
router.use("/order", order);

// routes for admin
router.use("/admin", admin);

export default router;