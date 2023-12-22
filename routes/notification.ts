import * as express from "express";
import NotificationController from "../controllers/NotificationController";

const router: express.Router = express.Router();

router.post("/", NotificationController.create);

export default router;