import * as express from "express";
import OrderController from "../controllers/OrderController";

const router: express.Router = express.Router();

router.post("/", OrderController.createOrder);

export default router;