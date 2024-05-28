import * as express from "express";
import BarsController from "../controllers/BarsController";

const router: express.Router = express.Router();

router.post("/", BarsController.create);

export default router;