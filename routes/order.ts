import * as express from "express";
import * as passport from "passport";
import OrderController from "../controllers/OrderController";

const router: express.Router = express.Router();

router.get("/", OrderController.getList);
router.post("/", passport.authenticate("jwt", { session: false }), OrderController.create);

export default router;