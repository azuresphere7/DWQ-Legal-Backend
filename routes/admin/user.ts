import * as express from "express";
import AdminUserController from "../../controllers/admin/AdminUserController";

const router: express.Router = express.Router();

router.get("/", AdminUserController.getList);
router.put("/", AdminUserController.updateItem);
router.delete("/", AdminUserController.deleteItem);

export default router;