import * as express from "express";
import AdminCourtController from "../../controllers/admin/AdminCourtController";

const router: express.Router = express.Router();

router.post("/", AdminCourtController.create);

export default router;
