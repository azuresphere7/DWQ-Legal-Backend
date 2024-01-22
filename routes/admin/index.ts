import * as express from "express";
import user from "./user";
import court from "./court";

const router: express.Router = express.Router();

router.use("/user", user);
router.use("/court", court);

export default router;