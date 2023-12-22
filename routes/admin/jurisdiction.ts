import * as express from "express";
import AdminJurisdictionController from "../../controllers/admin/AdminJurisdictionController";

const router: express.Router = express.Router();

router.post("/", AdminJurisdictionController.create);

export default router;
