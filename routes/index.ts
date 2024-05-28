import * as express from "express";

import user from "./user";
import bars from "./bars";
import order from "./order";
import admin from "./admin";
import notification from "./notification";

const router: express.Router = express.Router();

// routes for user
router.use("/user", user);
router.use("/bars", bars);
router.use("/order", order);
router.use("/notification", notification);

// routes for admin
router.use("/admin", admin);

export default router;