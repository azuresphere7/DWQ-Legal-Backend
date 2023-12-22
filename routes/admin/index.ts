import * as express from "express";
import user from "./user";
import jurisdiction from "./jurisdiction";

const router: express.Router = express.Router();

router.use("/user", user);
router.use("/jurisdiction", jurisdiction);

export default router;